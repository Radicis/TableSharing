eventsModule.service('EventService', function($http, $q, $uibModal, $rootScope) {

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    this.getEventsByTableId = function (tableId) {

        var def = $q.defer();

        console.log("Getting events for tableId: " + tableId);

        $http.get('/api/events/' + tableId).success(function (response) {
            def.resolve(response);
        }).error(function (error) {
            console.log("Error: " + error);
            def.reject(null);
        });

        return def.promise;

    };

    this.editEventModal = function (event) {

        if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
        $rootScope.modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/modules/timetables/events/views/edit.html',
            controller: 'EventController',
            size: 100,
            resolve: {
                event: function(){
                    return event;
                }
            }
        });
    };

    this.addEventModal = function (parentTableId) {
        if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();

        $rootScope.modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/modules/timetables/events/views/add.html',
            controller: 'EventController',
            size: 100,
            resolve: {
                parentTableId: function(){
                    return parentTableId;
                }
            }
        });
    };


    this.addEvent = function(event){
        var def = $q.defer();
        $http.post('/api/events', event).success(function (response) {
            // When this request succeeds resolve the promise
            def.resolve(response);
        }).error(function (error) {
            // If the http request fails then log an error to the console
            console.log("Error: " + error);
            // Reject the promise so it does not return incorrect data to the controller
            def.reject(null);
        });
        return def.promise;
    };

    this.editEvent = function(event){
        console.log("Updating event in service..");
        var modifyEvent = {
            _id: event._id,
            start: event.start,
            end: event.end,
        };
        // event.start = event.start.toDate();
        // event.end = event.end.toDate();
        // event.source = null;
        // console.log(event);
        var def = $q.defer();
        $http.put('/api/events', modifyEvent).success(function (response) {
            // When this request succeeds resolve the promise
            def.resolve(response);
        }).error(function (error) {
            // If the http request fails then log an error to the console
            console.log("Error: " + error);
            // Reject the promise so it does not return incorrect data to the controller
            def.reject(null);
        });
        return def.promise;
    };

    this.deleteEvent = function(event){
        var def = $q.defer();
        $http.delete('/api/events', event).success(function (response) {
            // When this request succeeds resolve the promise
            def.resolve(response);
        }).error(function (error) {
            // If the http request fails then log an error to the console
            console.log("Error: " + error);
            // Reject the promise so it does not return incorrect data to the controller
            def.reject(null);
        });
        return def.promise;
    };

});