eventsModule.controller('EventController', function($scope,$rootScope, EventService, event, events,ngToast) {

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
            if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
            $rootScope.events.push(event);
            ngToast.create(event.title + ' created');
        });
    };

    $scope.update = function(){

        EventService.editEvent($scope.event).then(function(event){
            if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
            $.each($rootScope.events, function(i){
                if($rootScope.events[i]._id === $scope.event._id) {
                    $rootScope.events.splice(i,1);
                    $rootScope.events.push(event);
                    ngToast.create(event.title + ' updated');
                    return false;
                }
            });
        });
    };

    $scope.delete = function(eventID){
        EventService.deleteEvent(eventID).then(function(){
            if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
            $.each(events, function(i){
                if(events[i]._id === event._id) {
                    events.splice(i,1);
                    return false;
                }
            });
            ngToast.create(event.title + ' deleted');
        })
    };

});
  