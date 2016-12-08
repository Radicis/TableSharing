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


    this.editEventModal = function (event, events) {

        if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();

        $rootScope.modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/modules/timetables/events/views/edit.html',
            controller: 'EventController',
            size: 100,
            resolve: {
                event: function(){
                    return event;
                },
                events: function(){
                    return events;
                }
            }
        });
    };

    this.addEventModal = function (event, events) {
        if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();

        $rootScope.modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/modules/timetables/events/views/add.html',
            controller: 'EventController',
            size: 100,
            resolve: {
                event: function(){
                    return event;
                },
                events: function(){
                    return events;
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
            console.log("Error: " + error.message);
            // Reject the promise so it does not return incorrect data to the controller
            def.reject(null);
        });
        return def.promise;
    };

    this.editEventTime = function(event){
        var modifyEvent = {
            _id: event._id,
            start: event.start,
            end: event.end
        };

        var def = $q.defer();
        $http.put('/api/events/move', modifyEvent).success(function (response) {
            // When this request succeeds resolve the promise
            def.resolve(response);
        }).error(function (error) {
            // If the http request fails then log an error to the console
            console.log("Error: " + error.message);
            // Reject the promise so it does not return incorrect data to the controller
            def.reject(null);
        });
        return def.promise;
    };

    this.editEvent = function(event){
        var modifyEvent = {
            _id: event._id,
            title: event.title,
            location: event.location,
            colour: event.colour
        };

        var def = $q.defer();
        $http.put('/api/events/', modifyEvent).success(function (response) {
            // When this request succeeds resolve the promise
            def.resolve(response);
        }).error(function (error) {
            // If the http request fails then log an error to the console
            console.log("Error: " + error.message);
            // Reject the promise so it does not return incorrect data to the controller
            def.reject(null);
        });
        return def.promise;
    };

    this.deleteEvent = function(eventID){
        var def = $q.defer();
        $http.delete('/api/events/delete/' + eventID).success(function (response) {
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