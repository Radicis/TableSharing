timetableModule.controller('TimetableController', function($scope, $routeParams, TimetableService, EventService) {

    $scope.config = {
        startDate: "2016-11-16",
        viewType: "Week",
        onEventClicked: function (args) {
            EventService.editEvent();
        },

        onEventMove: function (args) {
            var event = {
                id: args.e.id(),
                newStart: args.newStart.toString(),
                newEnd: args.newEnd.toString()
            };

            EventService.editEvent(event);
        },

        onEventResize: function (args) {
            var event = {
                id: args.e.id(),
                newStart: args.newStart.toString(),
                newEnd: args.newEnd.toString()
            };

            EventService.editEvent(event);
        }
    };


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
        });
    };

    $scope.getEventsByTableId = function(id){
        $scope.events = EventService.getEventsByTableId(id);
        // EventService.getEventsByTableId(id).then(function(events){
        //     $scope.events = events;
        // });
    };


    $scope.addEvent = function () {
        $scope.events.push(
            {
                start: new DayPilot.Date("2016-11-14T10:00:00"),
                end: new DayPilot.Date("2016-11-14T12:00:00"),
                id: DayPilot.guid(),
                text: "Simple Event 2"
            }
        );
        console.log("Events: " + $scope.events.length);
    };

});