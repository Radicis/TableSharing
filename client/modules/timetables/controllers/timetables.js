timetableModule.controller('TimetableController', function($scope, ngToast, $rootScope, $window, $routeParams, TimetableService, EventService, AuthenticationService, UserService) {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.table = null;
    $scope.eventSources = [];
    $scope.events = [];

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
            $scope.initTable();
        });
    };

    var calculateHiddenDays = function(startDay, endDay){
        console.log("Hidden days for: " + startDay + " and " + endDay);
        var allDays = [0,1,2,3,4,5,6];
        var hiddenDays = [];

        for(var i=0; i<allDays.length; i++){
            if(allDays[i]<startDay || allDays[i]>endDay){
                hiddenDays.push(allDays[i]);
            }
        }

        return hiddenDays.length0=0 ? null : hiddenDays;
    };

    $scope.createTimetable = function(){

        $scope.timetable.hiddenDays = calculateHiddenDays($scope.timetable.startDay, $scope.timetable.endDay);

        TimetableService.createTimetable($scope.timetable).then(function(table){
            var userID = AuthenticationService.getUserId();
            UserService.subscribeToTable(userID, table).then(function(){
                if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
                $window.location.href = '/#/timetables/' + table._id;
                ngToast.create('Timetable Created');
            })
        });
    };


    $scope.initTable = function(){

        EventService.getEventsByTableId($scope.table._id).then(function(events){
            console.log(events);
            $scope.events = events;
            $scope.eventSources.push($scope.events);


            // EventService.getPersonalEvents(AuthenticationService.getUserId()).then(function(events){
            //     $scope.personalEvents = events;
            //
            //     /* event sources array*/
            //     $scope.eventSources.push($scope.personalEvents);

                // Calendar configuration
                $scope.uiConfig = {
                    calendar:{
                        theme: false,
                        columnFormat: {
                            week: 'ddd' // Only show day of the week names
                        },
                        header: false, // Hide buttons/titles
                        height: 500,
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
                        // header:{
                        //     left: 'agendaWeek, month',
                        //     center: 'tite',
                        //     right: 'today prev,next'
                        // },

                        eventClick: $scope.editEvent,
                        eventDrop: $scope.move,
                        eventResize: $scope.resize
                    }
                };
            });

       // });

    };

    /* alert on Drop */
    $scope.move = function(event){
        EventService.editEventTime(event).then(function(event){
            ngToast.create(event.title + ' updated');
        });

    };
    /* alert on Resize */
    $scope.resize = function(event){
        EventService.editEventTime(event).then(function(event){
            ngToast.create(event.title + ' updated');
        });

    };

    $scope.addEvent = function() {

        var event = {
                title: 'New Event',
                start:   new Date(y, m, d, $scope.table.startHour + 1, 0),
                parentTable: $scope.table._id,
                end: new Date(y, m, d, $scope.table.startHour + 2, 0),
                location: 'Room 1'
        };

        EventService.addEventModal(event, $scope.events);

    };

    $scope.addPersonalEvent = function() {

        var event = {
            title: 'New Event',
            start:   new Date(y, m, d, $scope.table.startHour + 1, 0),
            owner: AuthenticationService.getUserId(),
            end: new Date(y, m, d, $scope.table.startHour + 2, 0),
            location: 'Room 1'
        };

        EventService.addPersonalEventModal(event, $scope.events);

    };

    $scope.editEvent = function(event) {
        EventService.editEventModal(event, $scope.events);
    };

});