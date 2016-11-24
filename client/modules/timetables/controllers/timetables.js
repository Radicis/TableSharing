timetableModule.controller('TimetableController', function($scope, $window, $routeParams, TimetableService, EventService, AuthenticationService, UserService) {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.table = null;
    $scope.eventSources = [];

    $scope.days = [
        {name: 'Sunday', value: 0},
        {name: 'Monday', value: 1},
        {name: 'Tuesday', value:2},
        {name: 'Wednesday', value: 3},
        {name: 'Thursday', value: 4},
        {name: 'Friday', value: 5},
        {name: 'Saturday', value: 6}
    ];

    $scope.hours = [
        {name: '7am', value: 7},
        {name: '8am', value: 8},
        {name: '9am', value: 9},
        {name: '10am', value: 10},
        {name: '11am', value: 11},
        {name: '12pm', value: 12},
        {name: '1pm', value: 13},
        {name: '2pm', value: 14},
        {name: '3pm', value: 15},
        {name: '4pm', value: 16},
        {name: '5pm', value:17},
        {name: '6pm', value:18},
        {name: '7pm', value:19},
        {name: '8pm', value:20}
    ];

    $scope.getAllTables = function(){
        TimetableService.getAll().then(function(tables){
            $scope.tables = tables;
        });
    };

    $scope.getTable = function(){
        var id = $routeParams._id;
        console.log("Getting table by id in controller");
        TimetableService.getTableById(id).then(function(table){
            $scope.table = table;
            $scope.getEventsByTableId(id);
            $scope.initTable();
        });
    };

    $scope.getEventsByTableId = function(id){
        $scope.events = EventService.getEventsByTableId(id);
        // EventService.getEventsByTableId(id).then(function(events){
        //     $scope.events = events;
        // });
    };

    $scope.createTimetable = function(){

        $scope.timetable.hiddenDays = calculateHiddenDays($scope.timetable.startDay, $scope.timetable.endDay);

        TimetableService.createTimetable($scope.timetable).then(function(table){
            var userID = AuthenticationService.getUserId();
            UserService.subscribeToTable(userID, table).then(function(){
                $window.location.href = '/#/timetables/' + table._id;
            })
        });
    };

    var calculateHiddenDays = function(startDay, endDay){
        var allDays = [0,1,2,3,4,5,6];
        var hiddenDays = [];

        for(var i=0; i<allDays.length; i++){
            if(allDays[i]<startDay || allDays[i]>endDay){
                hiddenDays.push(allDays[i]);
            }
        }

        return hiddenDays;

    };

    $scope.initTable = function(){
        $scope.personalEvents = {
            color: '#f00',
            textColor: 'yellow',
            events: [
                {type:'party',title: 'Lunch',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
                {type:'party',title: 'Lunch 2',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
                {type:'party',title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
            ]
        };

        /* event sources array*/
        $scope.eventSources.push($scope.personalEvents);
        $scope.eventSources.push($scope.events);

        console.log($scope.table);

        // Calendar configuration
        $scope.uiConfig = {
            calendar:{
                columnFormat: 'ddd M/D',
                height: 442,
                slotDuration: '00:30:00',
                editable: true,
                defaultView: "agendaWeek",
                nowIndicator: true,
                allDaySlot: false,
                minTime: $scope.table.startHour + ':00:00',
                maxTime: $scope.table.endHour + ':00:00',
                scrollTime: $scope.table.startHour + ':00:00',
                firstDay: $scope.table.startDay,
                allDayText: '',
                hiddenDays: $scope.table.hiddenDays,
                header:{
                    left: 'agendaWeek, month',
                    center: 'tite',
                    right: 'today prev,next'
                },

                eventClick: $scope.editEvent,
                eventDrop: $scope.alertOnDrop,
                eventResize: $scope.alertOnResize
            }
        };

    };

    /* alert on Drop */
    $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
        $scope.alertMessage = ('Event Dropped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
        $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };

    $scope.addEvent = function() {
        EventService.addEventModal();
    };

    $scope.editEvent = function() {
        EventService.editEventModal();
    };

});