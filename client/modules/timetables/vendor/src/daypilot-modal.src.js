/*
Copyright � 2016 Annpoint, s.r.o.

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

v2.4
http://code.daypilot.org/81367/daypilot-modal

*/

if (typeof(DayPilot) === 'undefined') {
    DayPilot = {};
}

(function() {
    'use strict';

    DayPilot.ModalStatic = {};

    DayPilot.ModalStatic.list = [];

    // hide the last one
    DayPilot.ModalStatic.hide = function() {
        if (this.list.length > 0) {
            var last = this.list.pop();
            if (last) {
                last.hide();
            }
        }
    };

    DayPilot.ModalStatic.remove = function(modal) {
        var list = DayPilot.ModalStatic.list;
        for (var i = 0; i < list.length; i++) {
            if (list[i] === modal) {
                list.splice(i, 1);
                return;
            }
        }
    };

    DayPilot.ModalStatic.close = function(result) {
        DayPilot.ModalStatic.result(result);
        DayPilot.ModalStatic.hide();
    };

    DayPilot.ModalStatic.result = function(r) {
        var list = DayPilot.ModalStatic.list;
        if (list.length > 0) {
            list[list.length - 1].result = r;
        }
    };

    DayPilot.ModalStatic.displayed = function(modal) {
        var list = DayPilot.ModalStatic.list;
        for (var i = 0; i < list.length; i++) {
            if (list[i] === modal) {
                return true;
            }
        }
        return false;
    };

    DayPilot.ModalStatic.stretch = function() {
        if (this.list.length > 0) {
            var last = this.list[this.list.length - 1];
            if (last) {
                last.stretch();
            }
        }
    };

    var isIE = (navigator && navigator.userAgent && navigator.userAgent.indexOf("MSIE") !== -1);

    DayPilot.Modal = function(options) {

        // default values
        this.autoStretch = true;  // height will be increased automatically to avoid scrollbar, until this.maxHeight is reached
        this.autoStretchFirstLoadOnly = false;
        this.border = "10px solid #ccc";
        this.corners = 'Rounded';
        this.className = null;
        this.dragDrop = true;
        this.height = 200;  // see also autoStretch
        this.loadingHtml = null;
        this.maxHeight = null; // if not set, it will stretch until the bottom space is equal to this.top
        this.opacity = 30;
        this.scrollWithPage = true;  // modal window will scroll with the page
        this.top = 20;
        this.useIframe = true; // only for showHtml()
        this.width = 500;
        this.zIndex = null;

        // event handler
        this.closed = null;
        this.onClosed = null;

        // internal
        var This = this;
        this.id = '_' + new Date().getTime() + 'n' + (Math.random() * 10);
        this.registered = false;

        // drag&drop
        this.start = null;
        this.coords = null;

        this.showHtml = function(html) {

            if (DayPilot.ModalStatic.displayed(this)) {
                throw "This modal dialog is already displayed.";
            }

            if (!this.div) {
                this.create();
            }
            this.update();

            if (this.useIframe) {
                var delayed = function(p, innerHTML) {
                    return function() {
                        p.setInnerHTML(p.id + "iframe", innerHTML);
                    };
                };

                window.setTimeout(delayed(this, html), 0);
            }
            else {
                if (html.nodeType) {
                    this.div.appendChild(html);
                }
                else {
                    this.div.innerHTML = html;
                }
            }

            this.update();
            this.register();

        };

        this.rounded = function() {
            return this.corners && this.corners.toLowerCase() === 'rounded';
        };

        this.showUrl = function(url) {

            if (DayPilot.ModalStatic.displayed(this)) {
                throw "This modal dialog is already displayed.";
            }

            this.useIframe = true; // forced

            if (!this.div) {
                this.create();
            }

            var loadingHtml = this.loadingHtml;
            if (loadingHtml) {
                this.iframe.src = "about:blank";
                this.setInnerHTML(this.id + "iframe", loadingHtml);
            }

            this.re(this.iframe, "load", this.onIframeLoad);

            this.iframe.src = url;
            //this.iframe.contentWindow.modal = This;

            this.update();
            this.register();
        };

        this.update = function() {
            var win = window;
            var doc = document;

            var scrollY = win.pageYOffset ? win.pageYOffset : ((doc.documentElement && doc.documentElement.scrollTop) ? doc.documentElement.scrollTop : doc.body.scrollTop);

            //alert("scrollY:" + this.main.window.pageYOffset);

            var height = function() {
                return This.windowRect().y;
            };


            //this.hideDiv.style.height = height() + "px";
            this.hideDiv.style.filter = "alpha(opacity=" + this.opacity + ")";
            this.hideDiv.style.opacity = "0." + this.opacity;
            this.hideDiv.style.backgroundColor = "black";
            if (this.zIndex) {
                this.hideDiv.style.zIndex = this.zIndex;
            }
            this.hideDiv.style.display = '';
            
            window.setTimeout(function() {
                This.hideDiv.onclick = function() { This.hide(); };
            }, 500);

            this.div.className = this.className;
            this.div.style.border = this.border;
            if (this.rounded()) {
                this.div.style.MozBorderRadius = "5px";
                this.div.style.webkitBorderRadius = "5px";
                this.div.style.borderRadius = "5px";
            }
            this.div.style.marginLeft = '-' + Math.floor(this.width / 2) + "px";  // '-45%'
            this.div.style.position = 'absolute';
            this.div.style.top = (scrollY + this.top) + 'px';
            this.div.style.width = this.width + 'px';  // '90%'
            if (this.zIndex) {
                this.div.style.zIndex = this.zIndex;
            }

            if (this.height) {
                this.div.style.height = this.height + 'px';
            }
            if (this.useIframe && this.height) {
                this.iframe.style.height = (this.height) + 'px';
            }

            this.div.style.display = '';
            DayPilot.ModalStatic.list.push(this);

            /*
            if (this.iframe) {
            this.iframe.onload = null;
            }
            */
        };

        this.onIframeLoad = function() {
            This.iframe.contentWindow.modal = This;
            if (This.autoStretch) {
                This.stretch();
            }
        };

        this.stretch = function() {
            var height = function() {
                return This.windowRect().y;
            };

            var width = function() {
                return This.windowRect().x;
            };

            // width first
            var maxWidth = width() - 40;  // fixed 20px margin
            for (var w = this.width; w < maxWidth && this.hasHorizontalScrollbar(); w += 10) {
                //this.iframe.style.width = (w) + 'px';
                this.div.style.width = w + 'px';
                this.div.style.marginLeft = '-' + Math.floor(w / 2) + "px";  //
            }

            // height
            var maxHeight = this.maxHeight || height() - 2 * this.top;
            for (var h = this.height; h < maxHeight && this.hasVerticalScrollbar(); h += 10) {
                this.iframe.style.height = (h) + 'px';
                this.div.style.height = h + 'px';
            }

            if (this.autoStretchFirstLoadOnly) {
                this.ue(this.iframe, "load", this.onIframeLoad);
            }

        };

        this.hasHorizontalScrollbar = function() {
            var document = this.iframe.contentWindow.document;
            var root = document.compatMode === 'BackCompat' ? document.body : document.documentElement;

            var scrollWidth = root.scrollWidth;
            var children = document.body.children;
            for (var i = 0; i < children.length; i++) {
                var bottom = children[i].offsetLeft + children[i].offsetWidth;
                scrollWidth = Math.max(scrollWidth, bottom);
            }

            var isHorizontalScrollbar = scrollWidth > root.clientWidth;
            return isHorizontalScrollbar;

        };

        this.hasVerticalScrollbar = function() {
            var document = this.iframe.contentWindow.document;
            var root = document.compatMode === 'BackCompat' ? document.body : document.documentElement;

            var scrollHeight = root.scrollHeight;
            var children = document.body.children;
            for (var i = 0; i < children.length; i++) {
                var bottom = children[i].offsetTop + children[i].offsetHeight;
                scrollHeight = Math.max(scrollHeight, bottom);
            }

            var isVerticalScrollbar =  scrollHeight > root.clientHeight;
            //var isHorizontalScrollbar = root.scrollWidth > root.clientWidth;
            return isVerticalScrollbar;
        };

        this.windowRect = function() {
            var doc = document;

            if (doc.compatMode === "CSS1Compat" && doc.documentElement && doc.documentElement.clientWidth) {
                var x = doc.documentElement.clientWidth;
                var y = doc.documentElement.clientHeight;
                return { x: x, y: y };
            }
            else {
                var x = doc.body.clientWidth;
                var y = doc.body.clientHeight;
                return { x: x, y: y };
            }
        };

        this.register = function() {
            if (this.registered) {
                return;
            }
            this.re(window, 'resize', this.resize);
            this.re(window, 'scroll', this.resize);

            if (this.dragDrop) {
                this.re(document, 'mousemove', this.drag);
                this.re(document, 'mouseup', this.drop);
            }
            this.registered = true;

        };

        this.drag = function(e) {
            if (!This.coords) {
                return;
            }

            var e = e || window.event;
            var now = This.mc(e);

            var x = now.x - This.coords.x;
            var y = now.y - This.coords.y;

            //This.iframe.style.display = 'none';
            This.div.style.marginLeft = '0px';
            This.div.style.top = (This.start.y + y) + "px";
            This.div.style.left = (This.start.x + x) + "px";

        };

        this.drop = function(e) {
            // no drag&drop
            if (!This.coords) {
                return;
            }
            //This.iframe.style.display = '';
            This.unmaskIframe();

            This.coords = null;
        };

        this.maskIframe = function() {
            if (!this.useIframe) {
                return;
            }

            var opacity = 80;

            var mask = document.createElement("div");
            mask.style.backgroundColor = "#ffffff";
            mask.style.filter = "alpha(opacity=" + opacity + ")";
            mask.style.opacity = "0." + opacity;
            mask.style.width = "100%";
            mask.style.height = this.height + "px";
            mask.style.position = "absolute";
            mask.style.left = '0px';
            mask.style.top = '0px';

            this.div.appendChild(mask);
            this.mask = mask;
        };

        this.unmaskIframe = function() {
            if (!this.useIframe) {
                return;
            }

            this.div.removeChild(this.mask);
            this.mask = null;
        };

        this.resize = function() {

            if (!This.hideDiv) {
                return;
            }
            if (!This.div) {
                return;
            }
            if (This.hideDiv.style.display === 'none') {
                return;
            }
            if (This.div.style.display === 'none') {
                return;
            }

            var scrollY = window.pageYOffset ? window.pageYOffset : ((document.documentElement && document.documentElement.scrollTop) ? document.documentElement.scrollTop : document.body.scrollTop);

            //This.hideDiv.style.height = height() + "px";
            if (!This.scrollWithPage) {
                This.div.style.top = (scrollY + This.top) + 'px';
            }
        };

        // already available in common.js but this file should be standalone
        this.re = function(el, ev, func) {
            if (el.addEventListener) {
                el.addEventListener(ev, func, false);
            } else if (el.attachEvent) {
                el.attachEvent("on" + ev, func);
            }
        };

        // unregister event
        this.ue = function(el, ev, func) {
            if (el.removeEventListener) {
                el.removeEventListener(ev, func, false);
            } else if (el.detachEvent) {
                el.detachEvent("on" + ev, func);
            }
        };

        // mouse coords
        this.mc = function(ev) {
            if (ev.pageX || ev.pageY) {
                return { x: ev.pageX, y: ev.pageY };
            }
            return {
                x: ev.clientX + document.documentElement.scrollLeft,
                y: ev.clientY + document.documentElement.scrollTop
            };
        };

        // absolute element position on page
        this.abs = function(element) {
            var r = {
                x: element.offsetLeft,
                y: element.offsetTop
            };

            while (element.offsetParent) {
                element = element.offsetParent;
                r.x += element.offsetLeft;
                r.y += element.offsetTop;
                //document.title += ' ' + element.offsetTop;
            }

            return r;
        };


        this.create = function() {
            var hide = document.createElement("div");
            hide.id = this.id + "hide";
            hide.style.position = 'fixed';
            hide.style.left = "0px";
            hide.style.top = "0px";
            hide.style.right = "0px";
            hide.style.bottom = "0px";
            hide.style.backgroundColor = "black";
            hide.style.opacity = 0.50;
            hide.oncontextmenu = function() { return false; };

            document.body.appendChild(hide);

            var div = document.createElement("div");
            div.id = this.id + 'popup';
            div.style.position = 'fixed';
            div.style.left = '50%';
            div.style.top = '0px';
            div.style.backgroundColor = 'white';
            div.style.width = "50px";
            div.style.height = "50px";
            if (this.dragDrop) {
                div.onmousedown = this.dragStart;
            }

            var defaultHeight = 50;

            var iframe = null;
            if (this.useIframe) {
                iframe = document.createElement("iframe");
                iframe.id = this.id + "iframe";
                iframe.name = this.id + "iframe";
                iframe.frameBorder = '0';
                iframe.style.width = '100%';
                iframe.style.height = defaultHeight + 'px';
                div.appendChild(iframe);
            }

            document.body.appendChild(div);

            this.div = div;
            this.iframe = iframe;
            this.hideDiv = hide;
        };


        this.dragStart = function(e) {
            This.maskIframe();
            This.coords = This.mc(e || window.event);
            This.start = { x: This.div.offsetLeft, y: This.div.offsetTop };
        };

        this.setInnerHTML = function(id, innerHTML) {
            var frame = window.frames[id];

            var doc = frame.contentWindow || frame.document || frame.contentDocument;
            //alert(id + ' ' + frame);
            if (doc.document) {
                doc = doc.document;
            }

            if (doc.body == null) {       // null in IE
                doc.write("<body></body>");
            }

            if (innerHTML.nodeType) {
                doc.body.appendChild(innerHTML);
            }
            else {
                doc.body.innerHTML = innerHTML;
            }
        };

        this.close = function(result) {
            this.result = result;
            this.hide();
        };

        this.hide = function() {
            if (this.div) {
                this.div.style.display = 'none';
                this.hideDiv.style.display = 'none';
                if (!this.useIframe) {
                    this.div.innerHTML = null;
                }
            }
            //DayPilot.ModalStatic = null;
            DayPilot.ModalStatic.remove(this);

            if (this.onClosed) {
                var args = {};
                args.result = this.result;
                this.onClosed(args);
            }
            else if (this.closed) {
                this.closed();
            }
        };
        
        this._applyOptions = function() {
            if (!options) {
                return;
            }

            for (var name in options) {
                this[name] = options[name];
            }
        };

        this._applyOptions();        

    };

    DayPilot.Modal.close = function(result) {
        if (parent && parent.DayPilot && parent.DayPilot.ModalStatic) {
            parent.DayPilot.ModalStatic.close(result);
        }
        else {
            throw "Unable to close DayPilot.Modal dialog.";
        }
    };

    DayPilot.Modal.opener = function() {
        return parent && parent.DayPilot && parent.DayPilot.ModalStatic && parent.DayPilot.ModalStatic.list[parent.DayPilot.ModalStatic.list.length - 1];
    };

})();
