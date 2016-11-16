eventsModule.service('EventService', function($http, $q, $uibModal) {

    this.getEventsByTableId = function (tableId) {
        // var def = $q.defer();
        // $http.get('/api/events/' + tableId).success(function (response) {
        //     def.resolve(response);
        // }).error(function (error) {
        //     console.log("Error: " + error);
        //     def.reject(null);
        // });
        // return def.promise;

        var events = [
            {
                start: new DayPilot.Date("2016-11-16T10:00:00"),
                end: new DayPilot.Date("2016-11-16T11:00:00"),
                id: DayPilot.guid(),
                text: "First Event"
            }
     ];

        return events;

    };

    this.editEvent = function (event) {

        console.log("Opening event edit modal");

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/modules/timetables/events/views/edit.html',
            controller: 'EventController',
            size: 100,
            resolve: {
                items: function () {
                    return null;
                }
            }
        });

        modalInstance.result.then(function () {
            console.log("Modal did stuff");
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };

    this.addEvent = function(event){

        $http.post('/api/events', event).success(function (response) {
            // When this request succeeds resolve the promise
            def.resolve(response);
        }).error(function (error) {
            // If the http request fails then log an error to the console
            console.log("Error: " + error);
            // Reject the promise so it does not return incorrect data to the controller
            def.reject(null);
        });
    };

    this.editEvent = function(event){

        $http.put('/api/events', event).success(function (response) {
            // When this request succeeds resolve the promise
            def.resolve(response);
        }).error(function (error) {
            // If the http request fails then log an error to the console
            console.log("Error: " + error);
            // Reject the promise so it does not return incorrect data to the controller
            def.reject(null);
        });
    };

    this.deleteEvent = function(event){

        $http.delete('/api/events', event).success(function (response) {
            // When this request succeeds resolve the promise
            def.resolve(response);
        }).error(function (error) {
            // If the http request fails then log an error to the console
            console.log("Error: " + error);
            // Reject the promise so it does not return incorrect data to the controller
            def.reject(null);
        });
    };

});