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

    var doNothing = function() { };

    if (typeof DayPilot.Month !== 'undefined') {
        return;
    }
    
    var DayPilotMonth = {};

    DayPilotMonth.Month = function(placeholder) {
        this.v = '215-lite';
        this.nav = {};
        //this.nav.top = document.getElementById(placeholder);

        var calendar = this;

        this.id = placeholder;
        this.isMonth = true;

        this.hideUntilInit = true;

        this.angularAutoApply = false;
        this.api = 2;
        this.cssOnly = true;
        this.cssClassPrefix = "month_default";
        this.theme = null;
        this.startDate = new DayPilot.Date(); // today
        this.width = '100%'; // default width is 100%
        this.cellHeight = 100; // default cell height is 100 pixels (it's a minCellHeight, it will be extended if needed)
        this.eventFontColor = "#000000";
        this.eventFontFamily = "Tahoma";
        this.eventFontSize = "11px";
        this.headerBackColor = '#F3F3F9';
        this.headerFontColor = '#42658C';
        this.headerFontFamily = "Tahoma";
        this.headerFontSize = "10pt";
        this.headerHeight = 20;
        // TODO use locale instead
        this.weekStarts = 1; // Monday
        
        this.innerBorderColor = '#cccccc';
        this.borderColor = '#CED2CE';
        this.eventHeight = 25;
        this.cellHeaderHeight = 16;

        this.afterRender = function() { };
        this.backColor = '#ffffff';
        this.nonBusinessBackColor = '#ffffff';
        this.cellHeaderBackColor = '#ffffff';
        this.cellHeaderFontColor = '#42658C';
        this.cellHeaderFontFamily = 'Tahoma';
        this.cellHeaderFontSize = '10pt';
        this.eventBackColor = '#2951A5';
        this.eventBorderColor = '#2951A5';
        this.eventFontColor = '#ffffff';
        this.eventFontFamily = 'Tahoma';
        this.eventFontSize = '11px';
        this.cellWidth = 14.285; // internal, 7 cells per row
        this.lineSpace = 1;

        /*
        this.eventTimeFontColor = 'gray';
        this.eventTimeFontFamily = 'Tahoma';
        this.eventTimeFontSize = '8pt';
        */

        this.eventClickHandling = 'Enabled';
        this.eventMoveHandling = 'Update';
        this.eventResizeHandling = 'Update';
        this.timeRangeSelectedHandling = 'Enabled';

        this.onEventClick = null;
        this.onEventClicked = null;
        this.onEventMove = null;
        this.onEventMoved = null;
        this.onEventResize = null;
        this.onEventResized = null;
        this.onTimeRangeSelect = null;
        this.onTimeRangeSelected = null;

        this.backendUrl = null;
        this.cellEvents = [];

        this.elements = {};
        this.elements.events = [];

        this.cache = {};
        //this.cache.events = {}; // register DayPilotMonth.Event objects here, key is the data event, reset during drawevents

        this.updateView = function(result, context) {

            var result = eval("(" + result + ")");

            if (result.CallBackRedirect) {
                document.location.href = result.CallBackRedirect;
                return;
            }

            if (result.UpdateType === "None") {
                calendar.fireAfterRenderDetached(result.CallBackData, true);
                return;
            }

            calendar.events.list = result.Events;

            if (result.UpdateType === "Full") {

                // properties
                calendar.startDate = result.StartDate;
                calendar.headerBackColor = result.HeaderBackColor ? result.HeaderBackColor : calendar.headerBackColor;
                calendar.backColor = result.BackColor ? result.BackColor : calendar.backColor;
                calendar.nonBusinessBackColor = result.NonBusinessBackColor ? result.NonBusinessBackColor : calendar.nonBusinessBackColor;
                calendar.timeFormat = result.TimeFormat ? result.TimeFormat : calendar.timeFormat;
                if (typeof result.WeekStarts !== 'undefined') { calendar.weekStarts = result.WeekStarts; } // number, can be 0

                calendar.hashes = result.Hashes;
            }

            calendar._deleteEvents();
            calendar._prepareRows();
            calendar._loadEvents();

            if (result.UpdateType === "Full") {
                calendar._clearTable();
                calendar._drawTable();
            }
            calendar.updateHeight();

            calendar.show();

            calendar._drawEvents();

            calendar.fireAfterRenderDetached(result.CallBackData, true);

        };

        this.fireAfterRenderDetached = function(data, isCallBack) {
            var afterRenderDelayed = function(data, isc) {
                return function() {
                    if (calendar.afterRender) {
                        calendar.afterRender(data, isc);
                    }
                };
            };

            window.setTimeout(afterRenderDelayed(data, isCallBack), 0);
        };

        this.lineHeight = function() {
            return this.eventHeight + this.lineSpace;
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
            if (!this.cells) {
                return;
            }
            
            var full = true;

            this._resetCssOnly();

            calendar._deleteEvents();
            calendar._prepareRows();
            calendar._loadEvents();

            if (full) {
                calendar._clearTable();
                calendar._drawTable();
            }
            calendar.updateHeight();
            calendar.show();
            calendar._drawEvents();            
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

        this._loadEvents = function() {
            var events = this.events.list;
            
            if (!events) {
                return;
            }

            if (typeof this.onBeforeEventRender === 'function') {
                for (var i = 0; i < events.length; i++) {
                    this._doBeforeEventRender(i);
                }
            }
            
            // prepare rows and columns
            for (var x = 0; x < events.length; x++) {
                var data = events[x];

                data.start = new DayPilot.Date(data.start);
                data.end = new DayPilot.Date(data.end);
                if (data.start.getTime() > data.end.getTime()) { // skip invalid events, zero duration allowed
                    continue;
                }
                for (var i = 0; i < this.rows.length; i++) {
                    var row = this.rows[i];
                    var ep = new DayPilot.Event(data, this);
                    if (row.belongsHere(ep)) {
                        row.events.push(ep);

                        if (typeof this.onBeforeEventRender === 'function') {
                            ep.cache = this._cache.events[x];
                        }
                    }
                }
            }

            // arrange events into lines
            for (var ri = 0; ri < this.rows.length; ri++) {
                var row = this.rows[ri];
                row.events.sort(this.eventComparer);

                for (var ei = 0; ei < this.rows[ri].events.length; ei++) {
                    var ev = row.events[ei];
                    var colStart = row.getStartColumn(ev);
                    var colWidth = row.getWidth(ev);
                    var line = row.putIntoLine(ev, colStart, colWidth, ri);
                }
            }
        };


        this._deleteEvents = function() {
            for (var i = 0; i < this.elements.events.length; i++) {
                var e = this.elements.events[i];
                e.event = null;
                e.click = null;
                e.parentNode.removeChild(e);
            }

            this.elements.events = [];

        };

        this._drawEvents = function() {
            //this.cache.events = {};  // reset DayPilotMonth.Event object cache

            this._drawEventsRows();
        };

        this._drawEventsRows = function() {
            this.elements.events = [];

            // draw events
            for (var ri = 0; ri < this.rows.length; ri++) {
                var row = this.rows[ri];

                for (var li = 0; li < row.lines.length; li++) {
                    var line = row.lines[li];

                    for (var pi = 0; pi < line.length; pi++) {
                        this._drawEvent(line[pi]);
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

        this.drawShadow = function(x, y, line, width, offset, e) {

            if (!offset) {
                offset = 0;
            }

            var remains = width;

            this.shadow = {};
            this.shadow.list = [];
            this.shadow.start = { x: x, y: y };
            this.shadow.width = width;

            // something before the first day
            var hidden = y * 7 + x - offset;
            if (hidden < 0) {
                //document.title = hidden + ' ' + new Date();
                remains += hidden;
                x = 0;
                y = 0;
            }

            var remainingOffset = offset;
            while (remainingOffset >= 7) {
                y--;
                remainingOffset -= 7;
            }
            if (remainingOffset > x) {
                var plus = 7 - this.getColCount();
                if (remainingOffset > (x + plus)) {
                    y--;
                    x = x + 7 - remainingOffset;
                }
                else {
                    remains = remains - remainingOffset + x;
                    x = 0;
                }
            }
            else {
                x -= remainingOffset;
            }

            if (y < 0) {
                y = 0;
                x = 0;
            }

            var cursor = null;
            if (DayPilotMonth.resizingEvent) {
                cursor = 'w-resize';
            }
            else if (DayPilotMonth.movingEvent) {
                cursor = "move";
            }

            this.nav.top.style.cursor = cursor;

            while (remains > 0 && y < this.rows.length) {
                var drawNow = Math.min(this.getColCount() - x, remains);
                var row = this.rows[y];


                var top = this.getRowTop(y);
                var height = row.getHeight();

                var shadow = document.createElement("div");
                shadow.setAttribute("unselectable", "on");
                shadow.style.position = 'absolute';
                shadow.style.left = (this.getCellWidth() * x) + '%';
                shadow.style.width = (this.getCellWidth() * drawNow) + '%';
                shadow.style.top = (top) + 'px';
                shadow.style.height = (height) + 'px';
                shadow.style.cursor = cursor;

                var inside = document.createElement("div");
                inside.setAttribute("unselectable", "on");
                shadow.appendChild(inside);

                inside.style.position = "absolute";
                inside.style.top = "0px";
                inside.style.right = "0px";
                inside.style.left = "0px";
                inside.style.bottom = "0px";

                inside.style.backgroundColor = "#aaaaaa";
                inside.style.opacity = 0.5;
                inside.style.filter = "alpha(opacity=50)";
                //inside.style.border = '2px solid #aaaaaa';
                /*
                if (e) {
                    inside.style.overflow = 'hidden';
                    inside.style.fontSize = this.eventFontSize;
                    inside.style.fontFamily = this.eventFontFamily;
                    inside.style.color = this.eventFontColor;
                    inside.innerHTML = e.client.html();
                }
                */

                this.nav.top.appendChild(shadow);
                this.shadow.list.push(shadow);

                remains -= (drawNow + 7 - this.getColCount());
                x = 0;
                y++;
            }

        };

        this.clearShadow = function() {
            if (this.shadow) {
                for (var i = 0; i < this.shadow.list.length; i++) {
                    this.nav.top.removeChild(this.shadow.list[i]);
                }
                this.shadow = null;
                this.nav.top.style.cursor = '';
            }
        };

        this.getEventTop = function(row, line) {
            var top = this.headerHeight;
            for (var i = 0; i < row; i++) {
                top += this.rows[i].getHeight();
            }
            top += this.cellHeaderHeight; // space on top
            top += line * this.lineHeight();
            return top;
        };

        this.getDateFromCell = function(x, y) {
            //return DayPilot.Date.addDays(this.firstDate, y * 7 + x);
            return this.firstDate.addDays(y * 7 + x);
        };

        this._drawEvent = function(e) {
            /*

            supported properties:
            * cssClass
            * backColor
            * borderColor
            * fontColor
            * html
            * toolTip
            *
            * clickEnabled
             */

            var data = e.cache || e.data;

            //var ev = eventPart.event;
            var row = e.part.row;
            var line = e.part.line;
            var colStart = e.part.colStart;
            var colWidth = e.part.colWidth;

            var left = this.getCellWidth() * (colStart);
            var width = this.getCellWidth() * (colWidth);
            var top = this.getEventTop(row, line);

            var div = document.createElement("div");
            div.setAttribute("unselectable", "on");
            div.style.height = this.eventHeight + 'px';
            div.className = this._prefixCssClass("_event");

            if (data.cssClass) {
                DayPilot.Util.addClass(div, data.cssClass);
            }

            div.event = e;

            div.style.width = width + '%';
            div.style.position = 'absolute';
            div.style.left = left + '%';
            div.style.top = top + 'px'; // plus space on top

            if (this.showToolTip && e.client.toolTip()) {
                div.title = e.client.toolTip();
            }

            div.onclick = calendar.eventClickDispatch;
            div.onmousedown = function(ev) {
                ev = ev || window.event;
                var button = ev.which || ev.button;

                ev.cancelBubble = true;
                if (ev.stopPropagation) {
                    ev.stopPropagation();
                }

                if (button === 1) {

                    DayPilotMonth.movingEvent = null;
                    if (this.style.cursor === 'w-resize' || this.style.cursor === 'e-resize') {
                        var resizing = {};
                        resizing.start = {};
                        resizing.start.x = colStart;
                        resizing.start.y = row;
                        resizing.event = div.event;
                        resizing.width = DayPilot.DateUtil.daysSpan(resizing.event.start(), resizing.event.end()) + 1;
                        resizing.direction = this.style.cursor;
                        DayPilotMonth.resizingEvent = resizing;
                    }
                    else if (this.style.cursor === 'move' || calendar.eventMoveHandling !== 'Disabled') {
                        calendar.clearShadow();

                        var coords = DayPilot.mo2(calendar.nav.top, ev);
                        if (!coords) {
                            return;
                        }

                        var cell = calendar.getCellBelowPoint(coords.x, coords.y);

                        var hidden = DayPilot.DateUtil.daysDiff(e.start(), calendar.rows[row].start);
                        var offset = (cell.y * 7 + cell.x) - (row * 7 + colStart);
                        if (hidden) {
                            offset += hidden;
                        }

                        var moving = {};
                        moving.start = {};
                        moving.start.x = colStart;
                        moving.start.y = row;
                        moving.start.line = line;
                        moving.offset = calendar.eventMoveToPosition ? 0 : offset;
                        moving.colWidth = colWidth;
                        moving.event = div.event;
                        moving.coords = coords;
                        DayPilotMonth.movingEvent = moving;

                    }

                }
            };

            div.onmousemove = function(ev) {
                if (typeof (DayPilotMonth) === 'undefined') {
                    return;
                }

                if (DayPilotMonth.movingEvent || DayPilotMonth.resizingEvent) {
                    return;
                }

                // position
                var offset = DayPilot.mo3(div, ev);
                if (!offset) {
                    return;
                }
                
                var resizeMargin = 6;

                if (offset.x <= resizeMargin && calendar.eventResizeHandling !== 'Disabled') {
                    if (e.part.startsHere) {
                        div.style.cursor = "w-resize";
                        div.dpBorder = 'left';
                    }
                    else {
                        div.style.cursor = 'not-allowed';
                    }
                }
                else if (div.clientWidth - offset.x <= resizeMargin && calendar.eventResizeHandling !== 'Disabled') {
                    if (e.part.endsHere) {
                        div.style.cursor = "e-resize";
                        div.dpBorder = 'right';
                    }
                    else {
                        div.style.cursor = 'not-allowed';
                    }
                }
                else {
                    div.style.cursor = 'default';
                }

            };

            div.onmouseout = function(ev) {
                div.style.cursor = '';
            };

            var inner = document.createElement("div");
            inner.setAttribute("unselectable", "on");
            inner.className = this._prefixCssClass("_event_inner");

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


            inner.innerHTML = e.client.html();

            div.appendChild(inner);

            this.elements.events.push(div);

            this.nav.events.appendChild(div);
        };


        // returns DayPilot.Date object
        this.lastVisibleDayOfMonth = function() {
            return  this.startDate.lastDayOfMonth();
        };

        this._prepareRows = function() {

            if (typeof this.startDate === 'string') {
                this.startDate = new DayPilot.Date(this.startDate);
            }
            this.startDate = this.startDate.firstDayOfMonth();

            this.firstDate = this.startDate.firstDayOfWeek(this.getWeekStart());

            var firstDayOfMonth = this.startDate;

            var rowCount;

            var lastVisibleDayOfMonth = this.lastVisibleDayOfMonth();
            var count = DayPilot.DateUtil.daysDiff(this.firstDate, lastVisibleDayOfMonth) + 1;
            rowCount = Math.ceil(count / 7);

            this.days = rowCount * 7;

            this.rows = [];
            for (var x = 0; x < rowCount; x++) {
                var r = {};
                r.start = this.firstDate.addDays( x * 7);  // start point
                r.end = r.start.addDays(this.getColCount()); // end point
                r.events = []; // collection of events
                r.lines = []; // collection of lines
                r.index = x; // row index
                r.minHeight = this.cellHeight; // default, can be extended during events loading
                r.calendar = this;

                r.belongsHere = function(ev) {
                    if (ev.end().getTime() === ev.start().getTime() && ev.start().getTime() === this.start.getTime()) {
                        return true;
                    }
                    return !(ev.end().getTime() <= this.start.getTime() || ev.start().getTime() >= this.end.getTime());
                };

                r.getPartStart = function(ev) {
                    return DayPilot.DateUtil.max(this.start, ev.start());
                };

                r.getPartEnd = function(ev) {
                    return DayPilot.DateUtil.min(this.end, ev.end());
                };

                r.getStartColumn = function(ev) {
                    var partStart = this.getPartStart(ev);
                    return DayPilot.DateUtil.daysDiff(this.start, partStart);
                };

                r.getWidth = function(ev) {
                    return DayPilot.DateUtil.daysSpan(this.getPartStart(ev), this.getPartEnd(ev)) + 1;
                };

                r.putIntoLine = function(ev, colStart, colWidth, row) {
                    var thisRow = this;

                    for (var i = 0; i < this.lines.length; i++) {
                        var line = this.lines[i];
                        if (line.isFree(colStart, colWidth)) {
                            line.addEvent(ev, colStart, colWidth, row, i);
                            return i;
                        }
                    }

                    var line = [];
                    line.isFree = function(colStart, colWidth) {
                        var free = true;

                        for (var i = 0; i < this.length; i++) {
                            if (!(colStart + colWidth - 1 < this[i].part.colStart || colStart > this[i].part.colStart + this[i].part.colWidth - 1)) {
                                free = false;
                            }
                        }

                        return free;
                    };
                   
                    line.addEvent = function(ep, colStart, colWidth, row, index) {
                        //var eventPart = {};
                        //eventPart.event = ev;
                        ep.part.colStart = colStart;
                        ep.part.colWidth = colWidth;
                        ep.part.row = row;
                        ep.part.line = index;
                        ep.part.startsHere = thisRow.start.getTime() <= ep.start().getTime();
                        //if (confirm('r.start: ' + thisRow.start + ' ev.Start: ' + ev.Start)) thisRow = null;
                        ep.part.endsHere = thisRow.end.getTime() >= ep.end().getTime();

                        this.push(ep);
                    };
                    
                    line.addEvent(ev, colStart, colWidth, row, this.lines.length);

                    this.lines.push(line);

                    return this.lines.length - 1;
                };

                r.getStart = function() {
                    var start = 0;
                    for (var i = 0; i < calendar.rows.length && i < this.index; i++) {
                        start += calendar.rows[i].getHeight();
                    }
                };

                r.getHeight = function() {
                    return Math.max(this.lines.length * calendar.lineHeight() + calendar.cellHeaderHeight, this.calendar.cellHeight);
                };

                this.rows.push(r);
            }

            //this.endDate = DayPilot.Date.addDays(this.firstDate, rowCount * 7);
            this.endDate = this.firstDate.addDays(rowCount * 7);
        };

        this.getHeight = function() {
            var height = this.headerHeight;
            for (var i = 0; i < this.rows.length; i++) {
                height += this.rows[i].getHeight();
            }
            return height;
        };

        this.getWidth = function(start, end) {
            var diff = (end.y * 7 + end.x) - (start.y * 7 + start.x);
            return diff + 1;
        };

        this.getMinCoords = function(first, second) {
            if ((first.y * 7 + first.x) < (second.y * 7 + second.x)) {
                return first;
            }
            else {
                return second;
            }
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

        this.drawTop = function() {
            var relative = this.nav.top;
            //this.nav.top = relative;
            relative.setAttribute("unselectable", "on");
            relative.style.MozUserSelect = 'none';
            relative.style.KhtmlUserSelect = 'none';
            relative.style.WebkitUserSelect = 'none';
            relative.style.position = 'relative';
            if (this.width) {
                relative.style.width = this.width;
            }
            relative.style.height = this.getHeight() + 'px';
            relative.onselectstart = function(e) { return false; }; // prevent text cursor in Chrome during drag&drop


            if (this.hideUntilInit) {
                relative.style.visibility = 'hidden';
            }
            
            if (this.cssOnly) {
                relative.className = this._prefixCssClass("_main");
            }
            else {
                relative.style.border = "1px solid " + this.borderColor;
            }

            var cells = document.createElement("div");
            this.nav.cells = cells;
            cells.style.position = "absolute";
            cells.style.left = "0px";
            cells.style.right = "0px";
            cells.setAttribute("unselectable", "on");
            relative.appendChild(cells);

            var events = document.createElement("div");
            this.nav.events = events;
            events.style.position = "absolute";
            events.style.left = "0px";
            events.style.right = "0px";
            events.setAttribute("unselectable", "on");
            relative.appendChild(events);

            relative.onmousemove = function(ev) {

                if (DayPilotMonth.resizingEvent) {
                    var coords = DayPilot.mo2(calendar.nav.top, ev);

                    if (!coords) {
                        return;
                    }

                    var cell = calendar.getCellBelowPoint(coords.x, coords.y);
                    calendar.clearShadow();
                    var resizing = DayPilotMonth.resizingEvent;

                    var original = resizing.start;
                    var width, start;

                    if (resizing.direction === 'w-resize') {
                        start = cell;

                        var endDate = resizing.event.end();
                        //if (DayPilot.Date.getDate(endDate).getTime() === endDate.getTime()) {
                        if (endDate.getDatePart() === endDate) {
                            endDate = endDate.addDays(-1);
                        }

                        var end = calendar.getCellFromDate(endDate);
                        width = calendar.getWidth(cell, end);
                    }
                    else {
                        start = calendar.getCellFromDate(resizing.event.start());
                        width = calendar.getWidth(start, cell);
                    }

                    if (width < 1) {
                        width = 1;
                    }

                    calendar.drawShadow(start.x, start.y, 0, width);

                }
                else if (DayPilotMonth.movingEvent) {
                    var coords = DayPilot.mo2(calendar.nav.top, ev);

                    if (!coords) {
                        return;
                    }

                    // not actually moved, Chrome bug
                    if (coords.x === DayPilotMonth.movingEvent.coords.x && coords.y === DayPilotMonth.movingEvent.coords.y) {
                        return;
                    }

                    var cell = calendar.getCellBelowPoint(coords.x, coords.y);

                    calendar.clearShadow();

                    var event = DayPilotMonth.movingEvent.event;
                    var offset = DayPilotMonth.movingEvent.offset;
                    var width = calendar.cellMode ? 1 : DayPilot.DateUtil.daysSpan(event.start(), event.end()) + 1;

                    if (width < 1) {
                        width = 1;
                    }
                    calendar.drawShadow(cell.x, cell.y, 0, width, offset, event);
                }
                else if (DayPilotMonth.timeRangeSelecting) {
                    var coords = DayPilot.mo2(calendar.nav.top, ev);

                    if (!coords) {
                        return;
                    }

                    var cell = calendar.getCellBelowPoint(coords.x, coords.y);

                    calendar.clearShadow();

                    var start = DayPilotMonth.timeRangeSelecting;

                    var startIndex = start.y * 7 + start.x;
                    var cellIndex = cell.y * 7 + cell.x;

                    var width = Math.abs(cellIndex - startIndex) + 1;

                    if (width < 1) {
                        width = 1;
                    }

                    var shadowStart = startIndex < cellIndex ? start : cell;

                    DayPilotMonth.timeRangeSelecting.from = { x: shadowStart.x, y: shadowStart.y };
                    DayPilotMonth.timeRangeSelecting.width = width;
                    DayPilotMonth.timeRangeSelecting.moved = true;

                    calendar.drawShadow(shadowStart.x, shadowStart.y, 0, width, 0, null);

                }

            };

            //this.nav.top.appendChild(this.vsph);
        };

        this.updateHeight = function() {
            this.nav.top.style.height = this.getHeight() + 'px';

            for (var x = 0; x < this.cells.length; x++) {
                for (var y = 0; y < this.cells[x].length; y++) {
                    this.cells[x][y].style.top = this.getRowTop(y) + 'px';
                    this.cells[x][y].style.height = this.rows[y].getHeight() + 'px';
                }
            }
        };

        this.getCellBelowPoint = function(x, y) {
            var columnWidth = Math.floor(this.nav.top.clientWidth / this.getColCount());
            var column = Math.min(Math.floor(x / columnWidth), this.getColCount() - 1);

            var row = null;

            var height = this.headerHeight;
            var relativeY = 0;
            for (var i = 0; i < this.rows.length; i++) {
                var baseHeight = height;
                height += this.rows[i].getHeight();
                if (y < height) {
                    relativeY = y - baseHeight;
                    row = i;
                    break;
                }
            }
            if (row === null) {
                row = this.rows.length - 1; // might be a pixel below the last line
            }

            var cell = {};
            cell.x = column;
            cell.y = row;
            cell.relativeY = relativeY;

            return cell;
        };

        this.getCellFromDate = function(date) {
            var width = DayPilot.DateUtil.daysDiff(this.firstDate, date);
            var cell = { x: 0, y: 0 };
            while (width >= 7) {
                cell.y++;
                width -= 7;
            }
            cell.x = width;
            return cell;
        };

        this._drawTable = function() {

            var table = document.createElement("div");
            table.oncontextmenu = function() { return false; };
            this.nav.cells.appendChild(table);

            this.cells = [];

            for (var x = 0; x < this.getColCount(); x++) {

                this.cells[x] = [];
                var headerProperties = null;

                var header = document.createElement("div");
                header.setAttribute("unselectable", "on");
                header.style.position = 'absolute';

                header.style.left = (this.getCellWidth() * x) + '%';
                header.style.width = (this.getCellWidth()) + '%';
                header.style.top = '0px';
                header.style.height = (this.headerHeight) + 'px';

                var dayIndex = x + this.getWeekStart();
                if (dayIndex > 6) {
                    dayIndex -= 7;
                }
                
                if (this.cssOnly) {
                    header.className = this._prefixCssClass("_header");
                }

                var inner = document.createElement("div");
                inner.setAttribute("unselectable", "on");
                inner.innerHTML = resolved.locale().dayNames[dayIndex];

                header.appendChild(inner);

                inner.style.position = "absolute";
                inner.style.top = "0px";
                inner.style.bottom = "0px";
                inner.style.left = "0px";
                inner.style.right = "0px";
                
                if (this.cssOnly) {
                    inner.className = this._prefixCssClass("_header_inner");
                }
                else {
                    inner.style.backgroundColor = this.headerBackColor;
                    inner.style.fontFamily = this.headerFontFamily;
                    inner.style.fontSize = this.headerFontSize;
                    inner.style.color = this.headerFontColor;

                    inner.style.textAlign = 'center';
                    inner.style.cursor = 'default';
                    if (x !== this.getColCount() - 1) {
                        inner.style.borderRight = '1px solid ' + this.borderColor;
                    }
                }

                inner.innerHTML = resolved.locale().dayNames[dayIndex];

                table.appendChild(header);

                for (var y = 0; y < this.rows.length; y++) {
                    this.drawCell(x, y, table);
                }

            }

        };

        this._clearTable = function() {

            // clear event handlers
            for (var x = 0; x < this.cells.length; x++) {
                for (var y = 0; y < this.cells[x].length; y++) {
                    this.cells[x][y].onclick = null;
                }
            }

            this.nav.cells.innerHTML = '';

        };

        this._api2 = function() {
            return calendar.api === 2;
        }; 
        this.drawCell = function(x, y, table) {

            var row = this.rows[y];
            var d = this.firstDate.addDays(y * 7 + x);
            var cellProperties = this.cellProperties ? this.cellProperties[y * this.getColCount() + x] : null;


            var cell = document.createElement("div");
            cell.setAttribute("unselectable", "on");
            cell.style.position = 'absolute';
            cell.style.cursor = 'default';
            cell.style.left = (this.getCellWidth() * x) + '%';
            cell.style.width = (this.getCellWidth()) + '%';
            cell.style.top = (this.getRowTop(y)) + 'px';
            cell.style.height = (row.getHeight()) + 'px';
            
            if (this.cssOnly) {
                cell.className = this._prefixCssClass("_cell");
                
                if (!this.isWeekend(d)) {
                    var business = this._prefixCssClass("_cell_business");
                    DayPilot.Util.addClass(cell, business);
                }
            }

            var previousMonth = this.startDate.addMonths(-1).getMonth();
            var nextMonth = this.startDate.addMonths(1).getMonth();

            var thisMonth = this.startDate.getMonth();

            var inner = document.createElement("div");
            inner.setAttribute("unselectable", "on");
            cell.appendChild(inner);

            inner.style.position = "absolute";
            inner.style.left = "0px";
            inner.style.right = "0px";
            inner.style.top = "0px";
            inner.style.bottom = "0px";


            if (this.cssOnly) {
                inner.className = this._prefixCssClass("_cell_inner");
            }
            else {
                inner.style.backgroundColor = this.getCellBackColor(d);

                if (x !== this.getColCount() - 1) {
                    inner.style.borderRight = '1px solid ' + this.innerBorderColor;
                }

                if (y === 0) {
                    inner.style.borderTop = '1px solid ' + this.borderColor;
                } 

                inner.style.borderBottom = '1px solid ' + this.innerBorderColor;
            }


            cell.onmousedown = function(e) {
                if (calendar.timeRangeSelectedHandling !== 'Disabled') {
                    calendar.clearShadow();
                    DayPilotMonth.timeRangeSelecting = { "root": calendar, "x": x, "y": y, "from": { x: x, y: y }, "width": 1 };
                }
            };

            cell.onclick = function() {

                var single = function(d) {
                    var start = new DayPilot.Date(d);
                    var end = start.addDays(1);
                    calendar.timeRangeSelectedDispatch(start, end);
                };

                if (calendar.timeRangeSelectedHandling !== 'Disabled') {
                    single(d);
                    return;
                }

            };

            var day = document.createElement("div");
            day.setAttribute("unselectable", "on");
            day.style.height = this.cellHeaderHeight + "px";

            if (this.cssOnly) {
                day.className = this._prefixCssClass("_cell_header");
            }
            else {
                if (this.cellHeaderBackColor) {
                    day.style.backgroundColor = this.cellHeaderBackColor;
                }
                day.style.paddingRight = '2px';
                day.style.textAlign = "right";
                day.style.fontFamily = this.cellHeaderFontFamily;
                day.style.fontSize = this.cellHeaderFontSize;
                day.style.color = this.cellHeaderFontColor;
            }

            var date = d.getDay();
            if (date === 1) {
                day.innerHTML = resolved.locale().monthNames[d.getMonth()] + ' ' + date;
            }
            else {
                day.innerHTML = date;
            }

            inner.appendChild(day);

            this.cells[x][y] = cell;

            table.appendChild(cell);
        };

        this.getWeekStart = function() {
            return resolved.locale().weekStarts;
        };

        this.getColCount = function() {
            return 7;
        };

        this.getCellWidth = function() {
            return 14.285;
        };

        this.getCellBackColor = function(d) {
            if (d.getDayOfWeek() === 6 || d.getDayOfWeek() === 0) {
                return this.nonBusinessBackColor;
            }
            return this.backColor;
        };

        this.getRowTop = function(index) {
            var top = this.headerHeight;
            for (var i = 0; i < index; i++) {
                top += this.rows[i].getHeight();
            }
            return top;
        };

        this._callBack2 = function(action, data, parameters) {

            var envelope = {};

            envelope.action = action;
            envelope.parameters = parameters;
            envelope.data = data;
            envelope.header = this._getCallBackHeader();

            var commandstring = "JSON" + DayPilot.JSON.stringify(envelope);

            if (this.backendUrl) {
                DayPilot.request(this.backendUrl, this.callBackResponse, commandstring, this.ajaxError);
            }
        };

        this.callBackResponse = function(response) {
            calendar.updateView(response.responseText);
        };

        this._getCallBackHeader = function() {
            var h = {};
            h.control = "dpm";
            h.id = this.id;
            h.v = this.v;

            h.visibleStart = new DayPilot.Date(this.firstDate);
            h.visibleEnd = h.visibleStart.addDays(this.days);

            h.startDate = calendar.startDate;
            h.headerBackColor = this.headerBackColor;
            h.backColor = this.backColor;
            h.nonBusinessBackColor = this.nonBusinessBackColor;
            h.timeFormat = this.timeFormat;
            h.weekStarts = this.weekStarts;

            return h;
        };

        this.eventClickCallBack = function(e, data) {
            this._callBack2('EventClick', data, e);
        };

        this.eventClickDispatch = function(e) {

            DayPilotMonth.movingEvent = null;
            DayPilotMonth.resizingEvent = null;

            var div = this;

            var e = e || window.event;
            var ctrlKey = e.ctrlKey;

            e.cancelBubble = true;
            if (e.stopPropagation) {
                e.stopPropagation();
            }

            calendar.eventClickSingle(div, ctrlKey);
        };


        this.eventClickSingle = function(div) {
            var e = div.event;
            if (!e.client.clickEnabled()) {
                return;
            }

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
                }

                if (typeof calendar.onEventClicked === 'function') {
                    calendar._angular.apply(function() {
                        calendar.onEventClicked(args);
                    });
                }                
            }
            else {
                switch (calendar.eventClickHandling) {
                    case 'CallBack':
                        calendar.eventClickCallBack(e);
                        break;
                    case 'JavaScript':
                        calendar.onEventClick(e);
                        break;
                }
            }
        };

        this.eventMoveCallBack = function(e, newStart, newEnd, data, position) {
            if (!newStart)
                throw 'newStart is null';
            if (!newEnd)
                throw 'newEnd is null';

            var params = {};
            params.e = e;
            params.newStart = newStart;
            params.newEnd = newEnd;
            params.position = position;

            this._callBack2('EventMove', data, params);
        };

        this.eventMoveDispatch = function(e, x, y, offset, ev, position) {

            var startOffset = e.start().getTimePart();

            var endDate = e.end().getDatePart();
            if (endDate !== e.end()) {
                endDate = endDate.addDays(1);
            }
            var endOffset = DayPilot.DateUtil.diff(e.end(), endDate);

            var boxStart = this.getDateFromCell(x, y);
            boxStart = boxStart.addDays(-offset);
            var width = DayPilot.DateUtil.daysSpan(e.start(), e.end()) + 1;

            var boxEnd = boxStart.addDays(width);

            var newStart = boxStart.addTime(startOffset);
            var newEnd = boxEnd.addTime(endOffset);

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
                    case 'CallBack':
                        calendar.eventMoveCallBack(e, newStart, newEnd);
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
                    case 'CallBack':
                        calendar.eventMoveCallBack(e, newStart, newEnd);
                        break;
                    case 'JavaScript':
                        calendar.onEventMove(e, newStart, newEnd);
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

        this.eventResizeDispatch = function(e, start, width) {
            var startOffset = e.start().getTimePart();

            var endDate = e.end().getDatePart();
            if (endDate !== e.end()) {
                endDate = endDate.addDays(1);
            }
            var endOffset = DayPilot.DateUtil.diff(e.end(), endDate);

            var boxStart = this.getDateFromCell(start.x, start.y);
            //var width = DayPilot.Date.daysSpan(e.start(), e.end()) + 1;
            var boxEnd = boxStart.addDays(width);

            var newStart = boxStart.addTime(startOffset);
            var newEnd = boxEnd.addTime(endOffset);

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
                    case 'CallBack':
                        calendar.eventResizeCallBack(e, newStart, newEnd);
                        break;
                    case 'JavaScript':
                        calendar.onEventResize(e, newStart, newEnd);
                        break;
                }
            }

        };


        this.timeRangeSelectedCallBack = function(start, end, data) {

            var range = {};
            range.start = start;
            range.end = end;

            this._callBack2('TimeRangeSelected', data, range);
        };

        this.timeRangeSelectedDispatch = function(start, end) {
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
                    case 'CallBack':
                        calendar.timeRangeSelectedCallBack(start, end);
                        break;
                    case 'JavaScript':
                        calendar.onTimeRangeSelected(start, end);
                        break;
                }     
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
            f();

            /*
            if (calendar.angularAutoApply && calendar._angular.scope) {
                calendar._angular.scope["$apply"](f);
            }
            else {
                f();
            }*/
        };

        this.clearSelection = function() {
            calendar.clearShadow();
        };

        this.commandCallBack = function(command, data) {

            var params = {};
            params.command = command;

            this._callBack2('Command', data, params);
        };
        
        this.isWeekend = function(date) {
            date = new DayPilot.Date(date);
            
            var sunday = 0;
            var saturday = 6;

            if (date.dayOfWeek() === sunday) {
                return true;
            }
            if (date.dayOfWeek() === saturday) {
                return true;
            }
            return false;
        };

        this._resolved = {};
        this._resolved.locale = function() {
            var found = DayPilot.Locale.find(calendar.locale);
            if (!found) {
                return DayPilot.Locale.US;
            }
            return found;
        };
        
        var resolved = this._resolved;

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

        this.registerGlobalHandlers = function() {
            if (!DayPilotMonth.globalHandlers) {
                DayPilotMonth.globalHandlers = true;
                DayPilot.re(document, 'mouseup', DayPilotMonth.gMouseUp);
            }
        };

        this.loadFromServer = function() {
            // make sure it has a place to ask
            if (this.backendUrl || typeof WebForm_DoCallback === 'function') {
                return (typeof calendar.events.list === 'undefined') || (!calendar.events.list);
            }
            else {
                return false;
            }

        };

        this.show = function() {
            if (this.nav.top.style.visibility === 'hidden') {
                this.nav.top.style.visibility = 'visible';
            }
        };

        this._loadTop = function() {
            if (this.id && this.id.tagName) {
                this.nav.top = this.id;
            }
            else if (typeof this.id === "string") {
                this.nav.top = document.getElementById(this.id);
                if (!this.nav.top) {
                    throw "DayPilot.Month: The placeholder element not found: '" + id + "'.";
                }
            }
            else {
                throw "DayPilot.Month() constructor requires the target element or its ID as a parameter";
            }
        };

        this._resetCssOnly = function() {
            if (!calendar.cssOnly) {
                calendar.cssOnly = true;
                window.console && window.console.log && window.console.log("DayPilot: cssOnly = false mode is not supported anymore.");
            }
        };


        this._initShort = function() {

            this._prepareRows();
            this.drawTop();
            this._drawTable();
            this.registerGlobalHandlers();
            this._callBack2('Init'); // load events
        };



        this.init = function() {
            this._loadTop();

            var loadFromServer = this.loadFromServer();

            this._resetCssOnly();
            
            if (loadFromServer) {
                this._initShort();
                return;
            }

            this._prepareRows();
            this._loadEvents();
            this.drawTop();
            this._drawTable();
            this.show();
            this._drawEvents();

            this.registerGlobalHandlers();

            if (this.messageHTML) {
                this.message(this.messageHTML);
            }

            this.fireAfterRenderDetached(null, false);

        };
        
        this.Init = this.init;
    };

    DayPilotMonth.gMouseUp = function(ev) {

        if (DayPilotMonth.movingEvent) {
            var src = DayPilotMonth.movingEvent;

            if (!src.event) {
                return;
            }
            if (!src.event.calendar) {
                return;
            }
            if (!src.event.calendar.shadow) {
                return;
            }
            if (!src.event.calendar.shadow.start) {
                return;
            }

            // load ref
            var calendar = DayPilotMonth.movingEvent.event.calendar;
            var e = DayPilotMonth.movingEvent.event;
            var start = calendar.shadow.start;
            var position = calendar.shadow.position;
            var offset = DayPilotMonth.movingEvent.offset;

            // cleanup
            calendar.clearShadow();
            DayPilotMonth.movingEvent = null;

            var ev = ev || window.event;

            // fire the event
            calendar.eventMoveDispatch(e, start.x, start.y, offset, ev, position);

            ev.cancelBubble = true;
            if (ev.stopPropagation) {
                ev.stopPropagation();
            }
            DayPilotMonth.movingEvent = null;
            return false;
        }
        else if (DayPilotMonth.resizingEvent) {
            var src = DayPilotMonth.resizingEvent;

            if (!src.event) {
                return;
            }
            if (!src.event.calendar) {
                return;
            }
            if (!src.event.calendar.shadow) {
                return;
            }
            if (!src.event.calendar.shadow.start) {
                return;
            }

            // load ref
            var calendar = DayPilotMonth.resizingEvent.event.calendar;

            var e = DayPilotMonth.resizingEvent.event;
            var start = calendar.shadow.start;
            var width = calendar.shadow.width;

            // cleanup
            calendar.clearShadow();
            DayPilotMonth.resizingEvent = null;

            // fire the event
            calendar.eventResizeDispatch(e, start, width);

            ev.cancelBubble = true;
            DayPilotMonth.resizingEvent = null;
            return false;
        }
        else if (DayPilotMonth.timeRangeSelecting) {
            if (DayPilotMonth.timeRangeSelecting.moved) {
                var sel = DayPilotMonth.timeRangeSelecting;
                var calendar = sel.root;

                var start = new DayPilot.Date(calendar.getDateFromCell(sel.from.x, sel.from.y));
                var end = start.addDays(sel.width);
                calendar.timeRangeSelectedDispatch(start, end);

                calendar.clearShadow();
            }
            DayPilotMonth.timeRangeSelecting = null;
        }
    };

    // publish the API 

    // current
    DayPilot.Month = DayPilotMonth.Month;

    // experimental jQuery bindings
    if (typeof jQuery !== 'undefined') {
        (function($) {
            $.fn.daypilotMonth = function(options) {
                var first = null;
                var j = this.each(function() {
                    if (this.daypilot) { // already initialized
                        return;
                    };

                    var daypilot = new DayPilot.Month(this.id);
                    this.daypilot = daypilot;
                    for (name in options) {
                        daypilot[name] = options[name];
                    }
                    daypilot.Init();
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
        })(jQuery);
    }

    (function registerAngularModule() {

        var app = DayPilot.am();

        if (!app) {
            return;
        }

        app.directive("daypilotMonth", ['$parse', function($parse) {
            return {
                "restrict": "E",
                "template": "<div></div>",
                "replace": true,
                "link": function (scope, element, attrs) {

                    var calendar = new DayPilot.Month(element[0]);
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

                    //var watch = scope["$watch"];

                    watch.call(scope, config, function (value) {
                        for (var name in value) {
                            calendar[name] = value[name];
                        }
                        calendar.update();
                    }, true);

                    watch.call(scope, events, function(value) {
                        calendar.events.list = value;
                        calendar.update();
                    }, true);

                }
            };
        }]);
    })();


    if (typeof Sys !== 'undefined' && Sys.Application && Sys.Application.notifyScriptLoaded) {
        Sys.Application.notifyScriptLoaded();
    }


})();