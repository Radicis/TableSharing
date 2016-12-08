eventsModule.controller('EventController', function($scope,$rootScope, $route, EventService, event, events,ngToast) {

    $scope.event = {};

    $scope.event.title = event.title;
    $scope.event.location = event.location;
    $scope.event.start = event.start;
    $scope.event.end = event.end;
    $scope.event._id = event._id;
    $scope.event.parentTable=  event.parentTable;
    $scope.event.colour = event.colour;


    $scope.colours = [
        {name: "Red", value: "red"},
        {name: "Blue", value: "blue"},
        {name: "Green", value: "green"},
        {name: "Yellow", value: "yellow"}
    ];

    $scope.createEvent = function(){

        EventService.addEvent($scope.event).then(function(event){
            // Dismiss any active modals
            if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
            $rootScope.events.push(event);
            $route.reload();
            ngToast.create(event.title + ' created');
        });
    };

    $scope.update = function(){

        EventService.editEvent($scope.event).then(function(event){
            // Dismiss any active modals
            if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
            // Iterate through all events, remove the edited event and then add it to the list again to refresh
            $.each($rootScope.events, function(i){
                if($rootScope.events[i]._id === $scope.event._id) {
                    $rootScope.events.splice(i,1);
                    $rootScope.events.push(event);
                    ngToast.create(event.title + ' updated');
                    $route.reload();
                }
            });
        });
    };

    $scope.delete = function(eventID){
        EventService.deleteEvent(eventID).then(function(){
            if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
            // Remove delete event from list
            $.each(events, function(i){
                if(events[i]._id === event._id) {
                    events.splice(i,1);
                }
            });
            ngToast.create(event.title + ' deleted');
        })
    };

});
  