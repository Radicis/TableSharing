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

    if (typeof DayPilot.DatePicker !== 'undefined') {
        return;
    }
	
    DayPilot.DatePicker = function(properties) {
        this.v = '215-lite';
        var navigatorId = "navigator_" + new Date().getTime();
        var This = this;
        
        this.prepare = function() {
            this.locale = "en-us";
            this.target = null;
            this.resetTarget = true;
            this.pattern = this._resolved.locale().datePattern;    // "M/d/yyyy"
            this.cssClassPrefix = "navigator_white";
            this.theme = null;
            this.patterns = [];

            // load settings
            if (properties) {
                for (var name in properties) {
                    this[name] = properties[name];
                }
            }
            this.init();
        };
        
        this.init = function() {
            this.date = new DayPilot.Date(this.date);
            
            var value = this._readFromTarget();

            if (this.resetTarget && !value) {
                this._writeToTarget(this.date);
            }

            DayPilot.re(document, "mousedown", function() {
                This.close();
            });
        };

        this.close = function() {
            if (!this._visible) {
                return;
            }
            if (this.navigator) {
                this.navigator.dispose();
            }
            this.div.innerHTML = '';
            if (this.div && this.div.parentNode === document.body) {
                document.body.removeChild(this.div);
            }
        };
        
        this._readFromTarget = function() {
            // recognized targets: input (value), other DOM elements (innerHTML)
            var element = this._element();
            
            if (!element) {
                return this.date;
            }
            
            var value = null;
            if (element.tagName === "INPUT") {
                value = element.value;
            }
            else {
                value = element.innerText;
            }

            if (!value) {
                return null;
            }
            
            var date = DayPilot.Date.parse(value, This.pattern);
            for (var i = 0; i < This.patterns.length; i++) {
                if (date) {
                    return date;
                }
                date = DayPilot.Date.parse(value, This.patterns[i]);
            }
            
            return date;
        };

        this._writeToTarget = function(date) {
            var element = this._element();
            
            if (!element) {
                return;
            }
            
            var value = date.toString(This.pattern, This.locale);
            if (element.tagName === "INPUT") {
                element.value = value;
            }
            else {
                element.innerHTML = value;
            }
            
        };

        this._resolved = {};
        this._resolved.locale = function() {
            return DayPilot.Locale.find(This.locale);
        };

        this._element = function() {
            var id = this.target;
            // accept DOM element or id (string)
            var element = (id && id.nodeType && id.nodeType === 1 ) ? id : document.getElementById(id);  
            return element;
        };

        this.show = function() {
            
            var element = this._element();
            var navigator = this.navigator;

            var navigator = new DayPilot.Navigator(navigatorId);
            navigator.api = 2;
            navigator.cssOnly = true;
            navigator.theme = This.theme || This.cssClassPrefix;
            navigator.weekStarts = "Auto";
            navigator.locale = This.locale;
            navigator.timeRangeSelectedHandling = "JavaScript";
            navigator.onTimeRangeSelected = function(args) { 
                This.date = args.start;
                        
                var start = args.start;
                var value = start.toString(This.pattern, This.locale); 
                
                var args = {};
                args.start = start;
                args.date = start;
                args.preventDefault = function() {
                    this.preventDefault.value = true;
                };

                if (typeof This.onTimeRangeSelect ===  'function') {
                    This.onTimeRangeSelect(args);
                    if (args.preventDefault.value) {
                        return;
                    }
                }

                This._writeToTarget(value);
                This.close(); 

                if (typeof This.onTimeRangeSelected === 'function') {
                    This.onTimeRangeSelected(args);
                } 
            };

            this.navigator = navigator;

            var position = DayPilot.abs(element);
            var height = element.offsetHeight;

            var div = document.createElement("div");
            div.style.position = "absolute";
            div.style.left = position.x + "px";
            div.style.top = (position.y + height) + "px";
            
            var nav = document.createElement("div");
            nav.id = navigatorId;
            div.appendChild(nav);

            DayPilot.re(div, "mousedown", function(ev) {
                var ev = ev || window.event;
                ev.cancelBubble = true;
                ev.stopPropagation && ev.stopPropagation();
            });

            document.body.appendChild(div);
            
            this.div = div;

            var selected = This._readFromTarget() || new DayPilot.Date().getDatePart();

            navigator.startDate = selected;
            navigator.selectionDay = selected;
            
            navigator.init();

            this._visible = true;
        };
        
        this.prepare();
    };

	
})();