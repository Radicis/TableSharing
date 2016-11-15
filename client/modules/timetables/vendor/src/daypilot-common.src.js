/*
Copyright © 2016 Annpoint, s.r.o.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

-------------------------------------------------------------------------

NOTE: Reuse requires the following acknowledgement (see also NOTICE):
This product includes DayPilot (http://www.daypilot.org) developed by Annpoint, s.r.o.
*/

if (typeof DayPilot === 'undefined') {
    var DayPilot = {};
}

(function() {

    if (typeof DayPilot.$ !== 'undefined') {
        return;
    }

    if (typeof DayPilot.Global === "undefined") {
        DayPilot.Global = {};
    }

    DayPilot.$ = function(id) {
      return document.getElementById(id);    
    };

    DayPilot.isKhtml = (navigator && navigator.userAgent && navigator.userAgent.indexOf("KHTML") !== -1);
    DayPilot.isIE = (navigator && navigator.userAgent && navigator.userAgent.indexOf("MSIE") !== -1);

    DayPilot.mo2 = function (target, ev){
        ev = ev || window.event;

        // IE
        if (typeof(ev.offsetX) !== 'undefined') {
        
            var coords = {x: ev.offsetX + 1, y:ev.offsetY  + 1};
            //document.title = "ie/doc:" + document.documentElement.scrollTop;
            
            if (!target) {
                return coords;
            }
            
            var current = ev.srcElement;
            while (current && current !== target) {
                if (current.tagName !== 'SPAN') { // hack for DayPilotMonth/IE, hour info on the right side of an event
		            coords.x += current.offsetLeft;
		            if (current.offsetTop > 0) {  // hack for http://forums.daypilot.org/Topic.aspx/879/move_event_bug
		                coords.y += current.offsetTop - current.scrollTop;
		            }
		        }

		        current = current.offsetParent;
	        }
    	    
	        if (current) {
		        return coords;	
	        }
	        return null;
        }

        // FF
        if (typeof(ev.layerX) !== 'undefined') {
            
            var coords = {x:ev.layerX, y:ev.layerY, src: ev.target};

            if (!target) {
                return coords;
            }
	        var current = ev.target;
    	    
	        // find the positioned offsetParent, the layerX reference
	        while (current && current.style.position !== 'absolute' && current.style.position !== 'relative') {
	            current = current.parentNode;
	            if (DayPilot.isKhtml) { // hack for KHTML (Safari and Google Chrome), used in DPC/event moving
	                coords.y += current.scrollTop;
	            }
	        }
    	    
	        while (current && current !== target) {
		        coords.x += current.offsetLeft;
		        coords.y += current.offsetTop - current.scrollTop;
		        current = current.offsetParent;
	        }
	        if (current) {
		        return coords;	
	        }
    	    
	        return null;
        }
        
        return null;
    };

    // mouse offset relative to the specified target
    DayPilot.mo3 = function (target, ev, noscroll){
        ev = ev || window.event;

        if(typeof(ev.pageX) !== 'undefined') {
            var abs = DayPilot.abs(target, noscroll);
            var coords = { x: ev.pageX - abs.x, y: ev.pageY - abs.y };
            return coords;
        }
        
        return DayPilot.mo2(target, ev);

    };

    DayPilot.browser = {};

    DayPilot.browser.ie9 = (function() {
        var div = document.createElement("div");
        div.innerHTML = "<!--[if IE 9]><i></i><![endif]-->";
        var result = (div.getElementsByTagName("i").length === 1);
        return result;
    })();
    DayPilot.browser.ielt9 = (function() {
        var div = document.createElement("div");
        div.innerHTML = "<!--[if lt IE 9]><i></i><![endif]-->";
        var result = (div.getElementsByTagName("i").length === 1);
        return result;
    })();

    // absolute element position on page
    DayPilot.abs = function (element, visible) {
        if (!element) {
            return null;
        }
        
        var r = { 
            x: element.offsetLeft, 
            y: element.offsetTop,
            w: element.clientWidth,
            h: element.clientHeight,
            toString: function() {
                return "x:" + this.x + " y:" + this.y + " w:" + this.w + " h:" + this.h;
            }
        };
        
        if (element.getBoundingClientRect) {
            var b = element.getBoundingClientRect();
            r.x = b.left;
            r.y = b.top;
            
            var d = DayPilot.doc();
            r.x -= d.clientLeft || 0;
            r.y -= d.clientTop || 0;

            var pageOffset = DayPilot.pageOffset();
            r.x += pageOffset.x;
            r.y += pageOffset.y;
            
            if (visible) {
                // use diff, absOffsetBased is not as accurate
                var full = DayPilot.absOffsetBased(element, false);
                var visible = DayPilot.absOffsetBased(element, true);
                
                r.x += visible.x - full.x;
                r.y += visible.y - full.y;
                r.w = visible.w;
                r.h = visible.h;
            }
            
            return r;
        }
        else {
            return DayPilot.absOffsetBased(element, visible);
        }
        
    };

    // old implementation of absolute position
    // problems with adjacent float and margin-left in IE7
    // still the best way to calculate the visible part of the element
    DayPilot.absOffsetBased = function(element, visible) {
        var r = { 
            x: element.offsetLeft, 
            y: element.offsetTop,
            w: element.clientWidth,
            h: element.clientHeight,
            toString: function() {
                return "x:" + this.x + " y:" + this.y + " w:" + this.w + " h:" + this.h;
            }
        };
        
        while (element.offsetParent) {
            element = element.offsetParent;   
            
            r.x -= element.scrollLeft;
            r.y -= element.scrollTop;

            if (visible) {  // calculates the visible part
                if (r.x < 0) {
                    r.w += r.x; // decrease width
                    r.x = 0;
                }

                if (r.y < 0) {
                    r.h += r.y; // decrease height
                    r.y = 0;
                }

                if (element.scrollLeft > 0 && r.x + r.w > element.clientWidth) {
                    r.w -= r.x + r.w - element.clientWidth;
                }
                
                if (element.scrollTop && r.y + r.h > element.clientHeight) {
                    r.h -= r.y + r.h - element.clientHeight;
                }
            }
            
            r.x += element.offsetLeft;
            r.y += element.offsetTop;
            
        }
        
        var pageOffset = DayPilot.pageOffset();
        r.x += pageOffset.x;
        r.y += pageOffset.y;
        
        return r;
    };
    
    DayPilot.sheet = function() {
        var style = document.createElement("style");
        style.setAttribute("type", "text/css");
        if (!style.styleSheet) {   // ie
            style.appendChild(document.createTextNode(""));
        }

        var h = document.head || document.getElementsByTagName('head')[0];
        h.appendChild(style);

        var oldStyle = !! style.styleSheet; // old ie

        var sheet = {};
        sheet.rules = [];
        sheet.commit = function() {
            if (oldStyle) {
                style.styleSheet.cssText = this.rules.join("\n");
            }
        };

        sheet.add = function(selector, rules, index) {
            if (oldStyle) { 
                this.rules.push(selector + "{" + rules + "\u007d");
                return;
            }
            if(style.sheet.insertRule) {
                if (typeof index === "undefined") {
                    index = style.sheet.cssRules.length;
                }
                style.sheet.insertRule(selector + "{" + rules + "\u007d", index);
            }
            else if (style.sheet.addRule) {
                style.sheet.addRule(selector, rules, index);
            }
        };
        return sheet;
    };

    // register the default themes
    (function() {
        if (DayPilot.Global.defaultCss) {
            return;
        }

        var sheet = DayPilot.sheet();

        sheet.add(".calendar_default_main", "border: 1px solid #c0c0c0;font-family: Tahoma, Arial, sans-serif; font-size: 12px;");
        sheet.add(".calendar_default_main *, .calendar_default_main *:before, .calendar_default_main *:after", "box-sizing: content-box;");  // bootstrap
        sheet.add(".calendar_default_rowheader_inner,.calendar_default_cornerright_inner,.calendar_default_corner_inner,.calendar_default_colheader_inner,.calendar_default_alldayheader_inner", "color: #333;background: #f3f3f3;");
        sheet.add(".calendar_default_cornerright_inner", "position: absolute;top: 0px;left: 0px;bottom: 0px;right: 0px;	border-bottom: 1px solid #c0c0c0;");
        sheet.add(".calendar_default_rowheader_inner", "font-size: 16pt;text-align: right; position: absolute;top: 0px;left: 0px;bottom: 0px;right: 0px;border-right: 1px solid #c0c0c0;border-bottom: 1px solid #c0c0c0;");
        sheet.add(".calendar_default_corner_inner", "position: absolute;top: 0px;left: 0px;bottom: 0px;right: 0px;border-right: 1px solid #c0c0c0;border-bottom: 1px solid #c0c0c0;");
        sheet.add(".calendar_default_rowheader_minutes", "font-size:10px;vertical-align: super;padding-left: 2px;padding-right: 2px;");
        sheet.add(".calendar_default_colheader_inner", "text-align: center; position: absolute;top: 0px;left: 0px;bottom: 0px;right: 0px;border-right: 1px solid #c0c0c0;border-bottom: 1px solid #c0c0c0;");
        sheet.add(".calendar_default_cell_inner", "position: absolute;top: 0px;left: 0px;bottom: 0px;right: 0px;border-right: 1px solid #ddd;border-bottom: 1px solid #ddd; background: #f9f9f9;");
        sheet.add(".calendar_default_cell_business .calendar_default_cell_inner", "background: #fff");
        sheet.add(".calendar_default_alldayheader_inner", "text-align: center;position: absolute;top: 0px;left: 0px;bottom: 0px;right: 0px;border-right: 1px solid #c0c0c0;border-bottom: 1px solid #c0c0c0;");
        sheet.add(".calendar_default_message", "opacity: 0.9;filter: alpha(opacity=90);	padding: 10px; color: #ffffff;background: #ffa216;");
        sheet.add(".calendar_default_alldayevent_inner,.calendar_default_event_inner", 'color: #666; border: 1px solid #999;'); // border-top: 4px solid #1066a8;
        sheet.add(".calendar_default_event_bar", "top: 0px;bottom: 0px;left: 0px;width: 4px;background-color: #9dc8e8;");
        sheet.add(".calendar_default_event_bar_inner", "position: absolute;width: 4px;background-color: #1066a8;");
        sheet.add(".calendar_default_alldayevent_inner,.calendar_default_event_inner", 'background: #fff;background: -webkit-gradient(linear, left top, left bottom, from(#ffffff), to(#eeeeee));background: -webkit-linear-gradient(top, #ffffff 0%, #eeeeee);background: -moz-linear-gradient(top, #ffffff 0%, #eeeeee);background: -ms-linear-gradient(top, #ffffff 0%, #eeeeee);background: -o-linear-gradient(top, #ffffff 0%, #eeeeee);background: linear-gradient(top, #ffffff 0%, #eeeeee);filter: progid:DXImageTransform.Microsoft.Gradient(startColorStr="#ffffff", endColorStr="#eeeeee");');
        sheet.add(".calendar_default_selected .calendar_default_event_inner", "background: #ddd;");
        sheet.add(".calendar_default_alldayevent_inner", "position: absolute;top: 2px;bottom: 2px;left: 2px;right: 2px;padding: 2px;margin-right: 1px;font-size: 12px;");
        sheet.add(".calendar_default_event_withheader .calendar_default_event_inner", "padding-top: 15px;");
        sheet.add(".calendar_default_event", "cursor: default;");
        sheet.add(".calendar_default_event_inner", "position: absolute;overflow: hidden;top: 0px;bottom: 0px;left: 0px;right: 0px;padding: 2px 2px 2px 6px;font-size: 12px;");
        sheet.add(".calendar_default_shadow_inner", "background-color: #666666;	opacity: 0.5;filter: alpha(opacity=50);height: 100%;");

        sheet.add(".scheduler_default_selected .scheduler_default_event_inner", "background: #ddd;");
        sheet.add(".scheduler_default_main", "border: 1px solid #c0c0c0;font-family: Tahoma, Arial, Helvetica, sans-serif; font-size: 12px;");
        sheet.add(".scheduler_default_timeheader", "cursor: default;color: #333;");
        sheet.add(".scheduler_default_message", "opacity: 0.9;filter: alpha(opacity=90);padding: 10px; color: #ffffff;background: #ffa216;");
        sheet.add(".scheduler_default_timeheadergroup,.scheduler_default_timeheadercol", "color: #333;background: #f3f3f3;");
        sheet.add(".scheduler_default_rowheader,.scheduler_default_corner", "color: #333;background: #f3f3f3;");
        sheet.add(".scheduler_default_rowheader_inner", "position: absolute;left: 0px;right: 0px;top: 0px;bottom: 0px;border-right: 1px solid #eee;padding: 2px;");
        sheet.add(".scheduler_default_timeheadergroup, .scheduler_default_timeheadercol", "text-align: center;");
        sheet.add(".scheduler_default_timeheadergroup_inner", "position: absolute;left: 0px;right: 0px;top: 0px;bottom: 0px;border-right: 1px solid #c0c0c0;border-bottom: 1px solid #c0c0c0;");
        sheet.add(".scheduler_default_timeheadercol_inner", "position: absolute;left: 0px;right: 0px;top: 0px;bottom: 0px;border-right: 1px solid #c0c0c0;");
        sheet.add(".scheduler_default_divider", "background-color: #c0c0c0;");
        sheet.add(".scheduler_default_divider_horizontal", "background-color: #c0c0c0;");
        sheet.add(".scheduler_default_matrix_vertical_line", "background-color: #eee;");
        sheet.add(".scheduler_default_matrix_vertical_break", "background-color: #000;");
        sheet.add(".scheduler_default_matrix_horizontal_line", "background-color: #eee;");
        sheet.add(".scheduler_default_resourcedivider", "background-color: #c0c0c0;");
        sheet.add(".scheduler_default_shadow_inner", "background-color: #666666;opacity: 0.5;filter: alpha(opacity=50);height: 100%;xborder-radius: 5px;");
        sheet.add(".scheduler_default_event", "font-size:12px;color:#666;");
        sheet.add(".scheduler_default_event_inner", "position:absolute;top:0px;left:0px;right:0px;bottom:0px;padding:5px 2px 2px 2px;overflow:hidden;border:1px solid #ccc;");
        sheet.add(".scheduler_default_event_bar", "top:0px;left:0px;right:0px;height:4px;background-color:#9dc8e8;");
        sheet.add(".scheduler_default_event_bar_inner", "position:absolute;height:4px;background-color:#1066a8;");
        sheet.add(".scheduler_default_event_inner", 'background:#fff;background: -webkit-gradient(linear, left top, left bottom, from(#ffffff), to(#eeeeee));background: -webkit-linear-gradient(top, #ffffff 0%, #eeeeee);background: -moz-linear-gradient(top, #ffffff 0%, #eeeeee);background: -ms-linear-gradient(top, #ffffff 0%, #eeeeee);background: -o-linear-gradient(top, #ffffff 0%, #eeeeee);background: linear-gradient(top, #ffffff 0%, #eeeeee);filter: progid:DXImageTransform.Microsoft.Gradient(startColorStr="#ffffff", endColorStr="#eeeeee");');
        sheet.add(".scheduler_default_event_float_inner", "padding:6px 2px 2px 8px;"); // space for arrow
        sheet.add(".scheduler_default_event_float_inner:after", 'content:"";border-color: transparent #666 transparent transparent;border-style:solid;border-width:5px;width:0;height:0;position:absolute;top:8px;left:-4px;');
        sheet.add(".scheduler_default_columnheader_inner", "font-weight: bold;");
        sheet.add(".scheduler_default_columnheader_splitter", "background-color: #666;opacity: 0.5;filter: alpha(opacity=50);");
        sheet.add(".scheduler_default_columnheader_cell_inner", "padding: 2px;");
        sheet.add(".scheduler_default_cell", "background-color: #f9f9f9;");
        sheet.add(".scheduler_default_cell.scheduler_default_cell_business", "background-color: #fff;");

        sheet.add(".navigator_default_main", "border-left: 1px solid #c0c0c0;border-right: 1px solid #c0c0c0;border-bottom: 1px solid #c0c0c0;background-color: white;color: #000000;");
        sheet.add(".navigator_default_main *, .navigator_default_main *:before, .navigator_default_main *:after", "box-sizing: content-box;");
        sheet.add(".navigator_default_month", "font-family: Tahoma, Arial, Helvetica, sans-serif; font-size: 11px;");
        sheet.add(".navigator_default_day", "color: black;");
        sheet.add(".navigator_default_weekend", "background-color: #f0f0f0;");
        sheet.add(".navigator_default_dayheader", "color: black;");
        sheet.add(".navigator_default_line", "border-bottom: 1px solid #c0c0c0;");
        sheet.add(".navigator_default_dayother", "color: gray;");
        sheet.add(".navigator_default_todaybox", "border: 1px solid red;");
        sheet.add(".navigator_default_title, .navigator_default_titleleft, .navigator_default_titleright", 'border-top: 1px solid #c0c0c0;border-bottom: 1px solid #c0c0c0;color: #333;background: #f3f3f3;');
        sheet.add(".navigator_default_busy", "font-weight: bold;");

        sheet.add(".month_default_main", "border: 1px solid #c0c0c0;font-family: Tahoma, Arial, sans-serif; font-size: 12px;color: #333;");
        sheet.add(".month_default_main *, .month_default_main *:before, .month_default_main *:after", "box-sizing: content-box;"); // bootstrap
        sheet.add(".month_default_cell_inner", "border-right: 1px solid #ddd;border-bottom: 1px solid #ddd;position: absolute;top: 0px;left: 0px;bottom: 0px;right: 0px;background-color: #f9f9f9;");
        sheet.add(".month_default_cell_business .month_default_cell_inner", "background-color: #fff;");
        sheet.add(".month_default_cell_header", "text-align: right;padding-right: 2px;");
        sheet.add(".month_default_header_inner", 'text-align: center; vertical-align: middle;position: absolute;top: 0px;left: 0px;bottom: 0px;right: 0px;border-right: 1px solid #c0c0c0;border-bottom: 1px solid #c0c0c0;cursor: default;color: #333;background: #f3f3f3;');
        sheet.add(".month_default_message", 'padding: 10px;opacity: 0.9;filter: alpha(opacity=90);color: #ffffff;background: #ffa216;background: -webkit-gradient(linear, left top, left bottom, from(#ffa216), to(#ff8400));background: -webkit-linear-gradient(top, #ffa216 0%, #ff8400);background: -moz-linear-gradient(top, #ffa216 0%, #ff8400);background: -ms-linear-gradient(top, #ffa216 0%, #ff8400);background: -o-linear-gradient(top, #ffa216 0%, #ff8400);background: linear-gradient(top, #ffa216 0%, #ff8400);filter: progid:DXImageTransform.Microsoft.Gradient(startColorStr="#ffa216", endColorStr="#ff8400");');
        sheet.add(".month_default_event_inner", 'position: absolute;top: 0px;bottom: 0px;left: 1px;right: 1px;overflow:hidden;padding: 2px;padding-left: 5px;font-size: 12px;color: #666;background: #fff;background: -webkit-gradient(linear, left top, left bottom, from(#ffffff), to(#eeeeee));background: -webkit-linear-gradient(top, #ffffff 0%, #eeeeee);background: -moz-linear-gradient(top, #ffffff 0%, #eeeeee);background: -ms-linear-gradient(top, #ffffff 0%, #eeeeee);background: -o-linear-gradient(top, #ffffff 0%, #eeeeee);background: linear-gradient(top, #ffffff 0%, #eeeeee);filter: progid:DXImageTransform.Microsoft.Gradient(startColorStr="#ffffff", endColorStr="#eeeeee");border: 1px solid #999;border-radius: 0px;');
        sheet.add(".month_default_event_continueright .month_default_event_inner", "border-top-right-radius: 0px;border-bottom-right-radius: 0px;border-right-style: dotted;");
        sheet.add(".month_default_event_continueleft .month_default_event_inner", "border-top-left-radius: 0px;border-bottom-left-radius: 0px;border-left-style: dotted;");
        sheet.add(".month_default_event_hover .month_default_event_inner", 'background: #fff;background: -webkit-gradient(linear, left top, left bottom, from(#ffffff), to(#e8e8e8));background: -webkit-linear-gradient(top, #ffffff 0%, #e8e8e8);background: -moz-linear-gradient(top, #ffffff 0%, #e8e8e8);background: -ms-linear-gradient(top, #ffffff 0%, #e8e8e8);background: -o-linear-gradient(top, #ffffff 0%, #e8e8e8);background: linear-gradient(top, #ffffff 0%, #e8e8e8);filter: progid:DXImageTransform.Microsoft.Gradient(startColorStr="#ffffff", endColorStr="#e8e8e8");');
        sheet.add(".month_default_selected .month_default_event_inner, .month_default_event_hover.month_default_selected .month_default_event_inner", "background: #ddd;");
        sheet.add(".month_default_shadow_inner", "background-color: #666666;opacity: 0.5;filter: alpha(opacity=50);height: 100%;-moz-border-radius: 5px;-webkit-border-radius: 5px;border-radius: 5px;");

        sheet.commit();

        DayPilot.Global.defaultCss = true;
    })();

    // document element
    DayPilot.doc = function() {
        var de = document.documentElement;
        return (de && de.clientHeight) ? de : document.body;
    };
    
    DayPilot.guid = function() {
        var S4 = function() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return ("" + S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    };    
    
    DayPilot.pageOffset = function() {
        if (typeof pageXOffset !== 'undefined') {
            return { x: pageXOffset, y: pageYOffset };
        }
        var d = DayPilot.doc();
        return { x: d.scrollLeft, y: d.scrollTop };
    };
	
    DayPilot.indexOf = function(array, object) {
        if (!array || !array.length) {
            return -1;
        }
        for (var i = 0; i < array.length; i++) {
            if (array[i] === object) {
                return i;
            }
        }
        return -1;
    };

    // mouse coords
    DayPilot.mc = function(ev){
        if(ev.pageX || ev.pageY){
	        return {x:ev.pageX, y:ev.pageY};
        }
        return {
	        x:ev.clientX + document.documentElement.scrollLeft,
	        y:ev.clientY + document.documentElement.scrollTop
        };
    };

    DayPilot.Stats = {};
    DayPilot.Stats.eventObjects = 0;
    DayPilot.Stats.dateObjects = 0;
    DayPilot.Stats.cacheHitsCtor = 0;
    DayPilot.Stats.cacheHitsParsing = 0;
    DayPilot.Stats.cacheHitsTicks = 0;
    DayPilot.Stats.print = function() {
        console.log("DayPilot.Stats.eventObjects: " + DayPilot.Stats.eventObjects);
        console.log("DayPilot.Stats.dateObjects: " + DayPilot.Stats.dateObjects);
        console.log("DayPilot.Stats.cacheHitsCtor: " + DayPilot.Stats.cacheHitsCtor);
        console.log("DayPilot.Stats.cacheHitsParsing: " + DayPilot.Stats.cacheHitsParsing);
        console.log("DayPilot.Stats.cacheHitsTicks: " + DayPilot.Stats.cacheHitsTicks);
        console.log("DayPilot.Date.Cache.Ctor keys: " + Object.keys(DayPilot.Date.Cache.Ctor).length);
        console.log("DayPilot.Date.Cache.Parsing keys: " + Object.keys(DayPilot.Date.Cache.Parsing).length);
    };
    // register event
    DayPilot.re = function (el, ev, func) {
        if (el.addEventListener) {
            el.addEventListener (ev, func, false);
        } else if (el.attachEvent) {
            el.attachEvent ("on" + ev, func);
        } 
    };
    
    // purge
    // thanks to http://javascript.crockford.com/memory/leak.html
    DayPilot.pu = function(d) {
        //var removed = [];
        //var start = new Date();
        var a = d.attributes, i, l, n;
        if (a) {
            l = a.length;
            for (i = 0; i < l; i += 1) {
                if (!a[i]) {
                    continue;
                }
                n = a[i].name;
                if (typeof d[n] === 'function') {
                    d[n] = null;
                }
            }
        }
        a = d.childNodes;
        if (a) {
            l = a.length;
            for (i = 0; i < l; i += 1) {
                var children = DayPilot.pu(d.childNodes[i]);
            }
        }
    };
    
    // delete element
    DayPilot.de = function(e) {
        if (!e) {
            return;
        }
        e.parentNode && e.parentNode.removeChild(e);
    };
    
    // vertical scrollbar width
    DayPilot.sw = function(element) {
        if (!element) {
            return 0;
        }
        return element.offsetWidth - element.clientWidth;
    };

    // angular module
    DayPilot.am = function() {
        if (typeof angular === "undefined") {
            return null;
        }
        if (!DayPilot.am.cached) {
            DayPilot.am.cached = angular.module("daypilot", []);
        }
        return DayPilot.am.cached;
    };

    DayPilot.Selection = function (start, end, resource, root) {
        this.type = 'selection';
        this.start = start.isDayPilotDate ? start : new DayPilot.Date(start);
        this.end = end.isDayPilotDate ? end : new DayPilot.Date(end);
        this.resource = resource;
        this.root = root;
        
        this.toJSON = function(key) {
            var json = {};
            json.start = this.start;
            json.end = this.end;
            json.resource = this.resource;
            
            return json;
        };
    };

    /* XMLHttpRequest */

    DayPilot.request = function(url, callback, postData, errorCallback) {
        var req = DayPilot.createXmlHttp();
        if (!req) {
            return;
        }

        req.open("POST", url, true);
        req.setRequestHeader('Content-type', 'text/plain');
        req.onreadystatechange = function() {
            if (req.readyState !== 4)
                return;
            if (req.status !== 200 && req.status !== 304) {
                if (errorCallback) {
                    errorCallback(req);
                }
                else {
                    if (console) { console.log('HTTP error ' + req.status); }
                }
                return;
            }
            callback(req);
        };
        if (req.readyState === 4) {
            return;
        }
        if (typeof postData === 'object') {
            postData = DayPilot.JSON.stringify(postData);
        }
        req.send(postData);
    };
    
    DayPilot.createXmlHttp = function () {
        var xmlHttp;
        try {
            xmlHttp = new XMLHttpRequest();
        }
        catch(e) {
            try {
                xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch(e) {
            }
        }
        return xmlHttp;
    };

    DayPilot.Util = {};
    DayPilot.Util.addClass = function(object, name) {
        if (!object) {
            return;
        }
        if (!object.className) {
            object.className = name;
            return;
        }
        var already = new RegExp("(^|\\s)" + name + "($|\\s)");
        if (!already.test(object.className)) {
            object.className = object.className + ' ' + name;
        }
    };
    
    DayPilot.Util.removeClass = function(object, name) {
        if (!object) {
            return;
        }
        var already = new RegExp("(^|\\s)" + name + "($|\\s)");
        object.className = object.className.replace(already, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');  // trim spaces
    };

    DayPilot.Util.isNullOrUndefined = function(val) {
        return val === null || typeof val === "undefined";
    };
    
    /* Date utils */

    /*
    // DayPilot.Date class

    DayPilot.Date = function(date, isLocal) {
        this.isDayPilotDate = true; // allow class detection

        if (typeof date === 'undefined') {  // date not set, use NOW
            this.d = DayPilot.Date.fromLocal();    
        }
        else if (typeof date === "string") {
            return DayPilot.Date.fromStringSortable(date);
        }
        else if (date.isDayPilotDate) { // it's already DayPilot.Date object, return it (no copy)
            return date;
        }
        else if (!date.getFullYear) {  // it's not a date object, fail
            throw "date parameter is not a Date object: " + date;
        }
        else if (isLocal) {  // if the date passed should be read as local date
            this.d = DayPilot.Date.fromLocal(date);
        }
        else {  // should be read as GMT
            this.d = date;
        }
        
        this.ticks = this.d.getTime();
        this.value = this.toStringSortable();
        
    };

    DayPilot.Date.prototype.addDays = function(days) {
        return new DayPilot.Date(DayPilot.Date.addDays(this.d, days));
    };

    DayPilot.Date.prototype.addHours = function(hours) {
        return this.addTime(hours*60*60*1000);
    };

    DayPilot.Date.prototype.addMilliseconds = function(millis) {
        return this.addTime(millis);
    };

    DayPilot.Date.prototype.addMinutes = function(minutes) {
        return this.addTime(minutes*60*1000);
    };

    DayPilot.Date.prototype.addMonths = function(months) {
        return new DayPilot.Date(DayPilot.Date.addMonths(this.d, months));
    };

    DayPilot.Date.prototype.addSeconds = function(seconds) {
        return this.addTime(seconds*1000);
    };

    DayPilot.Date.prototype.addTime = function(ticks) {
        return new DayPilot.Date(DayPilot.Date.addTime(this.d, ticks));
    };

    DayPilot.Date.prototype.addYears = function(years) {
        var n = this.clone();
        n.d.setUTCFullYear(this.getYear() + years);
        return n;
    };

    DayPilot.Date.prototype.clone = function() {
        return new DayPilot.Date(DayPilot.Date.clone(this.d));
    };

    DayPilot.Date.prototype.dayOfWeek = function() {
        return this.d.getUTCDay();
    };
    
    DayPilot.Date.prototype.daysInMonth = function() {
        return DayPilot.Date.daysInMonth(this.d);
    };
    
    DayPilot.Date.prototype.getDayOfWeek = function() {
        return this.d.getUTCDay();
    };    

    DayPilot.Date.prototype.dayOfYear = function() {
    	return Math.ceil((this.getDatePart().getTime() - this.firstDayOfYear().getTime()) / 86400000) + 1;
    };

    DayPilot.Date.prototype.equals = function(another) {
        if (another === null) {
            return false;
        }
        if (another.isDayPilotDate) {
            return DayPilot.Date.equals(this.d, another.d);
        }
        else {
            throw "The parameter must be a DayPilot.Date object (DayPilot.Date.equals())";
        }
    };
    
    DayPilot.Date.prototype.firstDayOfMonth = function() {
        var utc = DayPilot.Date.firstDayOfMonth(this.getYear(), this.getMonth() + 1);
        return new DayPilot.Date(utc);
    };

    DayPilot.Date.prototype.firstDayOfYear = function() {
        var year = this.getYear();
        var d = new Date();
        d.setUTCFullYear(year, 0, 1);
        d.setUTCHours(0);
        d.setUTCMinutes(0);
        d.setUTCSeconds(0);
        d.setUTCMilliseconds(0);
        return new DayPilot.Date(d);
    };

    DayPilot.Date.prototype.firstDayOfWeek = function(weekStarts) {
        var utc = DayPilot.Date.firstDayOfWeek(this.d, weekStarts || 0);
        return new DayPilot.Date(utc);
    };

    DayPilot.Date.prototype.getDay = function() {
        return this.d.getUTCDate();
    };

    DayPilot.Date.prototype.getDatePart = function() {
        return new DayPilot.Date(DayPilot.Date.getDate(this.d));
    };

    DayPilot.Date.prototype.getYear = function() {
        return this.d.getUTCFullYear();
    };

    DayPilot.Date.prototype.getHours = function() {
        return this.d.getUTCHours();
    };

    DayPilot.Date.prototype.getMilliseconds = function() {
        return this.d.getUTCMilliseconds();
    };

    DayPilot.Date.prototype.getMinutes = function() {
        return this.d.getUTCMinutes();
    };

    DayPilot.Date.prototype.getMonth = function() {
        return this.d.getUTCMonth();
    };

    DayPilot.Date.prototype.getSeconds = function() {
        return this.d.getUTCSeconds();
    };

    DayPilot.Date.prototype.getTotalTicks = function() {
        return this.getTime();
    };

    // undocumented
    DayPilot.Date.prototype.getTime = function() {
        if (typeof this.ticks !== 'number') {
            throw "Uninitialized DayPilot.Date (internal error)";
        }
        return this.ticks;
    };

    DayPilot.Date.prototype.getTimePart = function() {
        return DayPilot.Date.getTime(this.d);
    };

    DayPilot.Date.prototype.lastDayOfMonth = function() {
        var utc = DayPilot.Date.lastDayOfMonth(this.getYear(), this.getMonth() + 1);
        return new DayPilot.Date(utc);
    };
    
    DayPilot.Date.prototype.weekNumber = function() {
        var first = this.firstDayOfYear();
        var days = (this.getTime() - first.getTime()) / 86400000;
        return Math.ceil((days + first.dayOfWeek() + 1) / 7);
    };
    
    // ISO 8601
    DayPilot.Date.prototype.weekNumberISO = function() {
        var thursdayFlag = false;
        var dayOfYear = this.dayOfYear();

        var startWeekDayOfYear = this.firstDayOfYear().dayOfWeek();
        var endWeekDayOfYear = this.firstDayOfYear().addYears(1).addDays(-1).dayOfWeek();
        //int startWeekDayOfYear = new DateTime(date.getYear(), 1, 1).getDayOfWeekOrdinal();
        //int endWeekDayOfYear = new DateTime(date.getYear(), 12, 31).getDayOfWeekOrdinal();

        if (startWeekDayOfYear === 0) {
            startWeekDayOfYear = 7;
        }
        if (endWeekDayOfYear === 0) {
            endWeekDayOfYear = 7;
        }

        var daysInFirstWeek = 8 - (startWeekDayOfYear);

        if (startWeekDayOfYear == 4 || endWeekDayOfYear == 4) {
            thursdayFlag = true;
        }

        var fullWeeks = Math.ceil((dayOfYear - (daysInFirstWeek)) / 7.0);

        var weekNumber = fullWeeks;

        if (daysInFirstWeek >= 4) {
            weekNumber = weekNumber + 1;
        }

        if (weekNumber > 52 && !thursdayFlag) {
            weekNumber = 1;
        }

        if (weekNumber === 0) {
            weekNumber = this.firstDayOfYear().addDays(-1).weekNumberISO();//weekNrISO8601(new DateTime(date.getYear() - 1, 12, 31));
        }
        
        return weekNumber;
    
    };
	
	DayPilot.Date.prototype.toDateLocal = function() {
		return DayPilot.Date.toLocal(this.d);
	};

    DayPilot.Date.prototype.toJSON = function() {
        return this.toStringSortable();
    };

    // formatting and languages needed here
    DayPilot.Date.prototype.toString = function(pattern, locale) {
        if (typeof pattern === 'undefined') {
            return this.toStringSortable();
        }
        return new Pattern(pattern, locale).print(this);
    };

    DayPilot.Date.prototype.toStringSortable = function() {
        return DayPilot.Date.toStringSortable(this.d);
    };

    // returns null if parsing was not successful
    DayPilot.Date.parse = function(str, pattern) {
        var p = new Pattern(pattern);
        return p.parse(str);
    };
    
    // static functions, return DayPilot.Date object
    DayPilot.Date.fromStringSortable = function(string) {
        var datetime = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/;
        var date = /^(\d{4})-(\d{2})-(\d{2})$/;
        
        var isValidDateTime = datetime.test(string);
        var isValidDate = date.test(string);
        var isValid = isValidDateTime || isValidDate;
        
        if (!isValid) {
            throw "Invalid string format (use '2010-01-01' or '2010-01-01T00:00:00'.";
        }
        
        var regex = isValidDateTime ? datetime : date;
        
        var m = regex.exec(string);
        
        //return m[1];
        
        var d = new Date();
        d.setUTCFullYear(m[1], m[2] - 1, m[3]);
        d.setUTCHours(m[4] ? m[4] : 0);
        d.setUTCMinutes(m[5] ? m[5] : 0);
        d.setUTCSeconds(m[6] ? m[6] : 0);
        d.setUTCMilliseconds(0);
        
        return new DayPilot.Date(d);
    };

    DayPilot.Date.addDays = function(date, days) {
        var d = new Date();
        d.setTime(date.getTime() + days * 24 * 60 *60 * 1000);
        return d;    
    };

    DayPilot.Date.addMinutes = function(date, minutes) {
        var d = new Date();
        d.setTime(date.getTime() + minutes * 60 * 1000);
        return d;    
    };

    DayPilot.Date.addMonths = function(date, months) {
        if (months === 0)
            return date;
        
        var y = date.getUTCFullYear();
        var m = date.getUTCMonth() + 1;
        
        if (months > 0) {
            while (months >= 12) {
                months -= 12;
                y++;
            }
            if (months > 12 - m) {
                y++;
                m = months - (12 - m);
            } 
            else {
                m += months;
            }
        }
        else {
            while (months <= -12) {
                months += 12;
                y--;
            }
            if (m <= months) {  // 
                y--;
                m = 12 - (months + m);
            }
            else {
                m = m + months;
            }
        }
        
        var d = DayPilot.Date.clone(date);
        d.setUTCFullYear(y);
        d.setUTCMonth(m - 1);
        
        return d;
    };

    DayPilot.Date.addTime = function(date, time) {
        var d = new Date();
        d.setTime(date.getTime() + time);
        return d;    
    };

    DayPilot.Date.clone = function (original) {
        var d = new Date();
        return DayPilot.Date.dateFromTicks(original.getTime());
    };


    // rename candidate: diffDays
    DayPilot.Date.daysDiff = function(first, second) {
        if (first.getTime() > second.getTime()) {
            return null;
        }
        
        var i = 0;
        var fDay = DayPilot.Date.getDate(first);
        var sDay = DayPilot.Date.getDate(second);
        
        while (fDay < sDay) {
            fDay = DayPilot.Date.addDays(fDay, 1);
            i++;
        }
        
        return i;
    };

    DayPilot.Date.daysInMonth = function(year, month) {  // accepts also: function(date)
        if (year.getUTCFullYear) { // it's a date object
            month = year.getUTCMonth() + 1;
            year = year.getUTCFullYear();
        }

        var m = [31,28,31,30,31,30,31,31,30,31,30,31];
        if (month != 2) return m[month - 1];
        if (year%4 != 0) return m[1];
        if (year%100 == 0 && year%400 != 0) return m[1];
        return m[1] + 1;
    };

    DayPilot.Date.daysSpan = function(first, second) {
        if (first.getTime() === second.getTime()) {
            return 0;
        }

        var diff = DayPilot.Date.daysDiff(first, second);
        
        if (DayPilot.Date.equals(second, DayPilot.Date.getDate(second))) {
            diff--;
        }
        
        return diff;
    };

    DayPilot.Date.diff = function(first, second) { // = first - second
        if (!(first && second && first.getTime && second.getTime)) {
            throw "Both compared objects must be Date objects (DayPilot.Date.diff).";
        }
        
        return first.getTime() - second.getTime();
    };

    DayPilot.Date.equals = function (first, second) {
        return first.getTime() === second.getTime();
    };

    DayPilot.Date.fromLocal = function(localDate) {
        if (!localDate) {
            localDate = new Date();
        }

        var d = new Date();
        d.setUTCFullYear(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
        d.setUTCHours(localDate.getHours());
        d.setUTCMinutes(localDate.getMinutes());
        d.setUTCSeconds(localDate.getSeconds());
        d.setUTCMilliseconds(localDate.getMilliseconds());
        return d;
    };

    DayPilot.Date.firstDayOfMonth = function(year, month) {
        var d = new Date();
        d.setUTCFullYear(year, month -1, 1);
        d.setUTCHours(0);
        d.setUTCMinutes(0);
        d.setUTCSeconds(0);
        d.setUTCMilliseconds(0);
        return d;
    };

    DayPilot.Date.firstDayOfWeek = function(d, weekStarts) {
        var day = d.getUTCDay();
        while (day !== weekStarts) {
            d = DayPilot.Date.addDays(d, -1);
            day = d.getUTCDay();
        }
        return d;
    };


    // rename candidate: fromTicks
    DayPilot.Date.dateFromTicks = function (ticks) {
        var d = new Date();
        d.setTime(ticks);
        return d;
    };

    // rename candidate: getDatePart
    DayPilot.Date.getDate = function (original) {
        var d = DayPilot.Date.clone(original);
        d.setUTCHours(0);
        d.setUTCMinutes(0);
        d.setUTCSeconds(0);
        d.setUTCMilliseconds(0);
        return d;    
    };

    DayPilot.Date.getStart = function(year, month, weekStarts) {  // gets the first days of week where the first day of month occurs
        var fdom = DayPilot.Date.firstDayOfMonth(year, month);
        d = DayPilot.Date.firstDayOfWeek(fdom, weekStarts);
        return d;
    };

    // rename candidate: getTimePart
    DayPilot.Date.getTime = function (original) {
        var date = DayPilot.Date.getDate(original);
        
        return DayPilot.Date.diff(original, date);
    };

    // rename candidate: toHourString
    DayPilot.Date.hours = function(date, use12) {

        var minute = date.getUTCMinutes();
        if (minute < 10) minute = "0" + minute;


        var hour = date.getUTCHours();
        //if (hour < 10) hour = "0" + hour;
        
        if (use12) {
            var am = hour < 12;
            var hour = hour % 12;
            if (hour == 0) {
                hour = 12;
            }
            var suffix = am ? "AM" : "PM";
            return hour + ':' + minute + ' ' + suffix;
        }
        else {
            return hour + ':' + minute;
        }
    };

    DayPilot.Date.lastDayOfMonth = function(year, month) {
        var d = DayPilot.Date.firstDayOfMonth(year, month);
        var length = DayPilot.Date.daysInMonth(year, month);
        d.setUTCDate(length);
        return d;
    };

    DayPilot.Date.max = function (first, second) {
        if (first.getTime() > second.getTime()) {
            return first;
        }
        else {
            return second;
        }
    };

    DayPilot.Date.min = function (first, second) {
        if (first.getTime() < second.getTime()) {
            return first;
        }
        else {
            return second;
        }
    };

    DayPilot.Date.today = function() {
        var relative = new Date();
        var d = new Date();
        d.setUTCFullYear(relative.getFullYear());
        d.setUTCMonth(relative.getMonth());
        d.setUTCDate(relative.getDate());
        
        return d;
    };

    DayPilot.Date.toLocal = function(date) {
        if (!date) {
            date = new Date();
        }

        var d = new Date();
        d.setFullYear(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        d.setHours(date.getUTCHours());
        d.setMinutes(date.getUTCMinutes());
        d.setSeconds(date.getUTCSeconds());
        d.setMilliseconds(date.getUTCMilliseconds());
        return d;
    };


    DayPilot.Date.toStringSortable = function(date) {
        if (date.isDayPilotDate) {
            return date.toStringSortable();
        }

        var d = date;
        var second = d.getUTCSeconds();
        if (second < 10) second = "0" + second;
        var minute = d.getUTCMinutes();
        if (minute < 10) minute = "0" + minute;
        var hour = d.getUTCHours();
        if (hour < 10) hour = "0" + hour;
        var day = d.getUTCDate();
        if (day < 10) day = "0" + day;
        var month = d.getUTCMonth() + 1;
        if (month < 10) month = "0" + month;
        var year = d.getUTCFullYear();
        
        if (year <= 0) {
            throw "The minimum year supported is 1.";
        }
        if (year < 10) {
            year = "000" + year;
        }
        else if (year < 100) {
            year = "00" + year;
        }
        else if (year < 1000) {
            year = "0" + year;
        }
        
        return year + "-" + month + "-" + day + 'T' + hour + ":" + minute + ":" + second;
    };
    */

    DayPilot.Locale = function(id, config) {
        this.id = id;
        this.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        this.dayNamesShort = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        this.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        this.datePattern = "M/d/yyyy";
        this.timePattern = "H:mm";
        this.dateTimePattern = "M/d/yyyy H:mm";
        this.timeFormat = "Clock12Hours";
        this.weekStarts = 0;

        if (config) {
            for (var name in config) {
                this[name] = config[name];
            }
        }
    };

    DayPilot.Locale.all = {};

    DayPilot.Locale.find = function(id) {
        if (!id) {
            return null;
        }
        var normalized = id.toLowerCase();
        if (normalized.length > 2) {
            normalized[2] = '-';
        }
        return DayPilot.Locale.all[normalized];
    };
    
    DayPilot.Locale.register = function(locale) {
        DayPilot.Locale.all[locale.id] = locale;
    };

    DayPilot.Locale.register(new DayPilot.Locale('ca-es', {'dayNames':['diumenge','dilluns','dimarts','dimecres','dijous','divendres','dissabte'],'dayNamesShort':['dg','dl','dt','dc','dj','dv','ds'],'monthNames':['gener','febrer','març','abril','maig','juny','juliol','agost','setembre','octubre','novembre','desembre',''],'monthNamesShort':['gen.','febr.','març','abr.','maig','juny','jul.','ag.','set.','oct.','nov.','des.',''],'timePattern':'H:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('cs-cz', {'dayNames':['neděle','pondělí','úterý','středa','čtvrtek','pátek','sobota'],'dayNamesShort':['ne','po','út','st','čt','pá','so'],'monthNames':['leden','únor','březen','duben','květen','červen','červenec','srpen','září','říjen','listopad','prosinec',''],'monthNamesShort':['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII',''],'timePattern':'H:mm','datePattern':'d. M. yyyy','dateTimePattern':'d. M. yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('da-dk', {'dayNames':['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'],'dayNamesShort':['sø','ma','ti','on','to','fr','lø'],'monthNames':['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december',''],'monthNamesShort':['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec',''],'timePattern':'HH:mm','datePattern':'dd-MM-yyyy','dateTimePattern':'dd-MM-yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('de-at', {'dayNames':['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],'dayNamesShort':['So','Mo','Di','Mi','Do','Fr','Sa'],'monthNames':['Jänner','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember',''],'monthNamesShort':['Jän','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez',''],'timePattern':'HH:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('de-ch', {'dayNames':['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],'dayNamesShort':['So','Mo','Di','Mi','Do','Fr','Sa'],'monthNames':['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember',''],'monthNamesShort':['Jan','Feb','Mrz','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez',''],'timePattern':'HH:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('de-de', {'dayNames':['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],'dayNamesShort':['So','Mo','Di','Mi','Do','Fr','Sa'],'monthNames':['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember',''],'monthNamesShort':['Jan','Feb','Mrz','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez',''],'timePattern':'HH:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('de-lu', {'dayNames':['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],'dayNamesShort':['So','Mo','Di','Mi','Do','Fr','Sa'],'monthNames':['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember',''],'monthNamesShort':['Jan','Feb','Mrz','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez',''],'timePattern':'HH:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('en-au', {'dayNames':['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],'dayNamesShort':['Su','Mo','Tu','We','Th','Fr','Sa'],'monthNames':['January','February','March','April','May','June','July','August','September','October','November','December',''],'monthNamesShort':['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',''],'timePattern':'h:mm tt','datePattern':'d/MM/yyyy','dateTimePattern':'d/MM/yyyy h:mm tt','timeFormat':'Clock12Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('en-ca', {'dayNames':['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],'dayNamesShort':['Su','Mo','Tu','We','Th','Fr','Sa'],'monthNames':['January','February','March','April','May','June','July','August','September','October','November','December',''],'monthNamesShort':['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',''],'timePattern':'h:mm tt','datePattern':'yyyy-MM-dd','dateTimePattern':'yyyy-MM-dd h:mm tt','timeFormat':'Clock12Hours','weekStarts':0}));
    DayPilot.Locale.register(new DayPilot.Locale('en-gb', {'dayNames':['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],'dayNamesShort':['Su','Mo','Tu','We','Th','Fr','Sa'],'monthNames':['January','February','March','April','May','June','July','August','September','October','November','December',''],'monthNamesShort':['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',''],'timePattern':'HH:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('en-us', {'dayNames':['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],'dayNamesShort':['Su','Mo','Tu','We','Th','Fr','Sa'],'monthNames':['January','February','March','April','May','June','July','August','September','October','November','December',''],'monthNamesShort':['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',''],'timePattern':'h:mm tt','datePattern':'M/d/yyyy','dateTimePattern':'M/d/yyyy h:mm tt','timeFormat':'Clock12Hours','weekStarts':0}));
    DayPilot.Locale.register(new DayPilot.Locale('es-es', {'dayNames':['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],'dayNamesShort':['D','L','M','X','J','V','S'],'monthNames':['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre',''],'monthNamesShort':['ene.','feb.','mar.','abr.','may.','jun.','jul.','ago.','sep.','oct.','nov.','dic.',''],'timePattern':'H:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('es-mx', {'dayNames':['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],'dayNamesShort':['do.','lu.','ma.','mi.','ju.','vi.','sá.'],'monthNames':['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre',''],'monthNamesShort':['ene.','feb.','mar.','abr.','may.','jun.','jul.','ago.','sep.','oct.','nov.','dic.',''],'timePattern':'hh:mm tt','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy hh:mm tt','timeFormat':'Clock12Hours','weekStarts':0}));
    DayPilot.Locale.register(new DayPilot.Locale('eu-es', {'dayNames':['igandea','astelehena','asteartea','asteazkena','osteguna','ostirala','larunbata'],'dayNamesShort':['ig','al','as','az','og','or','lr'],'monthNames':['urtarrila','otsaila','martxoa','apirila','maiatza','ekaina','uztaila','abuztua','iraila','urria','azaroa','abendua',''],'monthNamesShort':['urt.','ots.','mar.','api.','mai.','eka.','uzt.','abu.','ira.','urr.','aza.','abe.',''],'timePattern':'H:mm','datePattern':'yyyy/MM/dd','dateTimePattern':'yyyy/MM/dd H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('fi-fi', {'dayNames':['sunnuntai','maanantai','tiistai','keskiviikko','torstai','perjantai','lauantai'],'dayNamesShort':['su','ma','ti','ke','to','pe','la'],'monthNames':['tammikuu','helmikuu','maaliskuu','huhtikuu','toukokuu','kesäkuu','heinäkuu','elokuu','syyskuu','lokakuu','marraskuu','joulukuu',''],'monthNamesShort':['tammi','helmi','maalis','huhti','touko','kesä','heinä','elo','syys','loka','marras','joulu',''],'timePattern':'H:mm','datePattern':'d.M.yyyy','dateTimePattern':'d.M.yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('fr-be', {'dayNames':['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],'dayNamesShort':['di','lu','ma','me','je','ve','sa'],'monthNames':['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre',''],'monthNamesShort':['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.',''],'timePattern':'HH:mm','datePattern':'dd-MM-yy','dateTimePattern':'dd-MM-yy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('fr-ch', {'dayNames':['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],'dayNamesShort':['di','lu','ma','me','je','ve','sa'],'monthNames':['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre',''],'monthNamesShort':['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.',''],'timePattern':'HH:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('fr-fr', {'dayNames':['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],'dayNamesShort':['di','lu','ma','me','je','ve','sa'],'monthNames':['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre',''],'monthNamesShort':['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.',''],'timePattern':'HH:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('fr-lu', {'dayNames':['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],'dayNamesShort':['di','lu','ma','me','je','ve','sa'],'monthNames':['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre',''],'monthNamesShort':['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.',''],'timePattern':'HH:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('gl-es', {'dayNames':['domingo','luns','martes','mércores','xoves','venres','sábado'],'dayNamesShort':['do','lu','ma','mé','xo','ve','sá'],'monthNames':['xaneiro','febreiro','marzo','abril','maio','xuño','xullo','agosto','setembro','outubro','novembro','decembro',''],'monthNamesShort':['xan','feb','mar','abr','maio','xuño','xul','ago','set','out','nov','dec',''],'timePattern':'H:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('it-it', {'dayNames':['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'],'dayNamesShort':['do','lu','ma','me','gi','ve','sa'],'monthNames':['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre',''],'monthNamesShort':['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic',''],'timePattern':'HH:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('it-ch', {'dayNames':['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'],'dayNamesShort':['do','lu','ma','me','gi','ve','sa'],'monthNames':['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre',''],'monthNamesShort':['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic',''],'timePattern':'HH:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('ja-jp', {'dayNames':['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],'dayNamesShort':['日','月','火','水','木','金','土'],'monthNames':['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月',''],'monthNamesShort':['1','2','3','4','5','6','7','8','9','10','11','12',''],'timePattern':'H:mm','datePattern':'yyyy/MM/dd','dateTimePattern':'yyyy/MM/dd H:mm','timeFormat':'Clock24Hours','weekStarts':0}));
    DayPilot.Locale.register(new DayPilot.Locale('nb-no', {'dayNames':['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'],'dayNamesShort':['sø','ma','ti','on','to','fr','lø'],'monthNames':['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember',''],'monthNamesShort':['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des',''],'timePattern':'HH:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('nl-nl', {'dayNames':['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'],'dayNamesShort':['zo','ma','di','wo','do','vr','za'],'monthNames':['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december',''],'monthNamesShort':['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec',''],'timePattern':'HH:mm','datePattern':'d-M-yyyy','dateTimePattern':'d-M-yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('nl-be', {'dayNames':['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'],'dayNamesShort':['zo','ma','di','wo','do','vr','za'],'monthNames':['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december',''],'monthNamesShort':['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec',''],'timePattern':'H:mm','datePattern':'d/MM/yyyy','dateTimePattern':'d/MM/yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('nn-no', {'dayNames':['søndag','måndag','tysdag','onsdag','torsdag','fredag','laurdag'],'dayNamesShort':['sø','må','ty','on','to','fr','la'],'monthNames':['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember',''],'monthNamesShort':['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des',''],'timePattern':'HH:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('pt-br', {'dayNames':['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'],'dayNamesShort':['D','S','T','Q','Q','S','S'],'monthNames':['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro',''],'monthNamesShort':['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez',''],'timePattern':'HH:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':0}));
    DayPilot.Locale.register(new DayPilot.Locale('pl-pl', {'dayNames':['niedziela','poniedziałek','wtorek','środa','czwartek','piątek','sobota'],'dayNamesShort':['N','Pn','Wt','Śr','Cz','Pt','So'],'monthNames':['styczeń','luty','marzec','kwiecień','maj','czerwiec','lipiec','sierpień','wrzesień','październik','listopad','grudzień',''],'monthNamesShort':['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru',''],'timePattern':'HH:mm','datePattern':'yyyy-MM-dd','dateTimePattern':'yyyy-MM-dd HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('pt-pt', {'dayNames':['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'],'dayNamesShort':['D','S','T','Q','Q','S','S'],'monthNames':['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro',''],'monthNamesShort':['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez',''],'timePattern':'HH:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':0}));
    DayPilot.Locale.register(new DayPilot.Locale('ro-ro', {'dayNames':['duminică','luni','marți','miercuri','joi','vineri','sâmbătă'],'dayNamesShort':['D','L','Ma','Mi','J','V','S'],'monthNames':['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie',''],'monthNamesShort':['ian.','feb.','mar.','apr.','mai.','iun.','iul.','aug.','sep.','oct.','nov.','dec.',''],'timePattern':'H:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('ru-ru', {'dayNames':['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],'dayNamesShort':['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],'monthNames':['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь',''],'monthNamesShort':['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек',''],'timePattern':'H:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('sk-sk', {'dayNames':['nedeľa','pondelok','utorok','streda','štvrtok','piatok','sobota'],'dayNamesShort':['ne','po','ut','st','št','pi','so'],'monthNames':['január','február','marec','apríl','máj','jún','júl','august','september','október','november','december',''],'monthNamesShort':['1','2','3','4','5','6','7','8','9','10','11','12',''],'timePattern':'H:mm','datePattern':'d.M.yyyy','dateTimePattern':'d.M.yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('sv-se', {'dayNames':['söndag','måndag','tisdag','onsdag','torsdag','fredag','lördag'],'dayNamesShort':['sö','må','ti','on','to','fr','lö'],'monthNames':['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december',''],'monthNamesShort':['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec',''],'timePattern':'HH:mm','datePattern':'yyyy-MM-dd','dateTimePattern':'yyyy-MM-dd HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('tr-tr', {'dayNames':['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],'dayNamesShort':['Pz','Pt','Sa','Ça','Pe','Cu','Ct'],'monthNames':['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık',''],'monthNamesShort':['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara',''],'timePattern':'HH:mm','datePattern':'d.M.yyyy','dateTimePattern':'d.M.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
    DayPilot.Locale.register(new DayPilot.Locale('zh-cn', {'dayNames':['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],'dayNamesShort':['日','一','二','三','四','五','六'],'monthNames':['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月',''],'monthNamesShort':['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月',''],'timePattern':'H:mm','datePattern':'yyyy/M/d','dateTimePattern':'yyyy/M/d H:mm','timeFormat':'Clock24Hours','weekStarts':1}));

    DayPilot.Locale.US = DayPilot.Locale.find("en-us");

/*
    var Pattern = function(pattern, locale) {
        if (typeof locale === "string") {
            locale = DayPilot.Locale.find(locale);
        }
        var locale = locale || DayPilot.Locale.US;
        var all = [
            {"seq": "yyyy", "expr": "[0-9]{4,4\u007d", "str": function(d) {
                    return d.getYear();
                }},
            {"seq": "yy", "expr": "[0-9]{2,2\u007d", "str": function(d) {
                return d.getYear() % 100;
            }},
            {"seq": "MMMM", "expr": "[a-z]*", "str": function(d) {
                    var r = locale.monthNames[d.getMonth()];
                    return r;
                }},
            {"seq": "MMM", "expr": "[a-z]*", "str": function(d) {
                    var r = locale.monthNamesShort[d.getMonth()];
                    return r;
                }},
            {"seq": "MM", "expr": "[0-9]{2,2\u007d", "str": function(d) {
                    var r = d.getMonth() + 1;
                    return r < 10 ? "0" + r : r;
                }},
            {"seq": "M", "expr": "[0-9]{1,2\u007d", "str": function(d) {
                    var r = d.getMonth() + 1;
                    return r;
                }},
            {"seq": "dddd", "expr": "[a-z]*", "str": function(d) {
                    var r = locale.dayNames[d.getDayOfWeek()];
                    return r;
                }},
            {"seq": "ddd", "expr": "[a-z]*", "str": function(d) {
                    var r = locale.dayNamesShort[d.getDayOfWeek()];
                    return r;
                }},
            {"seq": "dd", "expr": "[0-9]{2,2\u007d", "str": function(d) {
                    var r = d.getDay();
                    return r < 10 ? "0" + r : r;
                }},
            {"seq": "d", "expr": "[0-9]{1,2\u007d", "str": function(d) {
                    var r = d.getDay();
                    return r;
                }},
            {"seq": "m", "expr": "[0-9]{1,2\u007d", "str": function(d) {
                    var r = d.getMinutes();
                    return r;
                }},
            {"seq": "mm", "expr": "[0-9]{2,2\u007d", "str": function(d) {
                    var r = d.getMinutes();
                    return r < 10 ? "0" + r : r;
                }},
            {"seq": "H", "expr": "[0-9]{1,2\u007d", "str": function(d) {
                    var r = d.getHours();
                    return r;
                }},
            {"seq": "HH", "expr": "[0-9]{2,2\u007d", "str": function(d) {
                    var r = d.getHours();
                    return r < 10 ? "0" + r : r;
                }},
            {"seq": "h", "expr": "[0-9]{1,2\u007d", "str": function(d) {
                    var hour = d.getHours();
                    var hour = hour % 12;
                    if (hour === 0) {
                        hour = 12;
                    }
                    return hour;
                }},
            {"seq": "hh", "expr": "[0-9]{2,2\u007d", "str": function(d) {
                    var hour = d.getHours();
                    var hour = hour % 12;
                    if (hour === 0) {
                        hour = 12;
                    }
                    var r = hour;
                    return r < 10 ? "0" + r : r;
                }},
            {"seq": "tt", "expr": "(AM|PM)", "str": function(d) {
                    var hour = d.getHours();
                    var am = hour < 12;
                    return am ? "AM" : "PM";
                }},
            {"seq": "s", "expr": "[0-9]{1,2\u007d", "str": function(d) {
                    var r = d.getSeconds();
                    return r;
                }},
            {"seq": "ss", "expr": "[0-9]{2,2\u007d", "str": function(d) {
                    var r = d.getSeconds();
                    return r < 10 ? "0" + r : r;
                }}
        ];
        
        var escapeRegex = function(text) {
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        };

        this.init = function() {
            this.year = this.findSequence("yyyy");
            this.month = this.findSequence("MM") || this.findSequence("M");
            this.day = this.findSequence("dd") || this.findSequence("d");

            this.hours = this.findSequence("HH") || this.findSequence("H");
            this.minutes = this.findSequence("mm") || this.findSequence("m");
            this.seconds = this.findSequence("ss") || this.findSequence("s");
        };

        this.findSequence = function(seq) {

            var index = pattern.indexOf(seq);
            if (index === -1) {
                return null;
            }
            return {
                "findValue": function(input) {
                    var prepared = escapeRegex(pattern);
                    for (var i = 0; i < all.length; i++) {
                        var len = all[i].length;
                        var pick = (seq === all[i].seq);
                        //var expr = "";
                        var expr = all[i].expr;
                        if (pick) {
                            expr = "(" + expr + ")";
                        }
                        prepared = prepared.replace(all[i].seq, expr);
                    }
                    
                    try {
                        var r = new RegExp(prepared);
                        var array = r.exec(input);
                        if (!array) {
                            return null;
                        }
                        return parseInt(array[1]);
                    }
                    catch (e) {
                        throw "unable to create regex from: " + prepared;
                    }
                }
            };
        };

        this.print = function(date) {
            // always recompiles the pattern

            var find = function(t) {
                for (var i = 0; i < all.length; i++) {
                    if (all[i].seq === t) {
                        return all[i];
                    }
                }
                return null;
            };

            var eos = pattern.length <= 0;
            var pos = 0;
            var components = [];

            while (!eos) {
                var rem = pattern.substring(pos);
                var matches = /(.)\1*!/.exec(rem);
                if (matches && matches.length > 0) {
                    var match = matches[0];
                    var q = find(match);
                    if (q) {
                        components.push(q);
                    }
                    else {
                        components.push(match);
                    }
                    pos += match.length;
                    eos = pattern.length <= pos;
                }
                else {
                    eos = true;
                }
            }

            // resolve placeholders
            for (var i = 0; i < components.length; i++) {
                var c = components[i];
                if (typeof c !== 'string') {
                    components[i] = c.str(date);
                }
            }

            return components.join("");
        };



        this.parse = function(input) {

            var year = this.year.findValue(input);
            if (!year) {
                return null; // unparseable
            }

            var month = this.month.findValue(input);
            var day = this.day.findValue(input);

            var hours = this.hours ? this.hours.findValue(input) : 0;
            var minutes = this.minutes ? this.minutes.findValue(input) : 0;
            var seconds = this.seconds ? this.seconds.findValue(input) : 0;

            var d = new Date();
            d.setUTCFullYear(year, month - 1, day);
            d.setUTCHours(hours);
            d.setUTCMinutes(minutes);
            d.setUTCSeconds(seconds);
            d.setUTCMilliseconds(0);

            return new DayPilot.Date(d);
        };

        this.init();

    };
*/


    // DayPilot.Date START

    DayPilot.Date = function(date, readLocal) {

        if (date instanceof DayPilot.Date) { // it's already a DayPilot.Date object, return it (no copy)
            return date;
        }

        var ticks;

        if (DayPilot.Util.isNullOrUndefined(date)) {  // date not set, use NOW
            ticks = DayPilot.DateUtil.fromLocal().getTime();
            date = ticks;
        }

        var cache = DayPilot.Date.Cache.Ctor;
        if (cache[date]) {
            DayPilot.Stats.cacheHitsCtor += 1;
            return cache[date];
        }

        var isString = false;

        if (typeof date === "string") {
            ticks = DayPilot.DateUtil.fromStringSortable(date, readLocal).getTime();
            isString = true;
        }
        else if (typeof date === "number") {
            if (isNaN(date)) {
                throw "Cannot create DayPilot.Date from NaN";
            }
            ticks = date;
        }
        else if (date instanceof Date) {
            if (readLocal) {
                ticks = DayPilot.DateUtil.fromLocal(date).getTime();
            }
            else {
                ticks = date.getTime();
            }
        }
        else {
            throw "Unrecognized parameter: use Date, number or string in ISO 8601 format";
        }

        var value = ticksToSortable(ticks); // normalized value

        if (cache[value]) {
            return cache[value];
        }

        cache[value] = this;
        cache[ticks] = this;
        if (isString && value !== date  && DayPilot.DateUtil.hasTzSpec(date)) {  // don't cache strings with TZ spec
            cache[date] = this;
        }

        if (Object.defineProperty && !DayPilot.browser.ielt9) {
            Object.defineProperty(this, "ticks", {
                get: function() { return ticks; }
            });
            Object.defineProperty(this, "value", {
                "value": value,
                "writable": false,
                "enumerable": true
            });
        }
        else {
            this.ticks = ticks;
            this.value = value;
        }

        if (DayPilot.Date.Config.legacyShowD) {
            this.d = new Date(ticks);
        }

        DayPilot.Stats.dateObjects += 1;
    };

    DayPilot.Date.Config = {};
    DayPilot.Date.Config.legacyShowD = false;

    DayPilot.Date.Cache = {};
    DayPilot.Date.Cache.Parsing = {};
    DayPilot.Date.Cache.Ctor = {};
    DayPilot.Date.Cache.Ticks = {};

    DayPilot.Date.prototype.addDays = function(days) {
        return new DayPilot.Date(this.ticks + days * 24 * 60 * 60 * 1000);
    };

    DayPilot.Date.prototype.addHours = function(hours) {
        return this.addTime(hours * 60 * 60 * 1000);
    };

    DayPilot.Date.prototype.addMilliseconds = function(millis) {
        return this.addTime(millis);
    };

    DayPilot.Date.prototype.addMinutes = function(minutes) {
        return this.addTime(minutes * 60 * 1000);
    };

    DayPilot.Date.prototype.addMonths = function(months) {

        var date = new Date(this.ticks);
        if (months === 0)
            return this;

        var y = date.getUTCFullYear();
        var m = date.getUTCMonth() + 1;

        if (months > 0) {
            while (months >= 12) {
                months -= 12;
                y++;
            }
            if (months > 12 - m) {
                y++;
                m = months - (12 - m);
            }
            else {
                m += months;
            }
        }
        else {
            while (months <= -12) {
                months += 12;
                y--;
            }
            if (m + months <= 0) {  //
                y--;
                m = 12 + m + months;
            }
            else {
                m = m + months;
            }
        }

        var d = new Date(date.getTime());
        d.setUTCDate(1);
        d.setUTCFullYear(y);
        d.setUTCMonth(m - 1);

        //var max = DayPilot.Date.daysInMonth(y, m);
        var max = new DayPilot.Date(d).daysInMonth();
        d.setUTCDate(Math.min(max, date.getUTCDate()));

        return new DayPilot.Date(d);
    };

    DayPilot.Date.prototype.addSeconds = function(seconds) {
        return this.addTime(seconds * 1000);
    };

    DayPilot.Date.prototype.addTime = function(ticks) {
        return new DayPilot.Date(this.ticks + ticks);
    };

    DayPilot.Date.prototype.addYears = function(years) {
        var original = new Date(this.ticks);
        var d = new Date(this.ticks);
        var y = this.getYear() + years;
        var m = this.getMonth();

        d.setUTCDate(1);
        d.setUTCFullYear(y);
        d.setUTCMonth(m);

        //var max = DayPilot.Date.daysInMonth(y, m + 1);
        var max = new DayPilot.Date(d).daysInMonth();
        d.setUTCDate(Math.min(max, original.getUTCDate()));

        return new DayPilot.Date(d);
    };

    DayPilot.Date.prototype.dayOfWeek = function() {
        return new Date(this.ticks).getUTCDay();
    };

    DayPilot.Date.prototype.getDayOfWeek = function() {
        return new Date(this.ticks).getUTCDay();
    };

    DayPilot.Date.prototype.daysInMonth = function() {
        var date = new Date(this.ticks);
        var month = date.getUTCMonth() + 1;
        var year = date.getUTCFullYear();


        var m = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (month !== 2)
            return m[month - 1];
        if (year % 4 !== 0)
            return m[1];
        if (year % 100 === 0 && year % 400 !== 0)
            return m[1];
        return m[1] + 1;

    };

    DayPilot.Date.prototype.daysInYear = function() {
        var year = this.getYear();
        if (year % 4 !== 0) {
            return 365;
        }
        if (year % 100 === 0 && year % 400 !== 0) {
            return 365;
        }
        return 366;
    };

    DayPilot.Date.prototype.dayOfYear = function() {
        return Math.ceil((this.getDatePart().getTime() - this.firstDayOfYear().getTime()) / 86400000) + 1;
    };

    // not required, direct comparison can be used
    DayPilot.Date.prototype.equals = function(another) {
        if (another === null) {
            return false;
        }
        if (another instanceof DayPilot.Date) {
            return this === another;
        }
        else {
            throw "The parameter must be a DayPilot.Date object (DayPilot.Date.equals())";
        }
    };

    DayPilot.Date.prototype.firstDayOfMonth = function() {
        //var utc = DayPilot.Date.firstDayOfMonth(this.getYear(), this.getMonth() + 1);
        //return new DayPilot.Date(utc);

        var d = new Date();
        d.setUTCFullYear(this.getYear(), this.getMonth(), 1);
        d.setUTCHours(0);
        d.setUTCMinutes(0);
        d.setUTCSeconds(0);
        d.setUTCMilliseconds(0);
        return new DayPilot.Date(d);

    };

    DayPilot.Date.prototype.firstDayOfYear = function() {
        var year = this.getYear();
        var d = new Date();
        d.setUTCFullYear(year, 0, 1);
        d.setUTCHours(0);
        d.setUTCMinutes(0);
        d.setUTCSeconds(0);
        d.setUTCMilliseconds(0);
        return new DayPilot.Date(d);
    };

    DayPilot.Date.prototype.firstDayOfWeek = function(weekStarts) {
        var d = this;
        var weekStarts = weekStarts || 0;
        var day = d.dayOfWeek();
        while (day !== weekStarts) {
            d = d.addDays(-1);
            day = d.dayOfWeek();
        }
        return new DayPilot.Date(d);
    };

    DayPilot.Date.prototype.getDay = function() {
        return new Date(this.ticks).getUTCDate();
    };

    DayPilot.Date.prototype.getDatePart = function() {
        var d = new Date(this.ticks);
        d.setUTCHours(0);
        d.setUTCMinutes(0);
        d.setUTCSeconds(0);
        d.setUTCMilliseconds(0);
        return new DayPilot.Date(d);
    };

    DayPilot.Date.prototype.getYear = function() {
        return new Date(this.ticks).getUTCFullYear();
    };

    DayPilot.Date.prototype.getHours = function() {
        return new Date(this.ticks).getUTCHours();
    };

    DayPilot.Date.prototype.getMilliseconds = function() {
        return new Date(this.ticks).getUTCMilliseconds();
    };

    DayPilot.Date.prototype.getMinutes = function() {
        return new Date(this.ticks).getUTCMinutes();
    };

    DayPilot.Date.prototype.getMonth = function() {
        return new Date(this.ticks).getUTCMonth();
    };

    DayPilot.Date.prototype.getSeconds = function() {
        return new Date(this.ticks).getUTCSeconds();
    };

    DayPilot.Date.prototype.getTotalTicks = function() {
        return this.getTime();
    };

    // undocumented
    DayPilot.Date.prototype.getTime = function() {
        return this.ticks;
    };

    DayPilot.Date.prototype.getTimePart = function() {
        var datePart = this.getDatePart();
        return DayPilot.DateUtil.diff(this, datePart);
    };

    DayPilot.Date.prototype.lastDayOfMonth = function() {
        //var utc = DayPilot.Date.lastDayOfMonth(this.getYear(), this.getMonth() + 1);
        //return new DayPilot.Date(utc);
        var d = new Date(this.firstDayOfMonth().getTime());
        var length = this.daysInMonth();
        d.setUTCDate(length);
        return new DayPilot.Date(d);
    };

    DayPilot.Date.prototype.weekNumber = function() {
        var first = this.firstDayOfYear();
        var days = (this.getTime() - first.getTime()) / 86400000;
        return Math.ceil((days + first.dayOfWeek() + 1) / 7);
    };

    /*
     DayPilot.Date.prototype.local = function() {
     if (typeof this.offset === 'undefined') {
     return this;
     }
     return this.addMinutes(this.offset);
     };
     */

    // ISO 8601
    DayPilot.Date.prototype.weekNumberISO = function() {
        var thursdayFlag = false;
        var dayOfYear = this.dayOfYear();

        var startWeekDayOfYear = this.firstDayOfYear().dayOfWeek();
        var endWeekDayOfYear = this.firstDayOfYear().addYears(1).addDays(-1).dayOfWeek();
        //int startWeekDayOfYear = new DateTime(date.getYear(), 1, 1).getDayOfWeekOrdinal();
        //int endWeekDayOfYear = new DateTime(date.getYear(), 12, 31).getDayOfWeekOrdinal();

        if (startWeekDayOfYear === 0) {
            startWeekDayOfYear = 7;
        }
        if (endWeekDayOfYear === 0) {
            endWeekDayOfYear = 7;
        }

        var daysInFirstWeek = 8 - (startWeekDayOfYear);

        if (startWeekDayOfYear === 4 || endWeekDayOfYear === 4) {
            thursdayFlag = true;
        }

        var fullWeeks = Math.ceil((dayOfYear - (daysInFirstWeek)) / 7.0);

        var weekNumber = fullWeeks;

        if (daysInFirstWeek >= 4) {
            weekNumber = weekNumber + 1;
        }

        if (weekNumber > 52 && !thursdayFlag) {
            weekNumber = 1;
        }

        if (weekNumber === 0) {
            weekNumber = this.firstDayOfYear().addDays(-1).weekNumberISO(); //weekNrISO8601(new DateTime(date.getYear() - 1, 12, 31));
        }

        return weekNumber;

    };

    DayPilot.Date.prototype.toDateLocal = function() {
        var date = new Date(this.ticks);

        var d = new Date();
        d.setFullYear(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        d.setHours(date.getUTCHours());
        d.setMinutes(date.getUTCMinutes());
        d.setSeconds(date.getUTCSeconds());
        d.setMilliseconds(date.getUTCMilliseconds());
        return d;

    };

    DayPilot.Date.prototype.toDate = function() {
        return new Date(this.ticks);
    };


    DayPilot.Date.prototype.toJSON = function() {
        return this.value;
    };

    // formatting and languages needed here
    DayPilot.Date.prototype.toString = function(pattern, locale) {
        if (typeof pattern === 'undefined') {
            return this.toStringSortable();
        }
        return new Pattern(pattern, locale).print(this);
    };

    DayPilot.Date.prototype.toStringSortable = function() {
        return ticksToSortable(this.ticks);
    };

    function ticksToSortable(ticks) {

        var cache = DayPilot.Date.Cache.Ticks;
        if (cache[ticks]) {
            DayPilot.Stats.cacheHitsTicks += 1;
            return cache[ticks];
        }

        var d = new Date(ticks);

        var millisecond;
        var ms = d.getUTCMilliseconds();

        if (ms === 0) {
            millisecond = "";
        }
        else if (ms < 10) {
            millisecond = ".00" + ms;
        }
        else if (ms < 100) {
            millisecond = ".0" + ms;
        }
        else {
            millisecond = "." + ms
        }

        var second = d.getUTCSeconds();
        if (second < 10)
            second = "0" + second;
        var minute = d.getUTCMinutes();
        if (minute < 10)
            minute = "0" + minute;
        var hour = d.getUTCHours();
        if (hour < 10)
            hour = "0" + hour;
        var day = d.getUTCDate();
        if (day < 10)
            day = "0" + day;
        var month = d.getUTCMonth() + 1;
        if (month < 10)
            month = "0" + month;
        var year = d.getUTCFullYear();

        if (year <= 0) {
            throw "The minimum year supported is 1.";
        }
        if (year < 10) {
            year = "000" + year;
        }
        else if (year < 100) {
            year = "00" + year;
        }
        else if (year < 1000) {
            year = "0" + year;
        }

        var result = year + "-" + month + "-" + day + 'T' + hour + ":" + minute + ":" + second + millisecond;
        cache[ticks] = result;
        return result;
    }

    /* static functions, return DayPilot.Date object */

    // returns null if parsing was not successful
    DayPilot.Date.parse = function(str, pattern, locale) {
        var p = new Pattern(pattern, locale);
        return p.parse(str);
    };

    DayPilot.Date.today = function() {
        return new DayPilot.Date().getDatePart();
    };

    DayPilot.Date.fromYearMonthDay = function(year, month, day) {
        month = month || 1;
        day = day || 1;

        var d = new Date(0);
        d.setUTCFullYear(year);
        d.setUTCMonth(month - 1);
        d.setUTCDate(day);
        return new DayPilot.Date(d);
    };

    DayPilot.DateUtil = {};

    /* internal functions, all operate with GMT base of the date object
     (except of DayPilot.DateUtil.fromLocal()) */

    DayPilot.DateUtil.fromStringSortable = function(string, readLocal) {
        /*
         Supported formats:
         2015-01-01
         2015-01-01T00:00:00
         2015-01-01T00:00:00.000
         2015-01-01T00:00:00Z
         2015-01-01T00:00:00.000Z
         2015-01-01T00:00:00+01:00
         2015-01-01T00:00:00.000+01:00

         */

        if (!string) {
            throw "Can't create DayPilot.Date from an empty string";
        }

        var len = string.length;
        var date = len === 10;
        var datetime = len === 19;
        var long = len > 19;

        if (!date && !datetime && !long) {
            throw "Invalid string format (use '2010-01-01' or '2010-01-01T00:00:00'): " + string;
        }

        if (DayPilot.Date.Cache.Parsing[string] && !readLocal) {
            DayPilot.Stats.cacheHitsParsing += 1;
            return DayPilot.Date.Cache.Parsing[string];
        }

        var year = string.substring(0, 4);
        var month = string.substring(5, 7);
        var day = string.substring(8, 10);

        var d = new Date(0);
        d.setUTCFullYear(year, month - 1, day);

        if (date) {
            /*
             d.setUTCHours(0);
             d.setUTCMinutes(0);
             d.setUTCSeconds(0);
             d.setUTCMilliseconds(0);
             */
            //result = d;
            DayPilot.Date.Cache.Parsing[string] = d;
            return d;
        }

        var hours = string.substring(11, 13);
        var minutes = string.substring(14, 16);
        var seconds = string.substring(17, 19);

        d.setUTCHours(hours);
        d.setUTCMinutes(minutes);
        d.setUTCSeconds(seconds);
        //d.setUTCMilliseconds(0);
        //result = d;

        if (datetime) {
            DayPilot.Date.Cache.Parsing[string] = d;
            return d;
        }

        var tzdir = string[19];

        var tzoffset = 0;

        if (tzdir === ".") {
            var ms = parseInt(string.substring(20, 23)); /// .000
            d.setUTCMilliseconds(ms);
            tzoffset = DayPilot.DateUtil.getTzOffsetMinutes(string.substring(23));
        }
        else {
            tzoffset = DayPilot.DateUtil.getTzOffsetMinutes(string.substring(19));
        }

        var dd = new DayPilot.Date(d);
        if (!readLocal) {
            dd = dd.addMinutes(-tzoffset);
        }

        d = dd.toDate(); // get UTC base

        DayPilot.Date.Cache.Parsing[string] = d;
        return d;
    };

    DayPilot.DateUtil.getTzOffsetMinutes = function(string) {
        if (DayPilot.Util.isNullOrUndefined(string) || string === "") {
            return 0;
        }
        if (string === "Z") {
            return 0;
        }

        var tzdir = string[0];

        var tzhours = parseInt(string.substring(1, 3));
        var tzminutes = parseInt(string.substring(4));
        var tzoffset = tzhours * 60 + tzminutes;

        if (tzdir === "-") {
            return -tzoffset;
        }
        else if (tzdir === "+") {
            return tzoffset;
        }
        else {
            throw "Invalid timezone spec: " + string;
        }
    };

    DayPilot.DateUtil.hasTzSpec = function(string) {
        if (string.indexOf("+")) {
            return true;
        }
        if (string.indexOf("-")) {
            return true;
        }
        return false;
    };


    // rename candidate: diffDays
    DayPilot.DateUtil.daysDiff = function(first, second) {
        (first && second) || (function() { throw "two parameters required"; })();

        first = new DayPilot.Date(first);
        second = new DayPilot.Date(second);

        if (first.getTime() > second.getTime()) {
            return null;
        }

        var i = 0;
        var fDay = first.getDatePart();
        var sDay = second.getDatePart();

        while (fDay < sDay) {
            fDay = fDay.addDays(1);
            i++;
        }

        return i;
    };

    DayPilot.DateUtil.daysSpan = function(first, second) {
        (first && second) || (function() { throw "two parameters required"; })();

        first = new DayPilot.Date(first);
        second = new DayPilot.Date(second);

        if (first === second) {
            return 0;
        }

        var diff = DayPilot.DateUtil.daysDiff(first, second);

        if (second == second.getDatePart()) {
            diff--;
        }

        return diff;
    };

    DayPilot.DateUtil.diff = function(first, second) { // = first - second
        if (!(first && second && first.getTime && second.getTime)) {
            throw "Both compared objects must be Date objects (DayPilot.Date.diff).";
        }

        return first.getTime() - second.getTime();
    };

    // returns Date object
    DayPilot.DateUtil.fromLocal = function(localDate) {
        if (!localDate) {
            localDate = new Date();
        }

        var d = new Date();
        d.setUTCFullYear(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
        d.setUTCHours(localDate.getHours());
        d.setUTCMinutes(localDate.getMinutes());
        d.setUTCSeconds(localDate.getSeconds());
        d.setUTCMilliseconds(localDate.getMilliseconds());
        return d;
    };

    // rename candidate: toHourString
    DayPilot.DateUtil.hours = function(date, use12) {

        var minute = date.getUTCMinutes();
        if (minute < 10)
            minute = "0" + minute;


        var hour = date.getUTCHours();
        //if (hour < 10) hour = "0" + hour;

        if (use12) {
            var am = hour < 12;
            var hour = hour % 12;
            if (hour === 0) {
                hour = 12;
            }
            var suffix = am ? "AM" : "PM";
            return hour + ':' + minute + ' ' + suffix;
        }
        else {
            return hour + ':' + minute;
        }
    };

    DayPilot.DateUtil.max = function(first, second) {
        if (first.getTime() > second.getTime()) {
            return first;
        }
        else {
            return second;
        }
    };

    DayPilot.DateUtil.min = function(first, second) {
        if (first.getTime() < second.getTime()) {
            return first;
        }
        else {
            return second;
        }
    };

    var Pattern = function(pattern, locale) {
        if (typeof locale === "string") {
            locale = DayPilot.Locale.find(locale);
        }
        var locale = locale || DayPilot.Locale.US;
        var all = [
            {"seq": "yyyy", "expr": "[0-9]{4,4\u007d", "str": function(d) {
                return d.getYear();
            }},
            {"seq": "yy", "expr": "[0-9]{2,2\u007d", "str": function(d) {
                return d.getYear() % 100;
            }},
            {"seq": "mm", "expr": "[0-9]{2,2\u007d", "str": function(d) {
                var r = d.getMinutes();
                return r < 10 ? "0" + r : r;
            }},
            {"seq": "m", "expr": "[0-9]{1,2\u007d", "str": function(d) {
                var r = d.getMinutes();
                return r;
            }},
            {"seq": "HH", "expr": "[0-9]{2,2\u007d", "str": function(d) {
                var r = d.getHours();
                return r < 10 ? "0" + r : r;
            }},
            {"seq": "H", "expr": "[0-9]{1,2\u007d", "str": function(d) {
                var r = d.getHours();
                return r;
            }},
            {"seq": "hh", "expr": "[0-9]{2,2\u007d", "str": function(d) {
                var hour = d.getHours();
                var hour = hour % 12;
                if (hour === 0) {
                    hour = 12;
                }
                var r = hour;
                return r < 10 ? "0" + r : r;
            }},
            {"seq": "h", "expr": "[0-9]{1,2\u007d", "str": function(d) {
                var hour = d.getHours();
                var hour = hour % 12;
                if (hour === 0) {
                    hour = 12;
                }
                return hour;
            }},
            {"seq": "tt", "expr": "(AM|PM)", "str": function(d) {
                var hour = d.getHours();
                var am = hour < 12;
                return am ? "AM" : "PM";
            }},
            {"seq": "ss", "expr": "[0-9]{2,2\u007d", "str": function(d) {
                var r = d.getSeconds();
                return r < 10 ? "0" + r : r;
            }},
            {"seq": "s", "expr": "[0-9]{1,2\u007d", "str": function(d) {
                var r = d.getSeconds();
                return r;
            }},
            {"seq": "MMMM", "expr": "[^\\s0-9]*", "str": function(d) {
                var r = locale.monthNames[d.getMonth()];
                return r;
            }, "transform" : function(input) {
                var index = DayPilot.indexOf(locale.monthNames, input, equalsIgnoreCase);
                if (index < 0) {
                    return null;
                }
                return index + 1;
            }},
            {"seq": "MMM", "expr": "[^\\s0-9]*", "str": function(d) {  // \u0073 = 's'
                var r = locale.monthNamesShort[d.getMonth()];
                return r;
            }, "transform" : function(input) {
                var index = DayPilot.indexOf(locale.monthNamesShort, input, equalsIgnoreCase);
                if (index < 0) {
                    return null;
                }
                return index + 1;
            }},
            {"seq": "MM", "expr": "[0-9]{2,2\u007d", "str": function(d) {
                var r = d.getMonth() + 1;
                return r < 10 ? "0" + r : r;
            }},
            {"seq": "M", "expr": "[0-9]{1,2\u007d", "str": function(d) {
                var r = d.getMonth() + 1;
                return r;
            }},
            {"seq": "dddd", "expr": "[^\\s0-9]*", "str": function(d) {
                var r = locale.dayNames[d.getDayOfWeek()];
                return r;
            }},
            {"seq": "ddd", "expr": "[^\\s0-9]*", "str": function(d) {
                var r = locale.dayNamesShort[d.getDayOfWeek()];
                return r;
            }},
            {"seq": "dd", "expr": "[0-9]{2,2\u007d", "str": function(d) {
                var r = d.getDay();
                return r < 10 ? "0" + r : r;
            }},
            {"seq": "%d", "expr": "[0-9]{1,2\u007d", "str": function(d) {
                var r = d.getDay();
                return r;
            }},
            {"seq": "d", "expr": "[0-9]{1,2\u007d", "str": function(d) {
                var r = d.getDay();
                return r;
            }},
        ];

        var escapeRegex = function(text) {
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        };

        this.init = function() {
            this.year = this.findSequence("yyyy");
            this.month = this.findSequence("MMMM") || this.findSequence("MMM") || this.findSequence("MM") || this.findSequence("M");
            this.day = this.findSequence("dd") || this.findSequence("d");

            this.hours = this.findSequence("HH") || this.findSequence("H");
            this.minutes = this.findSequence("mm") || this.findSequence("m");
            this.seconds = this.findSequence("ss") || this.findSequence("s");
        };

        this.findSequence = function(seq) {

            function defaultTransform(value) {
                return parseInt(value);
            }

            var index = pattern.indexOf(seq);
            if (index === -1) {
                return null;
            }
            return {
                "findValue": function(input) {
                    var prepared = escapeRegex(pattern);
                    var transform = null;
                    for (var i = 0; i < all.length; i++) {
                        var len = all[i].length;
                        var pick = (seq === all[i].seq);
                        //var expr = "";
                        var expr = all[i].expr;
                        if (pick) {
                            expr = "(" + expr + ")";
                            transform = all[i].transform;
                        }
                        prepared = prepared.replace(all[i].seq, expr);
                    }

                    prepared = "^" + prepared + "$";

                    try {
                        var r = new RegExp(prepared);
                        var array = r.exec(input);
                        if (!array) {
                            return null;
                        }
                        transform = transform || defaultTransform;  // parseInt is the default transform/parse function
                        return transform(array[1]);
                    }
                    catch (e) {
                        throw "unable to create regex from: " + prepared;
                    }
                }
            };
        };

        this.print = function(date) {
            // always recompiles the pattern

            var find = function(t) {
                for (var i = 0; i < all.length; i++) {
                    if (all[i] && all[i].seq === t) {
                        return all[i];
                    }
                }
                return null;
            };

            var eos = pattern.length <= 0;
            var pos = 0;
            var components = [];

            while (!eos) {
                var rem = pattern.substring(pos);
                var matches = /%?(.)\1*/.exec(rem);  // matches a sequence of identical characters, with an optional '%' preceding char
                if (matches && matches.length > 0) {
                    var match = matches[0];
                    var q = find(match);
                    if (q) {
                        components.push(q);
                    }
                    else {
                        components.push(match);
                    }
                    pos += match.length;
                    eos = pattern.length <= pos;
                }
                else {
                    eos = true;
                }
            }

            // resolve placeholders
            for (var i = 0; i < components.length; i++) {
                var c = components[i];
                if (typeof c !== 'string') {
                    components[i] = c.str(date);
                }
            }

            return components.join("");
        };



        this.parse = function(input) {

            var year = this.year.findValue(input);
            if (!year) {
                return null; // unparseable
            }

            var month = this.month.findValue(input);
            if (DayPilot.Util.isNullOrUndefined(month)) {
                return null;
            }
            if (month > 12 || month < 1) {
                return null;
            }
            var day = this.day.findValue(input);

            var daysInMonth = DayPilot.Date.fromYearMonthDay(year, month).daysInMonth();
            if (day < 1 || day > daysInMonth) {
                return null;
            }

            var hours = this.hours ? this.hours.findValue(input) : 0;
            var minutes = this.minutes ? this.minutes.findValue(input) : 0;
            var seconds = this.seconds ? this.seconds.findValue(input) : 0;

            var d = new Date();
            d.setUTCFullYear(year, month - 1, day);
            d.setUTCHours(hours);
            d.setUTCMinutes(minutes);
            d.setUTCSeconds(seconds);
            d.setUTCMilliseconds(0);

            return new DayPilot.Date(d);
        };

        this.init();

    };

    // DayPilot.Date END

    DayPilot.Event = function(data, calendar, part) {
        var e = this;
        this.calendar = calendar;
        this.data = data ? data : {};
        this.part = part ? part : {};

        // backwards compatibility, still accepts id in "value" 
        if (typeof this.data.id === 'undefined') {
            this.data.id = this.data.value;
        }

        var copy = {};
        var synced = ["id", "text", "start", "end"];

        this.isEvent = true;

        // internal
        this.temp = function() {
            if (copy.dirty) {
                return copy;
            }
            for (var i = 0; i < synced.length; i++) {
                copy[synced[i]] = e.data[synced[i]];
            }
            copy.dirty = true;
            return copy;

        };

        // internal
        this.copy = function() {
            var result = {};
            for (var i = 0; i < synced.length; i++) {
                result[synced[i]] = e.data[synced[i]];
            }
            return result;
        };

        this.commit = function() {
            if (!copy.dirty) {
                return;
            }

            for (var i = 0; i < synced.length; i++) {
                e.data[synced[i]] = copy[synced[i]];
            }

            copy.dirty = false;
        };

        this.dirty = function() {
            return copy.dirty;
        };

        this.id = function(val) {
            if (typeof val === 'undefined') {
                return e.data.id;
            }
            else {
                this.temp().id = val;
            }
        };
        // obsolete, use id() instead
        this.value = function(val) {
            if (typeof val === 'undefined') {
                return e.id();
            }
            else {
                e.id(val);
            }
        };
        this.text = function(val) {
            if (typeof val === 'undefined') {
                return e.data.text;
            }
            else {
                this.temp().text = val;
                this.client.innerHTML(val); // update the HTML automatically
            }
        };
        this.start = function(val) {
            if (typeof val === 'undefined') {
                return new DayPilot.Date(e.data.start);
            }
            else {
                this.temp().start = new DayPilot.Date(val);
            }
        };
        this.end = function(val) {
            if (typeof val === 'undefined') {
                return new DayPilot.Date(e.data.end);
            }
            else {
                this.temp().end = new DayPilot.Date(val);
            }
        };
        this.partStart = function() {
            return new DayPilot.Date(this.part.start);
        };
        this.partEnd = function() {
            return new DayPilot.Date(this.part.end);
        };

        this.tag = function(field) {
            var values = e.data.tag;
            if (!values) {
                return null;
            }
            if (typeof field === 'undefined') {
                return e.data.tag;
            }
            var fields = e.calendar.tagFields;
            var index = -1;
            for (var i = 0; i < fields.length; i++) {
                if (field === fields[i])
                    index = i;
            }
            if (index === -1) {
                throw "Field name not found.";
            }
            //var tags = t.split('&');
            return values[index];
        };

        this.client = {};
        this.client.innerHTML = function(val) {
            if (typeof val === 'undefined') {
                if (e.cache && typeof e.cache.html !== "undefined") {
                    return e.cache.html;
                }
                if (typeof e.data.html !== "undefined") {
                    return e.data.html;
                }
                return e.data.text;
            }
            else {
                e.data.html = val;
            }
        };
        
        this.client.html = this.client.innerHTML;
        
        this.client.header = function(val) {
            if (typeof val === 'undefined') {
                return e.data.header;
            }
            else {
                e.data.header = val;
            }
        };
        
        this.client.cssClass = function(val) {
            if (typeof val === 'undefined') {
                return e.data.cssClass;
            }
            else {
                e.data.cssClass = val;
            }
        };
        this.client.toolTip = function(val) {
            if (typeof val === 'undefined') {
                if (e.cache && typeof e.cache.toolTip !== "undefined") {
                    return e.cache.toolTip;
                }
                return typeof e.data.toolTip !== 'undefined' ? e.data.toolTip : e.data.text;
            }
            else {
                e.data.toolTip = val;
            }
        };
        
        this.client.barVisible = function(val) {
            if (typeof val === 'undefined') {
                if (e.cache && typeof e.cache.barHidden !== "undefined") {
                    return !e.cache.barHidden;
                }
                return e.calendar.durationBarVisible && !e.data.barHidden;
            }
            else {
                e.data.barHidden = !val;
            }
        };        

        this.client.backColor = function(val) {
            if (typeof val === 'undefined') {
                if (e.cache && typeof e.cache.backColor !== "undefined") {
                    return e.cache.backColor;
                }
                return typeof e.data.backColor !== "undefined" ? e.data.backColor : e.calendar.eventBackColor;
            }
            else {
                e.data.backColor = val;
            }
        };

        this.client.borderColor = function(val) {
            if (typeof val === 'undefined') {
                if (e.cache && typeof e.cache.borderColor !== "undefined") {
                    return e.cache.borderColor;
                }
                return typeof e.data.borderColor !== "undefined" ? e.data.borderColor : e.calendar.eventBorderColor;
            }
            else {
                e.data.borderColor = val;
            }
        };

        this.client.moveEnabled = function(val) {
            if (typeof val === 'undefined') {
                return e.calendar.eventMoveHandling !== 'Disabled' && !e.data.moveDisabled;
            }
            else {
                e.data.moveDisabled = !val;
            }
        };

        this.client.resizeEnabled = function(val) {
            if (typeof val === 'undefined') {
                return e.calendar.eventResizeHandling !== 'Disabled' && !e.data.resizeDisabled;
            }
            else {
                e.data.resizeDisabled = !val;
            }
        };

        this.client.clickEnabled = function(val) {
            if (typeof val === 'undefined') {
                return e.calendar.eventClickHandling !== 'Disabled' && !e.data.clickDisabled;
            }
            else {
                e.data.clickDisabled = !val;
            }
        };

        this.toJSON = function(key) {
            var json = {};
            json.value = this.id(); // still sending it with the old name
            json.id = this.id();
            json.text = this.text();
            json.start = this.start();
            json.end = this.end();
            json.tag = {};

            if (e.calendar && e.calendar.tagFields) {
                var fields = e.calendar.tagFields;
                for (var i = 0; i < fields.length; i++) {
                    json.tag[fields[i]] = this.tag(fields[i]);
                }
            }

            return json;
        };
    };

})();

/* JSON */
// thanks to http://www.json.org/js.html


// declares DayPilot.JSON.stringify()
DayPilot.JSON = {};

(function () {
    function f(n) {
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON2 !== 'function') {

        Date.prototype.toJSON2 = function (key) {
            return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + '';
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapeable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;

    function quote(string) {
        escapeable.lastIndex = 0;
        return escapeable.test(string) ?
            '"' + string.replace(escapeable, function (a) {
                var c = meta[a];
                if (typeof c === 'string') {
                    return c;
                }
                return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }

    function str(key, holder) {
        var i,          
            k,          
            v,          
            length,
            mind = gap,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' && typeof value.toJSON2 === 'function') {
            value = value.toJSON2(key);
        }
        else if (value && typeof value === 'object' && typeof value.toJSON === 'function' && !value.ignoreToJSON) {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
        case 'string':
            return quote(value);
        case 'number':
            return isFinite(value) ? String(value) : 'null';
        case 'boolean':
        case 'null':
            return String(value);
        case 'object':
            if (!value) {
                return 'null';
            }
            gap += indent;
            partial = [];
            if (typeof value.length === 'number' &&
                    !value.propertyIsEnumerable('length')) {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
            v = (partial.length === 0) ? '{\u007D' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '\u007D' : '{' + partial.join(',') + '\u007D';
            gap = mind;
            return v;
        }
    }

    if (typeof DayPilot.JSON.stringify !== 'function') {
        DayPilot.JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', {'': value});
        };
    }

})();
