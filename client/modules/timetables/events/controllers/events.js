eventsModule.controller('EventController', function($scope, EventService, event, events, $rootScope, ngToast) {

    $scope.event = {};

    $scope.event.title = event.title;
    $scope.event.location = event.location;
    $scope.event.start = event.start;
    $scope.event.end = event.end;
    $scope.event._id = event._id;
    $scope.event.parentTable=  event.parentTable;

    $scope.colours = [
        {name: "Red", value: "#982F2F"},
        {name: "Blue", value: "#337ab7"},
        {name: "Green", value: "#B6D37E"},
        {name: "Yellow", value: "#FFFF9A"}
    ];

    $scope.createEvent = function(){

         EventService.addEvent($scope.event).then(function(event){
            if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
            events.push(event);
            ngToast.create(event.title + ' created');
        });
    };

    $scope.update = function(){

        EventService.editEvent($scope.event).then(function(event){
            if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
            $.each(events, function(i){
                if(events[i]._id === event._id) {
                    events.splice(i,1);
                    return false;
                }
            });
            events.push(event);
            ngToast.create(event.title + ' updated');
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
    }


});
  