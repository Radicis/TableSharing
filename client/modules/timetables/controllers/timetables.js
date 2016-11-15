timetableModule.controller('TimetableController', function($scope, $routeParams, TimetableService, AuthenticationService) {

    $scope.calendarView = 'week';
    $scope.viewDate = Date.now();
    $scope.calendarTitle = "Test Table 1";

    // $scope.config = {
    //     startDate: "2016-09-01",
    //     viewType: "Week",
    //     onEventClicked: function(args) {
    //         var modal = new DayPilot.Modal({
    //             onClosed: function (args) {
    //                 if (args.result) {  // args.result is empty when modal is closed without submitting
    //                     loadEvents();
    //                 }
    //             }
    //         });
    //         modal.showUrl("timetables");
    //     }
    // };

    // $scope.events = [
    //     {
    //         start: new DayPilot.Date("2016-09-01T10:00:00"),
    //         end: new DayPilot.Date("2016-09-01T14:00:00"),
    //         id: DayPilot.guid(),
    //         text: "First Event"
    //     }
    // ];



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
        });
    };

    var actions = [{
        label: '<i class=\'glyphicon glyphicon-pencil\'></i>',
        onClick: function(args) {
            alert.show('Edited', args.calendarEvent);
        }
    }, {
        label: '<i class=\'glyphicon glyphicon-remove\'></i>',
        onClick: function(args) {
            alert.show('Deleted', args.calendarEvent);
        }
    }];

    $scope.events = [
        {
            title: 'My event title', // The title of the event
            startsAt: moment().startOf('week').add(1, 'days').add(10, 'hours').toDate(), // A javascript date object for when the event starts
            //endsAt: new Date(2016,11,16,1), // Optional - a javascript date object for when the event ends
            color: { // can also be calendarConfig.colorTypes.warning for shortcuts to the deprecated event types
                primary: '#e3bc08', // the primary event color (should be darker than secondary)
                secondary: '#fdf1ba' // the secondary event color (should be lighter than primary)
            },
            actions: actions,
            draggable: true, //Allow an event to be dragged and dropped
            resizable: true, //Allow an event to be resizable
            incrementsBadgeTotal: true, //If set to false then will not count towards the badge total amount on the month and year view
            recursOn: 'year', // If set the event will recur on the given period. Valid values are year or month
            cssClass: 'a-css-class-name', //A CSS class (or more, just separate with spaces) that will be added to the event when it is displayed on each view. Useful for marking an event as selected / active etc
            allDay: false // set to true to display the event as an all day event on the day view
        }
    ];

    $scope.eventClicked = function(calendarEvent){
        console.log("clicked: " + calendarEvent.title);
    }

});