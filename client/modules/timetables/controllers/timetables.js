timetableModule.controller('TimetableController', function($scope, ngToast, $uibModal, $rootScope, $window, $routeParams, TimetableService, EventService, AuthenticationService, UserService) {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $rootScope.table = {};
    $scope.newTable = {};
    $scope.eventSources = [];
    $rootScope.events = [];

    $scope.codeUrl = "";

    $rootScope.days = [
        {name: 'Sunday', value: 0},
        {name: 'Monday', value: 1},
        {name: 'Tuesday', value:2},
        {name: 'Wednesday', value: 3},
        {name: 'Thursday', value: 4},
        {name: 'Friday', value: 5},
        {name: 'Saturday', value: 6}
    ];

    $rootScope.hours = [
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
        TimetableService.getTableById(id).then(function(table){
            $rootScope.table = table;
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

        $scope.newTable.hiddenDays = calculateHiddenDays($scope.newTable.startDay, $scope.newTable.endDay);

        console.log($scope.newTable);

        TimetableService.createTimetable($scope.newTable).then(function(table){
            var userID = AuthenticationService.getUserId();
            UserService.subscribeToTable(userID, table).then(function(){
                if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
                $window.location.href = '/#/timetables/' + table._id;
                ngToast.create('Timetable Created');
            })
        });
    };

    $scope.isOwner = function(){
        if($rootScope.table.owner) return AuthenticationService.getUserId() === $rootScope.table.owner._id;
    };


    $scope.initTable = function(){


        EventService.getEventsByTableId($rootScope.table._id).then(function(events){
            console.log(events);
            $rootScope.events = events;
            $scope.eventSources.push($rootScope.events);


            // EventService.getPersonalEvents(AuthenticationService.getUserId()).then(function(events){
            //     $scope.personalEvents = events;
            //
            //     /* event sources array*/
            //     $scope.eventSources.push($scope.personalEvents);

                // Calendar configuration
                $scope.uiConfig = {
                    calendar:{
                        theme: true,
                        columnFormat: {
                            week: 'ddd' // Only show day of the week names
                        },
                        header: false, // Hide buttons/titles
                        contentHeight: 'auto',
                        slotDuration: '00:20:00',
                        editable: $scope.isOwner(),
                        defaultView: "agendaWeek",
                        nowIndicator: true,
                        allDaySlot: false,
                        minTime: $rootScope.table.startHour + ':00:00',
                        maxTime: $rootScope.table.endHour + ':00:00',
                        scrollTime: $rootScope.table.startHour + ':00:00',
                        firstDay: $rootScope.table.startDay,
                        allDayText: '',
                        hiddenDays: $rootScope.table.hiddenDays,
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

        var day = moment().startOf('week').add('days', $rootScope.table.startDay +2);

        console.log(day);

        var event = {
                title: 'New Event',
                start:   day,
                parentTable: $rootScope.table._id,
                end: day,
                location: 'Room 1'
        };

        EventService.addEventModal(event, $scope.events);
    };

    $scope.editEvent = function(event) {
        if($scope.isOwner()) EventService.editEventModal(event, $scope.events);
    };

    $scope.editTimetable = function(){
        if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();

        $rootScope.modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/modules/timetables/views/timetable_edit.html',
            scope: $scope,
            size: 100
        });
    };

    $scope.delete = function(timetableID){
        TimetableService.delete(timetableID).then(function(){
            if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
            $window.location.href = '/';
            ngToast.create('Timetable deleted');
        })
    };

    $scope.update = function(){
        TimetableService.updateTimetable($scope.table).then(function(){
            if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
            ngToast.create('Timetable updated');
        })
    };

    $scope.subscribe = function(){
        var userID = AuthenticationService.getUserId();
        UserService.subscribeToTable(userID, $scope.table).then(function(){
            ngToast.create('Subscribed to ' + $scope.table.title);
        })
    };

    $scope.shareTable = function(){
        if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();

        $scope.codeUrl = "http://www.tableshare.com/#/timetables/" + $scope.table._id;

        $rootScope.modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/modules/timetables/views/timetable_share.html',
            scope: $scope, //passed current scope to the modal
            size: 100
        });
    };


});