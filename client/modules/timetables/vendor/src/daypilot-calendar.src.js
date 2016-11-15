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

if (typeof DayPilot.Global === 'undefined') {
    DayPilot.Global = {};
}

(function() {

    var doNothing = function() {};

    if (typeof DayPilot.Calendar !== 'undefined') {
        return;
    }
    
    var DayPilotCalendar = {};
    
    // internal selecting
    DayPilotCalendar.selectedCells = [];
    DayPilotCalendar.topSelectedCell = null;
    DayPilotCalendar.bottomSelectedCell = null;
    DayPilotCalendar.selecting = false;
    DayPilotCalendar.column = null;
    DayPilotCalendar.firstSelected = null;
    DayPilotCalendar.firstMousePos = null;
        
    // internal resizing
    DayPilotCalendar.originalMouse = null;
    DayPilotCalendar.originalHeight = null;
    DayPilotCalendar.originalTop = null;
    DayPilotCalendar.resizing = null;
    DayPilotCalendar.globalHandlers = false; 
        
    // internal moving
    DayPilotCalendar.moving = null;

    // helpers
    DayPilotCalendar.register = function(calendar) {
        if (!DayPilotCalendar.registered) {
            DayPilotCalendar.registered = [];
        }
        var r = DayPilotCalendar.registered;
        
        for (var i = 0; i < r.length; i++) {
            if (r[i] === calendar) {
                return;
            }
        }
        r.push(calendar);
    };

    DayPilotCalendar.unregister = function (calendar) {
        var a = DayPilotCalendar.registered;
        if (!a) {
            return;
        }
        
        var i = DayPilot.indexOf(a, calendar);
        if (i === -1) {
            return;
        }
        a.splice(i, 1);
    };

    DayPilotCalendar.getCellsAbove = function(cell) {
        var array = [];
        var c = DayPilotCalendar.getColumn(cell);

        var tr = cell.parentNode;
        
        var select = null;
        while (tr && select !== DayPilotCalendar.firstSelected) {
            select = tr.getElementsByTagName("td")[c];
            array.push(select);
            tr = tr.previousSibling;
            while (tr && tr.tagName !== "TR") {
                tr = tr.previousSibling;
	        }
        }
        return array;
    };
        
    DayPilotCalendar.getCellsBelow = function(cell) {
        var array = [];
        var c = DayPilotCalendar.getColumn(cell);
        var tr = cell.parentNode;
        
        var select = null;
        while (tr && select !== DayPilotCalendar.firstSelected) {
            select = tr.getElementsByTagName("td")[c];
            array.push(select);
            tr = tr.nextSibling;
            while (tr && tr.tagName !== "TR") {
                tr = tr.nextSibling;
	        }
        }
        return array;
    };

    DayPilotCalendar.getColumn = function(cell) {
        var i = 0;
        while (cell.previousSibling) {
            cell = cell.previousSibling;
            if (cell.tagName === "TD") {
                i++;
	    }
        }
        return i;
    };
        
    DayPilotCalendar.gUnload = function (ev) {
        
        if (!DayPilotCalendar.registered) {
            return;
        }
        var r = DayPilotCalendar.registered;
        
        for (var i = 0; i < r.length; i++) {
            var c = r[i];
            c.dispose();
                        
            DayPilotCalendar.unregister(c);
        }
        
    };

    DayPilotCalendar.gMouseUp = function (e){

        if (DayPilotCalendar.resizing) {
            if (!DayPilotCalendar.resizingShadow) {
                DayPilotCalendar.resizing.style.cursor = 'default';
                document.body.style.cursor = 'default';
                DayPilotCalendar.resizing = null;     
                return;
            }
        
            var dpEvent = DayPilotCalendar.resizing.event;
            var height = DayPilotCalendar.resizingShadow.clientHeight + 4;
            var top = DayPilotCalendar.resizingShadow.offsetTop;
            var border = DayPilotCalendar.resizing.dpBorder;
            
            // stop resizing on the client
            DayPilotCalendar.deleteShadow(DayPilotCalendar.resizingShadow);
            DayPilotCalendar.resizingShadow = null;
            DayPilotCalendar.resizing.style.cursor = 'default';
            dpEvent.calendar.nav.top.style.cursor = 'auto';
            //document.body.style.cursor = 'default';
            DayPilotCalendar.resizing.onclick = null; // will be re-created anyway

            DayPilotCalendar.resizing = null;

            dpEvent.calendar.eventResizeDispatch(dpEvent, height, top, border);
        }
        else if (DayPilotCalendar.moving) {
            if (!DayPilotCalendar.movingShadow) {
                DayPilotCalendar.moving = null;
	            document.body.style.cursor = 'default';
	            return;
            }
        
            var top = DayPilotCalendar.movingShadow.offsetTop;
            
            DayPilotCalendar.deleteShadow(DayPilotCalendar.movingShadow);
        
            var dpEvent = DayPilotCalendar.moving.event; 
            
            var newColumnIndex = DayPilotCalendar.movingShadow.column;
            
            // stop moving on the client     
            DayPilotCalendar.moving = null;
            DayPilotCalendar.movingShadow = null;
	        //document.body.style.cursor = 'default';
            dpEvent.calendar.nav.top.style.cursor = 'auto';
            
            var ev = e || window.event;
            dpEvent.calendar.eventMoveDispatch(dpEvent, newColumnIndex, top, ev);
        }
        else if (DayPilotCalendar.selecting && DayPilotCalendar.topSelectedCell !== null) {
            var calendar = DayPilotCalendar.selecting.calendar;
            DayPilotCalendar.selecting = false;

            var sel = calendar.getSelection();

            calendar.timeRangeSelectedDispatch(sel.start, sel.end);
            if (calendar.timeRangeSelectedHandling !== "Hold" && calendar.timeRangeSelectedHandling !== "HoldForever") {
                doNothing();
            }
        }
        else {
            DayPilotCalendar.selecting = false;
        }


    };

    DayPilotCalendar.deleteShadow = function(shadow) {
        if (!shadow) {
            return;
        }
        if (!shadow.parentNode) {
            return;
        }
        
        shadow.parentNode.removeChild(shadow);
    };

    DayPilotCalendar.moveShadow = function(column) {
        var shadow = DayPilotCalendar.movingShadow;
        var parent = shadow.parentNode;
        
        parent.style.display = 'none';
        
        shadow.parentNode.removeChild(shadow);
        column.firstChild.appendChild(shadow);
        shadow.style.left = '0px';
        
        parent.style.display = '';

        shadow.style.width = (DayPilotCalendar.movingShadow.parentNode.offsetWidth + 1) + 'px';
    };

    DayPilotCalendar.Calendar = function(id) {
    
        var isConstructor = false;
        if (this instanceof DayPilotCalendar.Calendar && !this.__constructor) {
            isConstructor = true;
            this.__constructor = true;
        }
        
        if (!isConstructor) {
            throw "DayPilot.Calendar() is a constructor and must be called as 'var c = new DayPilot.Calendar(id);'";
        }
    
        var calendar = this;
        this.uniqueID = null;

        this.v = '215-lite';
        this.id = id;
        this.clientName = id;

        this.cache = {};
        this.cache.pixels = {};
        
        this.elements = {};
        this.elements.events = [];
        
        this.nav = {};

        this.afterRender = function() {};

        // potentially leaking a bit but significantly faster in IE
        this.fasterDispose = true;

        this.angularAutoApply = false;
        this.api = 2;
        this.borderColor = "#CED2CE";
        this.businessBeginsHour = 9;
        this.businessEndsHour = 18;
        this.cellBackColor = "#ffffff";
        this.cellBorderColor = "#DEDFDE";
        this.cellHeight = 20;
        this.columnMarginRight = 5;
        this.cornerBackColor = "#F3F3F9";
        this.cssOnly = true;
        this.days = 1;
        this.durationBarVisible = true;
        this.eventBackColor = '#638EDE';
        this.eventBorderColor = "#2951A5";
        this.eventFontFamily = 'Tahoma, Arial, Helvetica, sans-serif';
        this.eventFontSize = '8pt';
        this.eventFontColor = "#ffffff";
        this.eventHeaderFontSize = '8pt';
        //this.eventHeaderFontFamily = 'Tahoma, Arial, Helvetica, sans-serif';
        this.eventHeaderFontColor = "#ffffff";
        this.eventHeaderHeight = 14;
        this.eventHeaderVisible = true;
        this.headerFontSize = '10pt';
        this.headerFontFamily = 'Tahoma, Arial, Helvetica, sans-serif';
        this.headerFontColor = "#42658C";
        this.headerHeight = 20;
        this.height = 300;
        this.heightSpec = 'BusinessHours';
        this.hideUntilInit = true;
        this.hourHalfBorderColor = "#EBEDEB";
        this.hourBorderColor = "#DEDFDE";
        this.hourFontColor = "#42658C";
        this.hourFontFamily = "Tahoma, Arial, Helvetica, sans-serif";
        this.hourFontSize = "16pt";
        this.hourNameBackColor = "#F3F3F9";
        this.hourNameBorderColor = "#DEDFDE";
        this.hourWidth = 45;
        this.initScrollPos = 'Auto';
        this.loadingLabelText = "Loading...";
        this.loadingLabelVisible = true;
        this.loadingLabelBackColor = "ff0000";
        this.loadingLabelFontColor = "#ffffff";
        this.loadingLabelFontFamily = "Tahoma, Arial, Helvetica, sans-serif";
        this.loadingLabelFontSize = "10pt";
        this.locale = "en-us";
        this.selectedColor = "#316AC5";
        this.showToolTip = true;
        this.startDate = new DayPilot.Date().getDatePart();
        this.cssClassPrefix = "calendar_default";
        this.theme = null;
        this.timeFormat = 'Auto';
        this.visible = true;

        this.timeRangeSelectedHandling = 'Enabled';
        this.eventClickHandling = 'Enabled';
        this.eventResizeHandling = 'Update';
        this.eventMoveHandling = 'Update';

        this.onBeforeEventRender = null;

        this.onEventClick = null;
        this.onEventClicked = null;
        this.onEventMove = null;
        this.onEventMoved = null;
        this.onEventResize = null;
        this.onEventResized = null;
        this.onTimeRangeSelect = null;
        this.onTimeRangeSelected = null;

        this.clearSelection = function() {
            for(var j = 0; j < DayPilotCalendar.selectedCells.length; j++) {
                var cell = DayPilotCalendar.selectedCells[j];
                if (cell) {
                    if (cell.selected) {
                        DayPilot.de(cell.selected);
                        cell.firstChild && (cell.firstChild.style.display = '');
                        cell.selected = null;
                    }
                }
            }
            DayPilotCalendar.selectedCells = [];
        };
        
        this.ie = (navigator && navigator.userAgent && navigator.userAgent.indexOf("MSIE") !== -1);  // IE
        this.ff = (navigator && navigator.userAgent && navigator.userAgent.indexOf("Firefox") !== -1);
        this.opera105 = (function() {
            if (/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
                var v = new Number(RegExp.$1);
                return v >= 10.5;
            }
            return false;
        })();
        this.webkit522 = (function() {
            if (/AppleWebKit[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
                var v = new Number(RegExp.$1);
                return v >= 522;
            }
            return false;
        })();

        this.cleanSelection = this.clearSelection;

        this._postBack2 = function(action, data, parameters) {
            var envelope = {};
            envelope.action = action;
            envelope.parameters = parameters;
            envelope.data = data;
            envelope.header = this._getCallBackHeader();

            var commandstring = "JSON" + DayPilot.JSON.stringify(envelope);
            __doPostBack(calendar.uniqueID, commandstring);
        };

        this._callBack2 = function(action, data, parameters) {
        
            if (this.callbackTimeout) {
                window.clearTimeout(this.callbackTimeout);
            }
        
            this.callbackTimeout = window.setTimeout(function() {
                calendar.loadingStart();
            }, 100);    
        
            var envelope = {};
            
            envelope.action = action;
            envelope.parameters = parameters;
            envelope.data = data;
            envelope.header = this._getCallBackHeader();
            
            var commandstring = "JSON" + DayPilot.JSON.stringify(envelope);
            if (this.backendUrl) {
                DayPilot.request(this.backendUrl, this.callBackResponse, commandstring, this.ajaxError);
            }
            else if (typeof WebForm_DoCallback === 'function') {
                WebForm_DoCallback(this.uniqueID, commandstring, this.updateView, this.clientName, this.onCallbackError, true);
            }
        };

        this.onCallbackError = function(result, context) {
            alert("Error!\r\nResult: " + result + "\r\nContext:" + context);
        };
        
        this.dispose = function() {
            var c = calendar;
            c.deleteEvents();
            
            c.nav.zoom.onmousemove = null;
            c.nav.scroll.root = null;
            
            DayPilot.pu(c.nav.loading);
            
            c.disposeMain();
            c.disposeHeader();
            
            c.nav.select = null;
            c.nav.cornerRight = null;
            c.nav.scrollable = null;
            c.nav.zoom = null;
            c.nav.loading = null;
            c.nav.header = null;
            c.nav.hourTable = null;
            c.nav.scrolltop = null;
            c.nav.scroll = null;
            c.nav.main = null;
            c.nav.message = null;
            c.nav.messageClose = null;
            c.nav.top = null;
            
            DayPilotCalendar.unregister(c);
        };
        
        this.registerDispose = function() {
            this.nav.top.dispose = this.dispose;
        };
        
        this.callBackResponse = function(response) {
            calendar.updateView(response.responseText);
        };

        this._getCallBackHeader = function() {
            var h = {};

            h.control = "dpc";
            h.id = this.id;
            h.v = this.v;

            h.days = calendar.days;
            h.startDate = calendar.startDate;
            h.heightSpec = calendar.heightSpec;
            h.businessBeginsHour = calendar.businessBeginsHour;
            h.businessEndsHour = calendar.businessEndsHour;
            h.hashes = calendar.hashes;

            h.backColor = calendar.cellBackColor;
            h.timeFormat = calendar.timeFormat;
            h.viewType = calendar.viewType;
            h.locale = calendar.locale;
            
            return h;
        };
        
        this.createShadow = function(object, copyText) {
            var parentTd = object.parentNode;
            while (parentTd && parentTd.tagName !== "TD") {
                parentTd = parentTd.parentNode;
            }

            var shadow = document.createElement('div');
            shadow.setAttribute('unselectable', 'on');
            shadow.style.position = 'absolute';
            shadow.style.width = (object.offsetWidth - 4) + 'px';
            shadow.style.height = (object.offsetHeight - 4) + 'px';
            shadow.style.left = (object.offsetLeft) + 'px';
            shadow.style.top = (object.offsetTop) + 'px';
            shadow.style.border = '2px dotted #666666';
            shadow.style.zIndex = 101;

            shadow.style.backgroundColor = "#aaaaaa";
            shadow.style.opacity = 0.5;
            shadow.style.filter = "alpha(opacity=50)";
            shadow.style.border = '2px solid #aaaaaa';

            if (copyText && false) {  // disabled
                shadow.style.overflow = 'hidden';
                shadow.style.fontSize = object.style.fontSize;
                shadow.style.fontFamily = object.style.fontFamily;
                shadow.style.color = object.style.color;
                shadow.innerHTML = object.data.client.html();
            }

            /*
            shadow.style.MozBorderRadius = "5px";
            shadow.style.webkitBorderRadius = "5px";
            shadow.style.borderRadius = "5px";
            */

            parentTd.firstChild.appendChild(shadow);

            return shadow;
        };
        
        
        this._resolved = {};
        this._resolved.locale = function() {
            var found = DayPilot.Locale.find(calendar.locale);
            if (!found) {
                return DayPilot.Locale.US;
            }
            return found;
        };

        this._resolved.timeFormat = function() {
            if (calendar.timeFormat !== 'Auto') {
                return calendar.timeFormat;
            }
            return this.locale().timeFormat;
        };
        
        var resolved = this._resolved;
        
        this.updateView = function(result, context) {

            if (result && result.indexOf("$$$") === 0) {
                if (window.console) {
                    console.log("Error received from the server side: " + result);
                }
                else {
                    throw "Error received from the server side: " + result;
                }
                return;
            }
        
            var result = eval("(" + result + ")");

            if (result.CallBackRedirect) {
                document.location.href = result.CallBackRedirect;
                return;
            }

            if (result.UpdateType === "None") {
                calendar.loadingStop();
                calendar._show();
                return;
            }

            calendar.deleteEvents();
            
            if (result.UpdateType === "Full") {
                
                calendar.columns = result.Columns;

                // properties
                calendar.days = result.Days; 
                calendar.startDate = new DayPilot.Date(result.StartDate);
                calendar.heightSpec = result.HeightSpec ? result.HeightSpec : calendar.heightSpec; 
                calendar.businessBeginsHour = result.BusinessBeginsHour ? result.BusinessBeginsHour : calendar.businessBeginsHour;
                calendar.businessEndsHour = result.BusinessEndsHour ? result.BusinessEndsHour : calendar.businessEndsHour;
                calendar.headerDateFormat = result.HeaderDateFormat ? result.HeaderDateFormat : calendar.headerDateFormat;
                calendar.viewType = result.ViewType; //
                calendar.backColor = result.BackColor ? result.BackColor : calendar.backColor;
                calendar.eventHeaderVisible = result.EventHeaderVisible ? result.EventHeaderVisible : calendar.eventHeaderVisible;
                calendar.timeFormat = result.TimeFormat ? result.TimeFormat : calendar.timeFormat;
                calendar.locale = result.Locale ? result.Locale : calendar.locale;
				
                calendar.prepareColumns();
            }  

            // hashes
            if (result.Hashes) {
                for (var key in result.Hashes) {
                    calendar.hashes[key] = result.Hashes[key];
                }
            }
            
            calendar.events.list = result.Events;
            calendar.loadEvents();
            calendar.updateHeaderHeight();
            
            if (result.UpdateType === "Full") {
                calendar.drawHeader();
                calendar.drawMain();
                calendar.drawHourTable();
                calendar.updateHeight();
            }
            
            calendar._show();
			
            calendar.drawEvents();
            calendar.clearSelection();

            calendar.afterRender(result.CallBackData, true);
            
            calendar.loadingStop();
            
        };

        this.durationHours = function() {
            return 24;
        };
        
        this.businessHoursSpan = function() {
                if (this.businessBeginsHour > this.businessEndsHour) {
                    return 24 - this.businessBeginsHour + this.businessEndsHour;
                }
                else {
                    return this.businessEndsHour - this.businessBeginsHour;
                }
        };
        
        this.rowCount = function() {
            return 48;
        };
        
        this._api2 = function() {
            return calendar.api === 2;
        };  

        this.eventClickCallBack = function(e, data) { 
            this._callBack2('EventClick', data, e);
        };
        
        this.eventClickPostBack = function(e, data) {
            this._postBack2('EventClick', data, e);
        };

        this.eventClickDispatch = function (e) {
            var thisDiv = this;
            
            var e = thisDiv.event;

            if (calendar._api2()) {
                
                var args = {};
                args.e = e;
                args.preventDefault = function() {
                    this.preventDefault.value = true;
                };

                if (typeof calendar.onEventClick === 'function') {
                    calendar._angular.apply(function() {
                        calendar.onEventClick(args);
                    });
                    if (args.preventDefault.value) {
                        return;
                    }
                }

                switch (calendar.eventClickHandling) {
                    case 'CallBack':
                        calendar.eventClickCallBack(e);
                        break;
                    case 'PostBack':
                        calendar.eventClickPostBack(e);
                        break;
                }

                if (typeof calendar.onEventClicked === 'function') {
                    calendar._angular.apply(function() {
                        calendar.onEventClicked(args);
                    });
                }                
            }
            else {
                switch (calendar.eventClickHandling) {
                    case 'PostBack':
                        calendar.eventClickPostBack(e);
                        break;
                    case 'CallBack':
                        calendar.eventClickCallBack(e);
                        break;
                    case 'JavaScript':
                        calendar.onEventClick(e);
                        break;
                }
            }
        
        };
        
        this.eventResizeCallBack = function(e, newStart, newEnd, data) { 
            if (!newStart)
                throw 'newStart is null';
            if (!newEnd)
                throw 'newEnd is null';

            var params = {};
            params.e = e;
            params.newStart = newStart;
            params.newEnd = newEnd;

            this._callBack2('EventResize', data, params);
        };
        
        this.eventResizePostBack = function(e, newStart, newEnd, data) {
            if (!newStart)
                throw 'newStart is null';
            if (!newEnd)
                throw 'newEnd is null';

            var params = {};
            params.e = e;
            params.newStart = newStart;
            params.newEnd = newEnd;

            this._postBack2('EventResize', data, params);
        };

        this.eventResizeDispatch = function (e, shadowHeight, shadowTop, border ) {
            var _startOffset = 1;
            
            var newStart = new Date();
            var newEnd = new Date();
            
            var start = e.start();
            var end = e.end();
            
            if (border === 'top') {
                var day = start.getDatePart();
                var step = Math.floor((shadowTop - _startOffset) / calendar.cellHeight);
                var minutes = step * 30;
                var ts = minutes * 60 * 1000;

                newStart = day.addTime(ts);
                newEnd = e.end();
                
            }
            else if (border === 'bottom') {
                var day = end.getDatePart();
                var step = Math.floor((shadowTop + shadowHeight - _startOffset) / calendar.cellHeight);
                var minutes = step * 30;
                var ts = minutes * 60 * 1000;

                newStart = start;
                newEnd = day.addTime(ts);
            }
        
            if (calendar._api2()) {
                // API v2
                var args = {};

                args.e = e;
                args.newStart = newStart;
                args.newEnd = newEnd;
                args.preventDefault = function() {
                    this.preventDefault.value = true;
                };

                if (typeof calendar.onEventResize === 'function') {
                    calendar._angular.apply(function() {
                        calendar.onEventResize(args);
                    });
                    if (args.preventDefault.value) {
                        return;
                    }
                }
                
                switch (calendar.eventResizeHandling) {
                    case 'PostBack':
                        calendar.eventResizePostBack(e, newStart, newEnd);
                        break;
                    case 'CallBack':
                        calendar.eventResizeCallBack(e, newStart, newEnd);
                        break;
                    case 'Update':
                        e.start(newStart);
                        e.end(newEnd);
                        calendar.events.update(e);
                        break;
                }
                
                if (typeof calendar.onEventResized === 'function') {
                    calendar._angular.apply(function() {
                        calendar.onEventResized(args);
                    });
                }
            }
            else {
                switch (calendar.eventResizeHandling) {
                    case 'PostBack':
                        calendar.eventResizePostBack(e, newStart, newEnd);
                        break;
                    case 'CallBack':
                        calendar.eventResizeCallBack(e, newStart, newEnd);
                        break;
                    case 'JavaScript':
                        calendar.onEventResize(e, newStart, newEnd);
                        break;
                }
            }
        };
        
        this.eventMovePostBack = function(e, newStart, newEnd, newResource, data) {
            if (!newStart)
                throw 'newStart is null';
            if (!newEnd)
                throw 'newEnd is null';

            var params = {};
            params.e = e;
            params.newStart = newStart;
            params.newEnd = newEnd;
            
            this._postBack2('EventMove', data, params);
        };
        
        this.eventMoveCallBack = function(e, newStart, newEnd, newResource, data) {
            if (!newStart)
                throw 'newStart is null';
            if (!newEnd)
                throw 'newEnd is null';

            var params = {};
            params.e = e;
            params.newStart = newStart;
            params.newEnd = newEnd;

            this._callBack2('EventMove', data, params);
        };

        this.eventMoveDispatch = function (e, newColumnIndex, shadowTop, ev) {
            var _startOffset = 1;
            var step = Math.floor((shadowTop - _startOffset) / calendar.cellHeight);
            
            var boxStart = step * 30 * 60 * 1000;
            var start = e.start();
            var end = e.end();
            var day = new Date();

            if (start instanceof DayPilot.Date) {
                start = start.toDate();
            }
            day.setTime(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
            
            var startOffset = start.getTime() - (day.getTime() + start.getUTCHours() * 3600 *1000 + Math.floor(start.getUTCMinutes()/30)*30*60*1000 );
            var length = end.getTime() - start.getTime();

            var newColumn = this.columns[newColumnIndex];
            
            var date = newColumn.Start.getTime();
            var newStartUTC = new Date();
            newStartUTC.setTime(date + boxStart + startOffset);
            
            var newStart = new DayPilot.Date(newStartUTC);
            
            var newEnd = newStart.addTime(length);
        
            
            if (calendar._api2()) {
                // API v2
                var args = {};

                args.e = e;
                args.newStart = newStart;
                args.newEnd = newEnd;
                args.preventDefault = function() {
                    this.preventDefault.value = true;
                };

                if (typeof calendar.onEventMove === 'function') {
                    calendar._angular.apply(function() {
                        calendar.onEventMove(args);
                    });
                    if (args.preventDefault.value) {
                        return;
                    }
                }
                
                switch (calendar.eventMoveHandling) {
                    case 'PostBack':
                        calendar.eventMovePostBack(e, newStart, newEnd, newColumn.Value);
                        break;
                    case 'CallBack':
                        calendar.eventMoveCallBack(e, newStart, newEnd, newColumn.Value);
                        break;
                    case 'Update':
                        e.start(newStart);
                        e.end(newEnd);
                        calendar.events.update(e);
                        break;
                }
                
                if (typeof calendar.onEventMoved === 'function') {
                    calendar._angular.apply(function() {
                        calendar.onEventMoved(args);
                    });
                }
            }
            else {
                switch (calendar.eventMoveHandling) {
                    case 'PostBack':
                        calendar.eventMovePostBack(e, newStart, newEnd, newColumn.Value);
                        break;
                    case 'CallBack':
                        calendar.eventMoveCallBack(e, newStart, newEnd, newColumn.Value);
                        break;
                    case 'JavaScript':
                        calendar.onEventMove(e, newStart, newEnd, newColumn.Value, false);
                        break;
                }
            }
        
        };    
        
        this.timeRangeSelectedPostBack = function(start, end, resource, data) {
            
            var range = {};
            range.start = start;
            range.end = end;
            
            this._postBack2('TimeRangeSelected', data, range);
        };   
        
        this.timeRangeSelectedCallBack = function(start, end, resource, data) {

            var range = {};
            range.start = start;
            range.end = end;

            this._callBack2('TimeRangeSelected', data, range);
        };

        this.timeRangeSelectedDispatch = function (start, end) {
            
            // make sure it's DayPilot.Date
            start = new DayPilot.Date(start);
            end = new DayPilot.Date(end);
            
            if (this._api2()) {
                var args = {};
                args.start = start;
                args.end = end;
                args.preventDefault = function() {
                    this.preventDefault.value = true;
                };
                
                if (typeof calendar.onTimeRangeSelect === 'function') {
                    calendar._angular.apply(function() {
                        calendar.onTimeRangeSelect(args);
                    });
                    if (args.preventDefault.value) {
                        return;
                    }
                }

                // now perform the default builtin action
                switch (calendar.timeRangeSelectedHandling) {
                    case 'PostBack':
                        calendar.timeRangeSelectedPostBack(start, end);
                        break;
                    case 'CallBack':
                        calendar.timeRangeSelectedCallBack(start, end);
                        break;
                }
                
                if (typeof calendar.onTimeRangeSelected === 'function') {
                    calendar._angular.apply(function() {
                        calendar.onTimeRangeSelected(args);
                    });
                }
            }
            else {
                switch (calendar.timeRangeSelectedHandling) {
                    case 'PostBack':
                        calendar.timeRangeSelectedPostBack(start, end);
                        break;
                    case 'CallBack':
                        calendar.timeRangeSelectedCallBack(start, end);
                        break;
                    case 'JavaScript':
                        calendar.onTimeRangeSelected(start, end);
                        break;
                }     
            }
        };

        this.onCellMousedown = function(ev) {
        
            if (DayPilotCalendar.selecting) {
                return;
            }
                
            if (calendar.timeRangeSelectedHandling === "Disabled") {
                return;
            }
            
            var button = (window.event) ? window.event.button : ev.which;    
            if (button !== 1 && button !== 0) {  // Khtml says first button is 0
                return;
            }
        
            DayPilotCalendar.firstMousePos = DayPilot.mc(ev || window.event);
            DayPilotCalendar.selecting = {};
            DayPilotCalendar.selecting.calendar = calendar;
            if (DayPilotCalendar.selectedCells) {
                calendar.clearSelection();
                DayPilotCalendar.selectedCells = [];
            }
            DayPilotCalendar.column = DayPilotCalendar.getColumn(this);
            DayPilotCalendar.selectedCells.push(this);
            DayPilotCalendar.firstSelected = this;
            
            DayPilotCalendar.topSelectedCell = this;
            DayPilotCalendar.bottomSelectedCell = this;

            calendar.activateSelection();

            return false;
        };
        
        this.activateSelection = function() {
            var selection = this.getSelection();
            
            // color them
            for(var j = 0; j < DayPilotCalendar.selectedCells.length; j++) {
                var cell = DayPilotCalendar.selectedCells[j];
                if (cell && !cell.selected) {
                    var div = document.createElement("div");
                    div.style.height = (calendar.cellHeight - 1) + "px";
                    div.style.backgroundColor = calendar.selectedColor;
                    cell.firstChild.style.display = "none";
                    cell.insertBefore(div, cell.firstChild);
                    
                    cell.selected = div;
                }
            }
        };
        
        this.mousemove = function(ev) {
            
            if (typeof (DayPilotCalendar) === 'undefined') {
                return;
            }
            
            if (!DayPilotCalendar.selecting) {
                return;
            }
                
            var mousePos = DayPilot.mc(ev || window.event);
            
            var thisColumn = DayPilotCalendar.getColumn(this);
            if (thisColumn !== DayPilotCalendar.column) {
                return;
            }
            
            // clean
            calendar.clearSelection();

            // new selected cells
            if (mousePos.y < DayPilotCalendar.firstMousePos.y) {
                DayPilotCalendar.selectedCells = DayPilotCalendar.getCellsBelow(this);
                DayPilotCalendar.topSelectedCell = DayPilotCalendar.selectedCells[0];
                DayPilotCalendar.bottomSelectedCell = DayPilotCalendar.firstSelected;
            }
            else {
                DayPilotCalendar.selectedCells = DayPilotCalendar.getCellsAbove(this);
                DayPilotCalendar.topSelectedCell = DayPilotCalendar.firstSelected;
                DayPilotCalendar.bottomSelectedCell = DayPilotCalendar.selectedCells[0];
            }
            
            calendar.activateSelection();
        };
        
        this.getSelection = function() {
                var start = DayPilotCalendar.topSelectedCell.start;
                var end = DayPilotCalendar.bottomSelectedCell.end;

                return new DayPilot.Selection(start, end, null, calendar); 
        };
        
        this.mouseup = function (ev){
            /*
            if (DayPilotCalendar.selecting && DayPilotCalendar.topSelectedCell !== null) {
                DayPilotCalendar.selecting = false;
                
                var sel = calendar.getSelection();
                
                calendar.timeRangeSelectedDispatch(sel.start, sel.end);
                if (calendar.timeRangeSelectedHandling !== "Hold" && calendar.timeRangeSelectedHandling !== "HoldForever") {
                    doNothing();
                }
            }
            else {
                DayPilotCalendar.selecting = false;
            }
            */
        };    

        this.prepareColumns = function() {
            this.columns = this._createDaysViewColumns();
            
            for (var i = 0; i < this.columns.length; i++) {
                this.activateColumn(this.columns[i]);
            }
        };
        
        this.activateColumn = function(column) {
            column.Start = new DayPilot.Date(column.Start);
        
            column.putIntoBlock = function(ep) {
                
                for (var i = 0; i < this.blocks.length; i++) {
                    var block = this.blocks[i];
                    if (block.overlapsWith(ep.part.top, ep.part.height)) {
                        block.events.push(ep);
                        block.min = Math.min(block.min, ep.part.top);
                        block.max = Math.max(block.max, ep.part.top + ep.part.height);
                        return i;
                    }
                }    
                
                // no suitable block found, create a new one
                var block = [];
                block.lines = [];
                block.events = [];

                block.overlapsWith = function(start, width) {
                    var end = start + width - 1;
                    
                    if (!(end < this.min || start > this.max - 1)) {
                        return true;
                    }
                    
                    return false;
                };
                block.putIntoLine = function (ep) {
                    var thisCol = this;
                
                    for (var i = 0; i < this.lines.length; i++) {
                        var line = this.lines[i];
                        if (line.isFree(ep.part.top, ep.part.height)) {
                            line.push(ep);
                            return i;
                        }
                    }
                    
                    var line = [];
                    line.isFree = function(start, width) {
                        var end = start + width - 1;
                        var max = this.length;
                        
                        for (var i = 0; i < max; i++) {
                            var e = this[i];
                            if (!(end < e.part.top || start > e.part.top + e.part.height - 1)) {
                                return false;
                            }
                        }
                        
                        return true;
                    };

                    line.push(ep);
                    
                    this.lines.push(line);
                    
                    return this.lines.length - 1;
                
                };
               
                block.events.push(ep);
                block.min = ep.part.top;
                block.max = ep.part.top + ep.part.height;
                
                this.blocks.push(block);
                
                return this.blocks.length - 1;
            
            };
            
            column.putIntoLine = function(ep) {
                var thisCol = this;
            
                for (var i = 0; i < this.lines.length; i++) {
                    var line = this.lines[i];
                    if (line.isFree(ep.part.top, ep.part.height)) {
                        line.push(ep);
                        return i;
                    }
                }
                
                var line = [];
                line.isFree = function(start, width) {
                    var end = start + width - 1;
                    var max = this.length;
                    
                    for (var i = 0; i < max; i++) {
                        var e = this[i];
                        if (!(end < e.part.top || start > e.part.top + e.part.height - 1)) {
                            return false;
                        }
                    }
                    
                    return true;
                };
                
                line.push(ep);
                
                this.lines.push(line);
                
                return this.lines.length - 1;
            };
            
        };
       
        this._createDaysViewColumns = function() {
            var columns = [];
            
            var start = this.startDate.getDatePart();

            var days = this.days;
            switch (this.viewType) {
                case "Day":
                    days = 1;
                    break;
                case "Week":
                    days = 7;
                    // TODO let weekStarts property override it?
                    start = start.firstDayOfWeek(resolved.locale().weekStarts);
                    break;
                case "WorkWeek":
                    days = 5;
                    start = start.firstDayOfWeek(1); // Monday
                    break;
            }

            /*
            if (this.heightSpec === 'BusinessHoursNoScroll') {
                start = start.addHours(this.businessBeginsHour);
            }
            */
            
            for (var i = 0; i < days; i++) {

                var format = calendar.headerDateFormat ? calendar.headerDateFormat : resolved.locale().datePattern;

                var column = {};
                column.Start = start.addDays(i);
                column.Name = column.Start.toString(format, resolved.locale());
                column.InnerHTML = column.Name;

                columns.push(column);
            }
            
            return columns;
        };      
        
        this.visibleStart = function() {
            return this.columns[0].Start;
        };
        
        this.visibleEnd = function() {
            var max = this.columns.length - 1;
            return this.columns[max].Start.addDays(1);
        };
       
        
        this._prefixCssClass = function(part) {
            var prefix = this.theme || this.cssClassPrefix;
            if (prefix) {
                return prefix + part;
            }
            else {
                return "";
            }
        };       
        
        this.deleteEvents = function() {
        
            if (this.elements.events) {   
                
                for (var i = 0; i < this.elements.events.length; i++) {
                    var div = this.elements.events[i];
                    
                    var object = div.event;
                    if (object) {
                        object.calendar = null;
                    }
                    
                    div.onclick = null;
                    div.onclickSave = null;
                    div.onmouseover = null;
                    div.onmouseout = null;
                    div.onmousemove = null;
                    div.onmousedown = null;
                    
                    if (div.firstChild && div.firstChild.firstChild && div.firstChild.firstChild.tagName && div.firstChild.firstChild.tagName.toUpperCase() === 'IMG') {
                        var img = div.firstChild.firstChild;
                        img.onmousedown = null;
                        img.onmousemove = null;
                        img.onclick = null;
                        
                    }
                    
                    div.helper = null;
                    div.data = null;
                    div.event = null;
                    
                    DayPilot.de(div);
                }
            }
            this.elements.events = [];
        };
        
        this._drawEvent = function(e) {
            /*

            supported e.data properties:
            * text
            * html
            * cssClass
            * backColor
            * barColor
            * barBackColor
            * toolTip
            * barHidden
            * borderColor
            * fontColor

             */


            var data = e.cache || e.data;

            var main = this.nav.events;

            var rounded = true;
            var radius = true;
            var pixels = false;

            var borderColor = this.eventBorderColor;
            
            var div = document.createElement("div");
            div.style.position = 'absolute';
            div.style.left = e.part.left + '%';
            div.style.top = (e.part.top) + 'px';
            div.style.width = e.part.width + '%';
            div.style.height = Math.max(e.part.height, 2) + 'px';
            div.style.overflow = 'hidden';

            // TODO unify
            div.data = e;
            div.event = e;
            
            div.unselectable = 'on';
            div.style.MozUserSelect = 'none';
            div.style.KhtmlUserSelect = 'none';

            div.className = this._prefixCssClass("_event");

            if (data.cssClass) {
                DayPilot.Util.addClass(div, data.cssClass);
            }
            
            div.isFirst = e.part.start.getTime() === e.start().getTime();
            div.isLast = e.part.end.getTime() === e.end().getTime();

            div.onclick = this.eventClickDispatch;
            
            div.onmousemove = function (ev) {
                // const
                var resizeMargin = 5;
                var moveMargin = calendar.eventHeaderVisible ? (calendar.eventHeaderHeight) : 10;

                if (typeof(DayPilotCalendar) === 'undefined') {
                    return;
                }

                // position
                var offset = DayPilot.mo3(div, ev);
                if (!offset) {
                    return;
                }

                if (DayPilotCalendar.resizing || DayPilotCalendar.moving) {
                    return;
                }

                var isLastPart = this.isLast;

                if (offset.y <= moveMargin && calendar.eventResizeHandling !== 'Disabled') {
                    this.style.cursor = "n-resize";
                    this.dpBorder = 'top';
                }
                else if (this.offsetHeight - offset.y <= resizeMargin && calendar.eventResizeHandling !== 'Disabled') {
                    if (isLastPart) {
                        this.style.cursor = "s-resize";
                        this.dpBorder = 'bottom';
                    }
                    else {
                        this.style.cursor = 'not-allowed';
                    }
                }
                else if (!DayPilotCalendar.resizing && !DayPilotCalendar.moving) {
                    if (calendar.eventClickHandling !== 'Disabled') {
                        this.style.cursor = 'pointer';        
                    }
                    else {
                        this.style.cursor = 'default';        
                    }
                }

            };

            div.onmousedown = function (ev) {
                ev = ev || window.event;
                var button = ev.which || ev.button;

                if ((this.style.cursor === 'n-resize' || this.style.cursor === 's-resize') && button === 1) {
                    // set
                    DayPilotCalendar.resizing = this;
                    DayPilotCalendar.originalMouse = DayPilot.mc(ev);
                    DayPilotCalendar.originalHeight = this.offsetHeight;
                    DayPilotCalendar.originalTop = this.offsetTop;

                    calendar.nav.top.style.cursor = this.style.cursor;

                }
                else if (button === 1 && calendar.eventMoveHandling !== 'Disabled') {
                    DayPilotCalendar.moving = this;
                    DayPilotCalendar.moving.event = this.event;
                    var helper = DayPilotCalendar.moving.helper = {};
                    helper.oldColumn = calendar.columns[this.data.part.dayIndex].Value;
                    DayPilotCalendar.originalMouse = DayPilot.mc(ev);
                    DayPilotCalendar.originalTop = this.offsetTop;

                    var offset = DayPilot.mo3(this, ev);
                    if (offset) {
                        DayPilotCalendar.moveOffsetY = offset.y;
                    }
                    else {
                        DayPilotCalendar.moveOffsetY = 0;
                    }

                    // cursor
                    //document.body.style.cursor = 'move';
                    calendar.nav.top.style.cursor = 'move';
                }

                return false;
            };
            
            
            var inner = document.createElement("div");
            inner.setAttribute("unselectable", "on");
            inner.className = calendar._prefixCssClass("_event_inner");
            inner.innerHTML = e.client.html();

            if (data.borderColor) {
                inner.style.borderColor = data.borderColor;
            }

            if (data.backColor) {
                inner.style.background = data.backColor;
                if (DayPilot.browser.ie9 || DayPilot.browser.ielt9) {
                    inner.style.filter = '';
                }
            }

            if (data.fontColor) {
                inner.style.color = data.fontColor;
            }

            div.appendChild(inner);

            // TODO
            if (e.client.barVisible()) {
                var height = e.part.height - 2;
                var barTop =  100 * e.part.barTop / height; // %
                var barHeight = Math.ceil(100 * e.part.barHeight / height); // %

                var bar = document.createElement("div");
                bar.setAttribute("unselectable", "on");
                bar.className = this._prefixCssClass("_event_bar");
                bar.style.position = "absolute";

                if (data.barBackColor) {
                    bar.style.backgroundColor = data.barBackColor;
                }

                var barInner = document.createElement("div");
                barInner.setAttribute("unselectable", "on");
                barInner.className = this._prefixCssClass("_event_bar_inner");
                barInner.style.top = barTop + "%";
                if (0 < barHeight && barHeight <= 1) {
                    barInner.style.height = "1px";
                }
                else {
                    barInner.style.height = barHeight + "%";
                }

                if (data.barColor) {
                    barInner.style.backgroundColor = data.barColor;
                }

                bar.appendChild(barInner);
                div.appendChild(bar);
            }

            if (main.rows[0].cells[e.part.dayIndex]) { // temporary fix for multirow header, but won't hurt later
                var wrapper = main.rows[0].cells[e.part.dayIndex].firstChild;
                wrapper.appendChild(div);
                
                calendar.makeChildrenUnselectable(div);
                
                //var e = new DayPilotCalendar.Event(div, calendar);
            }
            
            calendar.elements.events.push(div);
        };
        
        this.makeChildrenUnselectable = function(el) {
            var c = (el && el.childNodes) ? el.childNodes.length : 0;
            for (var i = 0; i < c; i++) {
                try {
                    var child = el.childNodes[i];
                    if (child.nodeType === 1) {
                        child.unselectable = 'on';
                        this.makeChildrenUnselectable(child);
                    }
                }
                catch (e) {
                }
            }
        };

        this.drawEvents = function() {
            
            //var start = new Date();
            
            for (var i = 0; i < this.columns.length; i++) {
                var col = this.columns[i];
                if (!col.blocks) {
                    continue;
                }
                
                for (var m = 0; m < col.blocks.length; m++) {
                    var block = col.blocks[m];
                    for (var j = 0; j < block.lines.length; j++) {
                        var line = block.lines[j];
                        
                        for(var k = 0; k < line.length; k++) {
                            var e = line[k];  
                            
                            e.part.width = 100 / block.lines.length;
                            e.part.left = e.part.width * j;
                            
                            var isLastBlock = (j === block.lines.length - 1);
                            if (!isLastBlock) {
                                e.part.width = e.part.width * 1.5;
                            }

                            this._drawEvent(e);
                        }
                    }
                }            
            }
            
            //var end = new Date();
            //var diff = end.getTime() - start.getTime();
        };
        
        this.drawTop = function() {
        
            //this.nav.top = document.getElementById(this.id);
            this.nav.top.innerHTML = '';
            
            if (this.cssOnly) {
                DayPilot.Util.addClass(this.nav.top, this._prefixCssClass("_main"));
            }
            else {
                this.nav.top.style.lineHeight = "1.2";
                this.nav.top.style.textAlign = "left";
            }
            
            this.nav.top.style.MozUserSelect = 'none';
            this.nav.top.style.KhtmlUserSelect = 'none';
            this.nav.top.style.position = 'relative';
            this.nav.top.style.width = this.width ? this.width : '100%';

            if (this.hideUntilInit) {
                this.nav.top.style.visibility = 'hidden';
            }

            if (!this.visible) {
                this.nav.top.style.display = "none";
            }
            
            this.nav.scroll = document.createElement("div");
            this.nav.scroll.style.height = this.getScrollableHeight() + "px";
            
            if (this.heightSpec === 'BusinessHours') {
                this.nav.scroll.style.overflow = "auto";
            }
            else
            {
                this.nav.scroll.style.overflow = "hidden";
            }

            this.nav.scroll.style.position = "relative";
            
            if (!this.cssOnly) {
                this.nav.scroll.style.border = "1px solid " + this.borderColor;
                this.nav.scroll.style.backgroundColor = this.hourNameBackColor;
            }

            var header = this.drawTopHeaderDiv();
            this.nav.top.appendChild(header);
            
            // fixing the column alignment bug
            // solved thanks to http://stackoverflow.com/questions/139000/div-with-overflowauto-and-a-100-wide-table-problem
            this.nav.scroll.style.zoom = 1;

            var wrap = this.drawScrollable();
            this.nav.scrollable = wrap.firstChild;
            this.nav.scroll.appendChild(wrap);
            this.nav.top.appendChild(this.nav.scroll);                

            this.nav.scrollLayer = document.createElement("div");
            this.nav.scrollLayer.style.position = 'absolute';
            this.nav.scrollLayer.style.top = '0px';
            this.nav.scrollLayer.style.left = '0px';
            this.nav.top.appendChild(this.nav.scrollLayer);

            this.nav.loading = document.createElement("div");
            this.nav.loading.style.position = 'absolute';
            this.nav.loading.style.top = '0px';
            this.nav.loading.style.left = (this.hourWidth + 5) + "px";
            this.nav.loading.style.backgroundColor = this.loadingLabelBackColor;
            this.nav.loading.style.fontSize = this.loadingLabelFontSize;
            this.nav.loading.style.fontFamily = this.loadingLabelFontFamily;
            this.nav.loading.style.color = this.loadingLabelFontColor;
            this.nav.loading.style.padding = '2px';
            this.nav.loading.innerHTML = this.loadingLabelText;
            this.nav.loading.style.display = 'none';
        
            this.nav.top.appendChild(this.nav.loading);

        };
        
        // used during full update
        this.drawHourTable = function() {
            // clear old hour table
            if (!this.fasterDispose) DayPilot.pu(this.nav.hourTable);
            this.nav.scrollable.rows[0].cells[0].innerHTML = '';
            this.nav.hourTable = this.createHourTable();
            this.nav.scrollable.rows[0].cells[0].appendChild(this.nav.hourTable);
        };
        
        // used during initial load only
        this.drawScrollable = function() {
            var zoom = document.createElement("div");
            zoom.style.zoom = 1;
            zoom.style.position = 'relative';
        
            var table = document.createElement("table");
            
            table.cellSpacing = "0";
            table.cellPadding = "0";
            table.border = "0";
            table.style.border = "0px none";
            table.style.width = "100%";
            table.style.position = 'absolute';
            
            var r = table.insertRow(-1);
            
            var c;
            c = r.insertCell(-1);
            c.valign = "top";
            c.style.padding = '0px';
            c.style.border = '0px none';
            
            this.nav.hourTable = this.createHourTable();
            c.appendChild(this.nav.hourTable);
            
            c = r.insertCell(-1);
            c.valign = "top";
            c.width = "100%";
            c.style.padding = '0px';
            c.style.border = '0px none';
            
            if (!this.cssOnly) {
                c.appendChild(this.createEventsAndCells());
            }
            else {
                var wrap = document.createElement("div");
                wrap.style.position = "relative";
                c.appendChild(wrap);
                
                wrap.appendChild(this.createEventsAndCells());
                wrap.appendChild(this._createEventsTable());
            }
            
            zoom.appendChild(table);
            
            this.nav.zoom = zoom;
            
            return zoom;
        };
        
        this.createEventsAndCells = function() {
            var table = document.createElement("table");
            
            table.cellPadding = "0";
            table.cellSpacing = "0";
            table.border = "0";
            table.style.width = "100%";
            table.style.border = "0px none";
            table.style.tableLayout = 'fixed';
            if (!this.cssOnly) {
                table.style.borderLeft = "1px solid " + this.borderColor;
            }

            this.nav.main = table;
            this.nav.events = table;
            
            return table;
        };
        
        this._createEventsTable = function() {
            var table = document.createElement("table");

            //table.style.position = "absolute";
            table.style.top = "0px";
            table.cellPadding = "0";
            table.cellSpacing = "0";
            table.border = "0";
            table.style.position = "absolute";
            table.style.width = "100%";
            table.style.border = "0px none";
            table.style.tableLayout = 'fixed';
            //table.setAttribute("events", "true");

            this.nav.events = table;
            var create = true;
            var columns = this.columns;
            var cl = columns.length;

            var r = (create) ? table.insertRow(-1) : table.rows[0];

            for (var j = 0; j < cl; j++) {
                var c = (create) ? r.insertCell(-1) : r.cells[j];

                if (create) {

                    c.style.padding = '0px';
                    c.style.border = '0px none';
                    c.style.height = '0px';
                    c.style.overflow = 'visible';
                    if (!calendar.rtl) {
                        c.style.textAlign = 'left';
                    }

                    // withpct
                    //c.style.width = (100.0 / columns.length) + "%";

                    var div = document.createElement("div");
                    div.style.marginRight = calendar.columnMarginRight + "px";
                    div.style.position = 'relative';
                    div.style.height = '1px';
                    if (!this.cssOnly) {
                        div.style.fontSize = '1px';
                        div.style.lineHeight = '1.2';
                    }
                    div.style.marginTop = '-1px';

                    c.appendChild(div);

                }
            }

            return table;
        };       
        
        this.createHourTable = function() {
            var table = document.createElement("table");
            table.cellSpacing = "0";
            table.cellPadding = "0";
            table.border = "0";
            table.style.border = '0px none';
            table.style.width = this.hourWidth + "px";
            table.oncontextmenu = function() { return false; };
            
            var extraRow = this.cssOnly ? 0 : 1;
            
            if (extraRow) {
                var r = table.insertRow(-1);
                r.style.height = "1px";  // maybe has no effect
                r.style.backgroundColor = "white";

                var c = r.insertCell(-1);
                c.style.padding = '0px';
                c.style.border = '0px none';
            }

            var hours = 24;
            for (var i = 0; i < hours; i++) {
                this.createHourRow(table, i);
            }
            
            return table;
        
        };
        
        this.createHourRow = function(table, i) {
            var height = (this.cellHeight * 2);
        
            var r = table.insertRow(-1);
            r.style.height = height + "px";
            
            var c = r.insertCell(-1);
            c.valign = "bottom";
            c.unselectable = "on";
            if (!this.cssOnly) {
                c.style.backgroundColor = this.hourNameBackColor;
            }
            c.style.cursor = "default";
            c.style.padding = '0px';
            c.style.border = '0px none';
            
            var frame = document.createElement("div");
            frame.style.position = "relative";
            if (this.cssOnly) {
                frame.className = this._prefixCssClass("_rowheader");
            }            
            frame.style.width = this.hourWidth + "px";
            frame.style.height = (height) + "px";
            frame.style.overflow = 'hidden';
            frame.unselectable = 'on';
            
            var block = document.createElement("div");
            //block.style.display = "block";
            if (this.cssOnly) {
                block.className = this._prefixCssClass("_rowheader_inner");
            }
            else {
                block.style.borderBottom = "1px solid " + this.hourNameBorderColor;
                block.style.textAlign = "right";
            }
            block.style.height = (height - 1) + "px";
            block.unselectable = "on";
            
            var text = document.createElement("div");
            if (!this.cssOnly) {
                text.style.padding = "2px";
                text.style.fontFamily = this.hourFontFamily;
                text.style.fontSize = this.hourFontSize;
                text.style.color = this.hourFontColor;
            }
            text.unselectable = "on";

            var start = this.startDate.addHours(i);
            var hour = start.getHours();
            
            var am = hour < 12;
            var timeFormat = resolved.timeFormat();
            if (timeFormat === "Clock12Hours") {
                hour = hour % 12;
                if (hour === 0) {
                    hour = 12;
                }   
            }
            
            text.innerHTML = hour;
            
            var span = document.createElement("span");
            span.unselectable = "on";
            if (!this.cssOnly) {
                span.style.fontSize = "10px";
                span.style.verticalAlign = "super";
            }
            else {
                span.className = this._prefixCssClass("_rowheader_minutes");
            }            
            
            
            var sup;
            if (timeFormat === "Clock12Hours") {
                if (am) {
                    sup = "AM";
                }
                else {
                    sup = "PM";
                }
            }
            else {
                sup = "00";
            }
            
            if (!this.cssOnly) {
                span.innerHTML = "&nbsp;" + sup;
            }
            else {
                span.innerHTML = sup;
            }
            
            text.appendChild(span);

            block.appendChild(text);        

            frame.appendChild(block);

            c.appendChild(frame);
        };
        
        this.getScrollableHeight = function() {
            switch (this.heightSpec) {
                case "Full":
                    return (24 * 2 * this.cellHeight);    
                case "BusinessHours":
                    var dHours = this.businessHoursSpan();
                    return dHours * this.cellHeight * 2;
                case "BusinessHoursNoScroll":
                    var dHours = this.businessHoursSpan();
                    return dHours * this.cellHeight * 2;
                default:
                    throw "DayPilot.Calendar: Unexpected 'heightSpec' value.";
                    
            }
        };

        this._updateCorner = function() {
            var parent = calendar.nav.corner ? calendar.nav.corner.parentNode : null;
            if (!parent) {
                return;
            }

            parent.innerHTML = '';

            var corner = this.drawCorner();
            parent.appendChild(corner);
            calendar.nav.corner = corner;

        };
        
        this.drawTopHeaderDiv = function() {
            var header = document.createElement("div");
            if (!this.cssOnly) {
                header.style.borderLeft = "1px solid " + this.borderColor;
                header.style.borderRight = "1px solid " + this.borderColor;
            }
            header.style.overflow = "auto";
            
            var table = document.createElement("table");
            table.cellPadding = "0";
            table.cellSpacing = "0";
            table.border = "0";
            table.style.width = "100%";
            table.style.borderCollapse = 'separate';
            table.style.border = "0px none";
            
            var r = table.insertRow(-1);
            
            // corner
            var c = r.insertCell(-1);
            c.style.padding = '0px';
            c.style.border = '0px none';
            
            var corner = this.drawCorner();
            c.appendChild(corner);
            this.nav.corner = corner;
            
            // top header
            c = r.insertCell(-1);
            
            c.style.width = "100%";
            if (!this.cssOnly) {
                c.style.backgroundColor = this.hourNameBackColor;
            }
            c.valign = "top";
            c.style.position = 'relative';  // ref point
            c.style.padding = '0px';
            c.style.border = '0px none';
            
            this.nav.header = document.createElement("table");
            this.nav.header.cellPadding = "0";
            this.nav.header.cellSpacing = "0";
            this.nav.header.border = "0";
            this.nav.header.width = "100%";
            this.nav.header.style.tableLayout = "fixed";
            if (!this.cssOnly) {
                this.nav.header.style.borderBottom = "0px none #000000";
                this.nav.header.style.borderRight = "0px none #000000";
                this.nav.header.style.borderLeft = "1px solid " + this.borderColor;
                this.nav.header.style.borderTop = "1px solid " + this.borderColor;
            }
            this.nav.header.oncontextmenu = function() { return false; };

            var scrollbar = this.nav.scroll.style.overflow !== 'hidden';
            if (!this.cssOnly) {
                if (scrollbar) {
                    this.nav.header.style.borderRight = "1px solid " + this.borderColor;
                }        
            }
            
            c.appendChild(this.nav.header);

            if (scrollbar) {
                c = r.insertCell(-1);        
                c.unselectable = "on";
                
                if (!this.cssOnly) {
                    c.style.backgroundColor = this.hourNameBackColor;
                    c.style.borderTop = "1px solid " + this.borderColor;
                    c.style.borderBottom = "0px none";
                    c.style.borderLeft = "0px none";
                    c.style.borderRight = "0px none";
                    c.style.padding = '0px';
                    c.style.verticalAlign = 'top';
                    c.innerHTML = "&nbsp;";
                }
                
                var inside = document.createElement("div");
                inside.unselectable = "on";
                inside.style.position = "relative";
                inside.style.width = "16px";
                if (!this.cssOnly) {
                    inside.style.lineHeight = "1px";
                    inside.style.fontSize = "1px";
                    inside.style.height = "1px";
                }
                else {
                    inside.style.height = this.headerHeight + "px";
                    inside.className = this._prefixCssClass("_cornerright");
                    
                    var inner = document.createElement("div");
                    inner.className = this._prefixCssClass('_cornerright_inner');
                    inside.appendChild(inner);                    
                }
                
                c.appendChild(inside);
                
                this.nav.cornerRight = inside;
            }  
            
            header.appendChild(table);
            
            return header;      
        
        };
        
        this.drawCorner = function() {
            var wrap = document.createElement("div");
            wrap.style.position = 'relative';
            
            if (this.cssOnly) {
                wrap.className = this._prefixCssClass("_corner");            
            }
            else {
                wrap.style.backgroundColor = this.hourNameBackColor;
                wrap.style.fontFamily = this.headerFontFamily;
                wrap.style.fontSize = this.headerFontSize;
                wrap.style.color = this.headerFontColor;
                wrap.style.borderTop = "1px solid " + this.borderColor;
            }
            wrap.style.width = this.hourWidth + "px";
            wrap.style.height = this.headerHeight + "px";
            wrap.oncontextmenu = function() { return false; };
            
            var corner = document.createElement("div");
            corner.unselectable = "on";
            
            if (this.cssOnly) {
                corner.className = this._prefixCssClass("_corner_inner");
            }
            
            wrap.appendChild(corner);

            return wrap;
        };
        
        this.disposeMain = function()  {
            var table = this.nav.main;
            table.root = null;
            table.onmouseup = null;
            
            for (var y = 0; y < table.rows.length; y++) {
                var r = table.rows[y];
                for (var x = 0; x < r.cells.length; x++) {
                    var c = r.cells[x];
                    c.root = null;
                    
                    c.onmousedown = null;
                    c.onmousemove = null;
                    c.onmouseout = null;
                    c.onmouseup = null;
                }
            }
            
            if (!this.fasterDispose) DayPilot.pu(table);
        };
        
        // draw time cells
        this.drawMain = function() {

            //DayPilotCalendar.selectedCells = [];
            var cols = [];
            var dates = [];

            var table = this.nav.main;
            var step = 30 * 60 * 1000;
            var rowCount = this.rowCount();

            var columns = calendar.columns;
            //var create = !this.tableCreated || columns.length !== table.rows[0].cells.length || rowCount !== table.rows.length; // redraw only if number of columns changes
            var create = true;
            
            if (table) {
                this.disposeMain();
            }

            while (table && table.rows && table.rows.length > 0 && create) {
                if (!this.fasterDispose) {
                    DayPilot.pu(table.rows[0]);
                }
                table.deleteRow(0);
            }

            this.tableCreated = true;

            var cl = columns.length;
            
            if (this.cssOnly) {
                var events = this.nav.events;
                while (events && events.rows && events.rows.length > 0 && create) {
                    if (!this.fasterDispose) {
                        DayPilot.pu(events.rows[0]);
                    }
                    events.deleteRow(0);
                }
                
                var cl = columns.length;

                var r = (create) ? events.insertRow(-1) : events.rows[0];

                for (var j = 0; j < cl; j++) {
                    var c = (create) ? r.insertCell(-1) : r.cells[j];

                    if (create) {

                        c.style.padding = '0px';
                        c.style.border = '0px none';
                        c.style.height = '0px';
                        c.style.overflow = 'visible';
                        if (!calendar.rtl) {
                            c.style.textAlign = 'left';
                        }

                        // withpct
                        //c.style.width = (100.0 / columns.length) + "%";

                        var div = document.createElement("div");
                        div.style.marginRight = calendar.columnMarginRight + "px";
                        div.style.position = 'relative';
                        div.style.height = '1px';
                        if (!this.cssOnly) {
                            div.style.fontSize = '1px';
                            div.style.lineHeight = '1.2';
                        }
                        div.style.marginTop = '-1px';

                        c.appendChild(div);

                    }
                }

            }

            if (!this.cssOnly) {
                
                var r = (create) ? table.insertRow(-1) : table.rows[0];

                if (create) {
                    r.style.backgroundColor = 'white';
                }

                for (var j = 0; j < cl; j++) {
                    var c = (create) ? r.insertCell(-1) : r.cells[j];

                    if (create) {

                        c.style.padding = '0px';
                        c.style.border = '0px none';
                        c.style.height = '1px';
                        c.style.overflow = 'visible';

                        c.style.width = (100.0 / columns.length) + "%";

                        var div = document.createElement("div");
                        div.style.display = 'block';
                        div.style.marginRight = calendar.columnMarginRight + "px";
                        div.style.position = 'relative';
                        div.style.height = '1px';
                        div.style.fontSize = '1px';
                        div.style.lineHeight = '1.2';
                        div.style.marginTop = '-1px';

                        c.appendChild(div);

                    }
                }
            }
            
            for (var i = 0; i < rowCount; i++) {
                var extraRow = this.cssOnly ? 0 : 1;
                var r = (create) ? table.insertRow(-1) : table.rows[i + extraRow];

                if (create) {
                    r.style.MozUserSelect = 'none';
                    r.style.KhtmlUserSelect = 'none';
                }

                for (var j = 0; j < cl; j++) {
                    var col = this.columns[j];

                    var c = (create) ? r.insertCell(-1) : r.cells[j];
                    
                    // always update
                    c.start = col.Start.addTime(i * step);
                    c.end = c.start.addTime(step);

                    c.onmousedown = this.onCellMousedown;
                    c.onmousemove = this.mousemove;
                    c.onmouseup = function() {
                        return false;
                    };

                    c.onclick = function() {
                        return false;
                    };

                    if (create) {
                        c.root = this;

                        c.style.padding = '0px';
                        c.style.border = '0px none';
                        c.style.verticalAlign = 'top';

                        if (!this.cssOnly) {
                            if (j !== cl - 1) {
                                c.style.borderRight = '1px solid ' + calendar.cellBorderColor;
                            }
                        }

                        c.style.height = calendar.cellHeight + 'px';
                        c.style.overflow = 'hidden';
                        c.unselectable = 'on';

                        if (!this.cssOnly) {
                            var div = document.createElement("div");
                            div.unselectable = 'on';
                            div.style.fontSize = '1px';
                            div.style.height = '0px';

                            // hack, no multiplying
                            var endHour = (c.end.getMinutes() + c.end.getSeconds() + c.end.getMilliseconds()) > 0;

                            if (endHour) {
                                if (calendar.hourHalfBorderColor !== '') {
                                    div.style.borderBottom = '1px solid ' + calendar.hourHalfBorderColor; // HourHalfBorderColor
                                }
                            }
                            else {
                                if (calendar.hourBorderColor !== '') {
                                    div.style.borderBottom = '1px solid ' + calendar.hourBorderColor; // HourBorderColor
                                }
                            }

                            var content = document.createElement("div");
                            content.style.height = (calendar.cellHeight - 1) + "px";
                            content.style.overflow = 'hidden';
                            content.unselectable = 'on';
                            c.appendChild(content);
                        }
                        else {
                            var div = document.createElement("div");
                            div.unselectable = 'on';
                            div.style.height = calendar.cellHeight + "px";
                            div.style.position = "relative";
                            div.className = this._prefixCssClass("_cell");
                            
                            var business = this._isBusinessCell(c.start, c.end);
                            if (business && this.cssOnly) {
                                DayPilot.Util.addClass(div, calendar._prefixCssClass("_cell_business"));
                            }                            
                            
                            var inner = document.createElement("div");
                            inner.setAttribute("unselectable", "on");
                            inner.className = this._prefixCssClass("_cell_inner");
                            
                            div.appendChild(inner);
                            c.appendChild(div);
                        }

                        c.appendChild(div);

                    }

                    c.style.backgroundColor = calendar.cellBackColor;

                    content = c.firstChild;
                }
            }

            table.onmouseup = this.mouseup;
            table.root = this;

            //var scroll = calendar.nav.scroll;
            

            calendar.nav.scrollable.onmousemove = function(ev) {
                ev = ev || window.event;

                var ref = calendar.nav.scrollable;
                calendar.coords = DayPilot.mo3(ref, ev);

                var mousePos = DayPilot.mc(ev);

                if (DayPilotCalendar.resizing) {
                    if (!DayPilotCalendar.resizingShadow) {
                        DayPilotCalendar.resizingShadow = calendar.createShadow(DayPilotCalendar.resizing, false, calendar.shadow);
                    }

                    var _step = calendar.cellHeight;
                    var _startOffset = 1;
                    var delta = (mousePos.y - DayPilotCalendar.originalMouse.y);

                    // TODO: clear            	    
                    if (DayPilotCalendar.resizing.dpBorder === 'bottom') {
                        var newHeight = Math.floor(((DayPilotCalendar.originalHeight + DayPilotCalendar.originalTop + delta) + _step / 2) / _step) * _step - DayPilotCalendar.originalTop + _startOffset;

                        if (newHeight < _step)
                            newHeight = _step;

                        var max = calendar.nav.main.clientHeight;
                        if (DayPilotCalendar.originalTop + newHeight > max)
                            newHeight = max - DayPilotCalendar.originalTop;

                        DayPilotCalendar.resizingShadow.style.height = (newHeight - 4) + 'px';
                    }
                    else if (DayPilotCalendar.resizing.dpBorder === 'top') {
                        var newTop = Math.floor(((DayPilotCalendar.originalTop + delta - _startOffset) + _step / 2) / _step) * _step + _startOffset;

                        if (newTop < _startOffset) {
                            newTop = _startOffset;
                        }

                        if (newTop > DayPilotCalendar.originalTop + DayPilotCalendar.originalHeight - _step) {
                            newTop = DayPilotCalendar.originalTop + DayPilotCalendar.originalHeight - _step;
                        }

                        var newHeight = DayPilotCalendar.originalHeight - (newTop - DayPilotCalendar.originalTop) - 4;

                        if (newHeight < _step) {
                            newHeight = _step;
                        }
                        else {
                            DayPilotCalendar.resizingShadow.style.top = newTop + 'px';
                        }

                        DayPilotCalendar.resizingShadow.style.height = (newHeight) + 'px';
                    }
           }

                else if (DayPilotCalendar.moving) {

                    if (!DayPilotCalendar.movingShadow) {
                        // fixes the ie8 bug (incorrect offsetX and offsetY causes flickering during move if there are inline elements in the event
                        DayPilotCalendar.movingShadow = calendar.createShadow(DayPilotCalendar.moving, !calendar.ie, calendar.shadow);
                        DayPilotCalendar.movingShadow.style.width = (DayPilotCalendar.movingShadow.parentNode.offsetWidth + 1) + 'px';
                    }

                    if (!calendar.coords) {
                        return;
                    }

                    //document.title = "" + calendar.coords.y;

                    var _step = calendar.cellHeight;
                    var _startOffset = 1;

                    var offset = DayPilotCalendar.moveOffsetY;
                    if (!offset) {
                        offset = _step / 2; // for external drag
                    }

                    var newTop = Math.floor(((calendar.coords.y - offset - _startOffset) + _step / 2) / _step) * _step + _startOffset;

                    if (newTop < _startOffset) {
                        newTop = _startOffset;
                    }

                    var main = calendar.nav.events;
                    var max = calendar.nav.main.clientHeight;

                    var height = parseInt(DayPilotCalendar.movingShadow.style.height);  // DayPilotCalendar.moving.data.height
                    if (newTop + height > max) {
                        newTop = max - height;
                    }

                    DayPilotCalendar.movingShadow.parentNode.style.display = 'none';
                    DayPilotCalendar.movingShadow.style.top = newTop + 'px';
                    DayPilotCalendar.movingShadow.parentNode.style.display = '';

                    var colWidth = main.clientWidth / main.rows[0].cells.length;
                    var column = Math.floor((calendar.coords.x - 45) / colWidth);

                    if (column < 0) {
                        column = 0;
                    }

                    if (column < main.rows[0].cells.length && column >= 0 && DayPilotCalendar.movingShadow.column !== column) {
                        DayPilotCalendar.movingShadow.column = column;
                        DayPilotCalendar.moveShadow(main.rows[0].cells[column]);
                    }
                }
            };
            calendar.nav.scrollable.style.display = '';
        };
        
        this._isBusinessCell = function(start, end) {
            if (this.businessBeginsHour < this.businessEndsHour)
            {
                return !(start.getHours() < this.businessBeginsHour || start.getHours() >= this.businessEndsHour || start.getDayOfWeek() === 6 || start.getDayOfWeek() === 0);
            }

            if (start.getHours() >= this.businessBeginsHour)
            {
                return true;
            }

            if (start.getHours() < this.businessEndsHour)
            {
                return true;
            }

            return false;            
        };        

        this.disposeHeader = function() {
            var table = this.nav.header;
            if (table && table.rows) {
                for(var y = 0; y < table.rows.length; y++) {
                    var r = table.rows[y];
                    for (var x = 0; x < r.cells.length; x++) {
                        var c = r.cells[x];
                        c.onclick = null;
                        c.onmousemove = null;
                        c.onmouseout = null;
                    }
                }
            }
            if (!this.fasterDispose) DayPilot.pu(table);
        };
        
        this.drawHeaderRow = function(create) {

            // column headers
            var r = (create) ? this.nav.header.insertRow(-1) : this.nav.header.rows[0];
            
            var columns = this.columns;
            
            var len = columns.length;
            for (var i = 0; i < len; i++) {
                var data = columns[i];

                var cell = (create) ? r.insertCell(-1) : r.cells[i];
                cell.data = data;
                
                //cell.style.width = (100.0 / columns.length) + "%";

                cell.style.overflow = 'hidden';
                cell.style.padding = '0px';
                cell.style.border = '0px none';
                cell.style.height = (this.headerHeight) + "px";

                var div = (create) ? document.createElement("div") : cell.firstChild;
                
                if (create) {
                    div.unselectable = 'on';
                    div.style.MozUserSelect = 'none';
                    div.style.backgroundColor = data.BackColor;
                    div.style.cursor = 'default';
                    div.style.position = 'relative';
                    if (!this.cssOnly) {
                        div.style.fontFamily = this.headerFontFamily;
                        div.style.fontSize = this.headerFontSize;
                        div.style.color = this.headerFontColor;
                        if (i !== len -1) { // last one
                            div.style.borderRight = "1px solid " + this.borderColor;
                        }
                    }
                    else {
                        div.className = calendar._prefixCssClass('_colheader');
                    }
                    div.style.height = this.headerHeight + "px";
                    
                    var text = document.createElement("div");
                    if (!this.cssOnly) {
                        text.style.position = 'absolute';
                        text.style.left = '0px';
                        text.style.width = '100%';
                        text.style.padding = "2px";
                        div.style.textAlign = 'center';
                    }
                    else {
                        text.className = calendar._prefixCssClass('_colheader_inner');
                    }
                    text.unselectable = 'on';
                   
                    div.appendChild(text);
                    cell.appendChild(div);
                }

                var text = div.firstChild;
                text.innerHTML = data.InnerHTML;
            }
        };
        
        this.widthUnit = function() {
            if (this.width && this.width.indexOf("px") !== -1) {
                return "Pixel";
            }
            return "Percentage"; 
        };
        
        this.drawHeader = function() {

            var header = this.nav.header;
            var create = true;

            var columns = this.columns;
            var len = columns.length;
            
            /*if (this.headerCreated && header && header.rows && header.rows.length > 0) {
                create = header.rows[header.rows.length - 1].cells.length !== len;
            }*/
            
            while (this.headerCreated && header && header.rows && header.rows.length > 0 && create) {
                if (!this.fasterDispose) DayPilot.pu(header.rows[0]);
                header.deleteRow(0);
            }

            this.headerCreated = true;
            
            if (!create) {
                // corner        
                var corner = calendar.nav.corner;
                if (!this.cssOnly) {
                    corner.style.backgroundColor = calendar.cornerBackColor;
                }
                if (!this.fasterDispose) DayPilot.pu(corner.firstChild);
            }
            
            this.drawHeaderRow(create);
        };
        
        this.loadingStart = function() {
            if (this.loadingLabelVisible) {
                this.nav.loading.innerHTML = this.loadingLabelText;
                this.nav.loading.style.top = (this.headerHeight + 5) + "px";
                this.nav.loading.style.display = '';
            }
        };

        this.commandCallBack = function(command, data) {
            var params = {};
            params.command = command;
            this._callBack2('Command', data, params);
        }; 
        
        this.loadingStop = function(msg) {
            if (this.callbackTimeout) {
                window.clearTimeout(this.callbackTimeout);
            }    
            
            this.nav.loading.style.display = 'none';
        };
        
        this._enableScrolling = function() {
        
            var scrollDiv = this.nav.scroll;

            if (!scrollDiv.onscroll) {
                scrollDiv.onscroll = function() {
                    calendar._saveScrollHour();
                };
            }

            var scrollpos = (typeof this._config.scrollpos !== 'undefined') ? this._config.scrollpos : this.initScrollPos;

            if (!scrollpos) {
                return;
            }
            
            
            if (scrollpos === 'Auto') {
                if (this.heightSpec === "BusinessHours") {
                    scrollpos = 2 * this.cellHeight * this.businessBeginsHour;
                }
                else {
                    scrollpos = 0;
                }
            }
                
            scrollDiv.root = this;
            
            // initial position
            if (scrollDiv.scrollTop === 0) {
                scrollDiv.scrollTop = scrollpos;
            }
        };
        
        this.callbackError = function (result, context) {
            alert("Error!\r\nResult: " + result + "\r\nContext:" + context);
        };

        this._fixScrollHeader = function() {
            var w = DayPilot.sw(this.nav.scroll);
            var d = this.nav.cornerRight;
            if (d && w > 0) { 
                if (this.cssOnly) {
                    d.style.width = w + 'px';
                }
                else {
                    d.style.width = (w - 3) + 'px';
                }
            }
        };
        
        this.registerGlobalHandlers = function() {
            if (!DayPilotCalendar.globalHandlers) {
                DayPilotCalendar.globalHandlers = true;
                DayPilot.re(document, 'mouseup', DayPilotCalendar.gMouseUp);
                DayPilot.re(window, 'unload', DayPilotCalendar.gUnload);
            }
        };
        
        this.events = {};
        //this.events.list = [];
        
        this.events.add = function(e) {
            e.calendar = calendar;

            if (!calendar.events.list) {
                calendar.events.list = [];
            }

            calendar.events.list.push(e.data);
            calendar.update();
            calendar._angular.notify();
        };
        
        this.events.update = function(e) {
            e.commit();
            calendar.update();
            calendar._angular.notify();
        };
        
        this.events.remove = function(e) {
            var index = DayPilot.indexOf(calendar.events.list, e.data);
            calendar.events.list.splice(index, 1);
            calendar.update();
            calendar._angular.notify();
        };        
        
        this.update = function() {
            /*
            this.tableCreated = false;
            this._config.scrollpos = this.nav.scroll.scrollTop;
            this.deleteEvents();
            this._clearThemes();
            
            this.init();
            return;
            */


            calendar._resetCssOnly();

            calendar.prepareVariables();
            calendar.deleteEvents();
            
            var fullUpdate = true;
            
            if (fullUpdate) {
                calendar.prepareColumns();
                calendar.drawHeader();
                calendar.drawMain();
                calendar.drawHourTable();
                calendar.updateHeight();
                calendar._updateCorner();

                calendar._restoreScrollHour();
            }

            calendar.loadEvents();
            calendar.updateHeaderHeight();

            calendar._show();
			
            calendar.drawEvents();
            calendar.clearSelection();

            if (this.visible) {
                this.show();
            }
            else {
                this.hide();
            }
        };

        this._loadTop = function() {
            if (this.id && this.id.tagName) {
                this.nav.top = this.id;
            }
            else if (typeof this.id === "string") {
                this.nav.top = document.getElementById(this.id);
                if (!this.nav.top) {
                    throw "DayPilot.Calendar: The placeholder element not found: '" + id + "'.";
                }
            }
            else {
                throw "DayPilot.Calendar() constructor requires the target element or its ID as a parameter";
            }
        };

        this._cache = {};
        this._cache.events = [];

        this._doBeforeEventRender = function(i) {
            var cache = this._cache.events;
            var data = this.events.list[i];
            var evc = {};

            // make a copy
            for (var name in data) {
                evc[name] = data[name];
            }

            if (typeof this.onBeforeEventRender === 'function') {
                var args = {};
                args.data = evc;
                this.onBeforeEventRender(args);
            }

            cache[i] = evc;

        };

        this.loadEvents = function() {
            
            var events = this.events.list;

            calendar._cache.events = [];

            if (!events) {
                return;
            }

            var length = events.length;
            var duration = 24 * 60 * 60 * 1000;

            this.cache.pixels = {};

            var loadCache = [];
            
            this.scrollLabels = [];

            this.minStart = 10000;
            this.maxEnd = 0;            
            
            for (var i = 0; i < length; i++) {
                var e = events[i];
                e.start = new DayPilot.Date(e.start);
                e.end = new DayPilot.Date(e.end);
            }

            if (typeof this.onBeforeEventRender === 'function') {
                for (var i = 0; i < length; i++) {
                    this._doBeforeEventRender(i);
                }
            }

            for(var i = 0; i < this.columns.length; i++) {
            
                var scroll = {};
                scroll.minEnd = 1000000;
                scroll.maxStart = -1;
                this.scrollLabels.push(scroll);
            
                var col = this.columns[i];
                col.events = [];
                col.lines = [];
                col.blocks = [];
            
                var colStart = new DayPilot.Date(col.Start);
                var colStartTicks = colStart.getTime();
                var colEnd = colStart.addTime(duration);
                var colEndTicks = colEnd.getTime();
                
                for (var j = 0; j < length; j++) {
                    if (loadCache[j]) {
                        continue;
                    }
                    
                    var e = events[j];
                    
                    var start = e.start;
                    var end = e.end;
                    
                    var startTicks = start.getTime();
                    var endTicks = end.getTime();
                    
                    if (endTicks < startTicks) {  // skip invalid events
                        continue;
                    }

                    // belongs here
                    var belongsHere = !(endTicks <= colStartTicks || startTicks >= colEndTicks);
                    
                    if (belongsHere) {
                        var ep = new DayPilot.Event(e, calendar); // event part
                        ep.part.dayIndex = i;
                        ep.part.start = colStartTicks < startTicks ? e.start : colStart;
                        ep.part.end = colEndTicks > endTicks ? e.end : colEnd;
                        
                        var partStartPixels = this.getPixels(ep.part.start, col.Start);
                        var partEndPixels = this.getPixels(ep.part.end, col.Start);

                        var top = partStartPixels.top; 
                        var bottom = partEndPixels.top;
                        
                        // events in the hidden areas
                        if (top === bottom && (partStartPixels.cut || partEndPixels.cut)) {
                            continue;
                        }

                        var boxBottom = partEndPixels.boxBottom;
                    
                        ep.part.top = Math.floor(top / this.cellHeight) * this.cellHeight + 1;
                        /*
                        if (!this.cssOnly) {
                            ep.part.top += 1;
                        }*/
                        ep.part.height = Math.max(Math.ceil(boxBottom / this.cellHeight) * this.cellHeight - ep.part.top, this.cellHeight - 1) + 1;

                        ep.part.barTop = Math.max(top - ep.part.top - 1, 0);  // minimum 0
                        ep.part.barHeight = Math.max(bottom - top - 2, 1);  // minimum 1

                        var start = ep.part.top;
                        var end = ep.part.top + ep.part.height;
                        
                        if (start > scroll.maxStart) {
                            scroll.maxStart = start;
                        }
                        if (end < scroll.minEnd) {
                            scroll.minEnd = end; 
                        }
                        
                        if (start < this.minStart) {
                            this.minStart = start;
                        }
                        if (end > this.maxEnd) {
                            this.maxEnd = end;
                        }
                        col.events.push(ep);

                        if (typeof this.onBeforeEventRender === 'function') {
                            ep.cache = this._cache.events[j];
                        }
                        
                        if (ep.part.start.getTime() === startTicks && ep.part.end.getTime() === endTicks) {
                            loadCache[j] = true;
                        }
                    }
                }
                
            }
            
            
            // sort events inside rows
            for (var i = 0; i < this.columns.length; i++) {
                var col = this.columns[i];
                col.events.sort(this.eventComparer);
                
                // put into lines
                for (var j = 0; j < col.events.length; j++) {
                    var e = col.events[j];
                    col.putIntoBlock(e);
                }
                
                for (var j = 0; j < col.blocks.length; j++) {
                    var block = col.blocks[j];
                    block.events.sort(this.eventComparer);
                    for (var k = 0; k < block.events.length; k++ ) {
                        var e = block.events[k];
                        block.putIntoLine(e);
                    }
                }
            }
        };

        this.eventComparer = function(a, b) {
            if (!a || !b || !a.start || !b.start) {
                return 0; // no sorting, invalid arguments
            }
            
            var byStart = a.start().getTime() - b.start().getTime();
            if (byStart !== 0) {
                return byStart;
            }
            
            var byEnd = b.end().getTime() - a.end().getTime(); // desc
            return byEnd;
        };
        
        this.debug = function(msg, append) {
            if (!this.debuggingEnabled) {
                return;
            }
            
            if (!calendar.debugMessages) {
                calendar.debugMessages = [];
            }
            calendar.debugMessages.push(msg);

            if (typeof console !== 'undefined') {
                console.log(msg);
            }
        };
        
        this.getPixels = function(date, start) {
            if (!start) start = this.startDate;
            
            var startTicks = start.getTime();
            var ticks = date.getTime();
            
            var cache = this.cache.pixels[ticks + "_" + startTicks];
            if (cache) { 
                return cache; 
            } 
            
            startTicks = start.getTime();
            
            var boxTicks = 30 * 60 * 1000;
            var topTicks = ticks - startTicks;
            var boxOffsetTicks = topTicks % boxTicks;
            
            var boxStartTicks = topTicks - boxOffsetTicks;
            var boxEndTicks = boxStartTicks + boxTicks;
            if (boxOffsetTicks === 0) {
                boxEndTicks = boxStartTicks;
            }
            
            // it's linear scale so far
            var result = {};
            result.cut = false;
            result.top = this.ticksToPixels(topTicks);
            result.boxTop = this.ticksToPixels(boxStartTicks);
            result.boxBottom = this.ticksToPixels(boxEndTicks);
            
            this.cache.pixels[ticks + "_" + startTicks] = result;
            
            return result;
        };
        
        this.ticksToPixels = function(ticks) { 
            return Math.floor( (this.cellHeight * ticks) / (1000 * 60 * 30) );
        };    
        
        this.prepareVariables = function() {
            this.startDate = new DayPilot.Date(this.startDate).getDatePart();
        };
        
        this.updateHeaderHeight = function() {
            if (this.nav.corner) {
                this.nav.corner.style.height = this.headerHeight + "px";
            }
        };
        
        this.updateHeight = function() {
            var sh = this.getScrollableHeight();
            if (this.nav.scroll && sh > 0) {
                this.nav.scroll.style.height = sh + "px";
            }
        };

        this._angular = {};
        this._angular.scope = null;
        this._angular.notify = function() {
            if (calendar._angular.scope) {
                calendar._angular.scope["$apply"]();
            }
        };
        this._angular.apply = function(f) {
            // autoapply has been disabled
            f();

            /*
            if (calendar.angularAutoApply && calendar._angular.scope) {
                calendar._angular.scope["$apply"](f);
            }
            else {
                f();
            }
            */
        };

        this._saveScrollHour = function() {
            var top = calendar.nav.scroll.scrollTop;
            var pos = top / (2*calendar.cellHeight);
            calendar._config.scrollHour = pos;
        };

        this._restoreScrollHour = function() {
            var scrollpos = 0;
            if (calendar._config.scrollHour) {
                scrollpos = 2 * calendar.cellHeight * calendar._config.scrollHour;
                //calendar._config.scrollHour = null;
            }
            else {
                if (calendar.initScrollPos === 'Auto') {
                    if (this.heightSpec === "BusinessHours") {
                        scrollpos = 2 * this.cellHeight * this.businessBeginsHour;
                    }
                    else {
                        scrollpos = 0;
                    }
                }
            }

            calendar.nav.scroll.scrollTop = scrollpos;
        };

        this._loadFromServer = function() {
            // make sure it has a place to ask
            if (this.backendUrl || typeof WebForm_DoCallback === 'function') {
                return (typeof calendar.events.list === 'undefined') || (!calendar.events.list);
            }
            else {
                return false;
            }
        };
        
        this._show = function() {
            if (this.nav.top.style.visibility === 'hidden') {
                this.nav.top.style.visibility = 'visible';
            }
        };

        this.show = function() {
            calendar.visible = true;
            calendar.nav.top.style.display = '';
        };

        this.hide = function() {
            calendar.visible = false;
            calendar.nav.top.style.display = 'none';
        };
        this._initShort = function() {
            this.prepareVariables();
            this.prepareColumns();
            this.drawTop();
            this.drawHeader();
            this.drawMain();
            this._fixScrollHeader();
            this._enableScrolling();
            this.registerGlobalHandlers();
            DayPilotCalendar.register(this);

            this._waitForVisibility();
            this._callBack2('Init');
        };
        
        this._config = {};
        
        this._saveConfig = function() {
            this._config.themes = [];
            this._config.themes.push(this.theme || this.cssClassPrefix);
        };
        
        this._clearThemes = function() {
            var themes = this._config.themes;
            for (var i = 0; i < themes.length; i++) {
                var theme = themes[i];
                DayPilot.Util.removeClass(this.nav.top, theme + "_main"); 
            }
            this._config.themes = [];
        };

        this._doAfterRender = function() {
            this.afterRender(null, false);
            if (typeof this.onAfterRender === "function") {
                var args = {};
                args.isCallBack = false;
                this.onAfterRender(args);
            }
        };

        this._doInit = function() {
            if (typeof this.onInit === "function" && !this._onInitCalled) {
                this._onInitCalled = true;
                var args = {};
                this.onInit(args);
            }
        };

        this._resetCssOnly = function() {
            if (!calendar.cssOnly) {
                calendar.cssOnly = true;
                window.console && window.console.log && window.console.log("DayPilot: cssOnly = false mode is not supported anymore.");
            }
        };

        this._visible = function() {
            var el = calendar.nav.top;
            return el.offsetWidth > 0 && el.offsetHeight > 0;
        };

        this._waitForVisibility = function() {
            var visible = calendar._visible;

            if (!visible()) {
                calendar._visibilityInterval = setInterval(function() {
                    if (visible()) {
                        calendar._enableScrolling();
                        calendar._fixScrollHeader();
                        clearInterval(calendar._visibilityInterval);
                    }
                }, 100);
            }
        };

        this.init = function() {
            this._loadTop();

            var loadFromServer = this._loadFromServer();

            this._resetCssOnly();

            this._saveConfig();
            
            if (loadFromServer) {
                this._initShort();
                return;
            }

            this.prepareVariables();
            this.prepareColumns();
            
            this.loadEvents();

            this.drawTop();
            this.drawHeader();
            this.drawMain();
            
            this._show();

            this._fixScrollHeader();
            this._enableScrolling();
            this.registerGlobalHandlers();
            DayPilotCalendar.register(this);

            if (this.events) { // are events available?
                this.updateHeaderHeight();        
                this.drawEvents();
            }

            this._doAfterRender();
            this._doInit();
            this._waitForVisibility();
            this.initialized = true;
        };
        
        this.Init = this.init;
        
    };
        
    DayPilotCalendar.Cell = function(start, end, column) { 
        this.start = start;
        this.end = end;
        this.column = function() {
            
        };
    };
        
    DayPilotCalendar.Column = function (value, name, date) {
        this.value = value;
        this.name = name;
        this.date = new DayPilot.Date(date);
    };

    // publish the API 
    DayPilot.Calendar = DayPilotCalendar.Calendar;
	
    // jQuery plugin
    if (typeof jQuery !== 'undefined') {
        (function( $ ){
            $.fn.daypilotCalendar = function(options) {
                var first = null;
                var j = this.each(function() {
                    if (this.daypilot) { // already initialized
                        return;
                    };

                    var daypilot = new DayPilot.Calendar(this.id);
                    this.daypilot = daypilot;
                    for (name in options) {
                        daypilot[name] = options[name];
                    }
                    daypilot.init();
                    if (!first) {
                        first = daypilot;
                    }
                });
                if (this.length === 1) {
                    return first;
                }
                else {
                    return j;
                }
            };
        })( jQuery );
    }

    (function registerAngularModule() {

        var app = DayPilot.am();

        if (!app) {
            return;
        }

        app.directive("daypilotCalendar", ['$parse', function($parse) {
//        app.directive("daypilotCalendar", function() {
            return {
                "restrict": "E",
                "template": "<div></div>",
                "replace": true,
                "link": function (scope, element, attrs) {

                    var calendar = new DayPilot.Calendar(element[0]);
                    calendar._angular.scope = scope;
                    calendar.init();

                    var oattr = attrs["id"];
                    if (oattr) {
                        scope[oattr] = calendar;
                    }

                    // save DayPilot.Calendar object in the specified variable
                    var pas = attrs["publishAs"];
                    if (pas) {
                        var getter = $parse(pas);
                        var setter = getter.assign;
                        setter(scope, calendar);
                    }

                    // bind event handlers from attributes starting with "on"
                    for (var name in attrs) {
                        if (name.indexOf("on") === 0) {  // event handler
                            (function(name) {
                                calendar[name] = function(args) {
                                    var f = $parse(attrs[name]);
                                    scope["$apply"](function() {
                                        f(scope, {"args": args});
                                    });
                                };
                            })(name);
                        }
                    }

                    var watch = scope["$watch"];
                    var config = attrs["config"] || attrs["daypilotConfig"];
                    var events = attrs["events"] || attrs["daypilotEvents"];

                    watch.call(scope, config, function (value) {
                        //var bbOld = calendar.businessBeginsHour;

                        for (var name in value) {
                            calendar[name] = value[name];
                        }
                        calendar.update();
                        calendar._doInit();
                    }, true);

                    watch.call(scope, events, function(value) {
                        //var calendar = element.data("calendar");
                        calendar.events.list = value;
                        calendar.update();
                    }, true);

                }
            };
        }]);
    })();



})();
