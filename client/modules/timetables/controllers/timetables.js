timetableModule.controller('TimetableController', function($scope, $routeParams, TimetableService, EventService) {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.eventSources = [];

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
            console.log($scope.events);
            $scope.initTable();
        });
    };

    $scope.getEventsByTableId = function(id){
        $scope.events = EventService.getEventsByTableId(id);
        // EventService.getEventsByTableId(id).then(function(events){
        //     $scope.events = events;
        // });
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
                minTime: '09:00:00',
                maxTime: '18:00:00',
                scrollTime: '09:00:00',
                firstDay: 1,
                allDayText: '',
                hiddenDays: [0, 6],
                header:{
                    left: 'agendaWeek, month',
                    center: '',
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
        $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
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