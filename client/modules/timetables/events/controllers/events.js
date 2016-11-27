eventsModule.controller('EventController', function($scope, EventService, parentTableId, $rootScope, ngToast) {

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

    $scope.createEvent = function(){
        $scope.newEvent.parentTable = parentTableId;

        // var date = new Date();
        // var d = date.getDate();
        // var m = date.getMonth();
        // var y = date.getFullYear();



        // var calendarDay =
        //
        // $scope.newEvent.start =  new Date(date.getFullYear(),date.getMonth(), calendarDay, $scope.newEvent.startHour, 0, 0);
        // $scope.newEvent.end =  new Date(date.getFullYear(), date.getMonth(), calendarDay, $scope.newEvent.endHour, 0, 0);



        EventService.addEvent($scope.newEvent).then(function(event){
            if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
            ngToast.create(event.title + ' created');
        });
    };

    $scope.updateEvent = function(){
        // foo
    }

});
  