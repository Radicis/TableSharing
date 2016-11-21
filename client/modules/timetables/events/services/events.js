eventsModule.service('EventService', function($http, $q, $uibModal) {

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    this.getEventsByTableId = function (tableId) {
        // var def = $q.defer();
        // $http.get('/api/events/' + tableId).success(function (response) {
        //     def.resolve(response);
        // }).error(function (error) {
        //     console.log("Error: " + error);
        //     def.reject(null);
        // });
        // return def.promise;
        //return events;
        /* event source that contains custom events on the scope */
        var events = [
            {title: 'All Day Event',start: new Date(y, m, 1)},
            {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
            {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
            {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
            {title: 'Birthday Party',start: new Date(y, m, d + 1, 10, 0),end: new Date(y, m, d + 1, 10, 30),allDay: false}
        ];

        return events;

    };

    this.editEventModal = function (event) {

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

    this.addEventModal = function (event) {

        console.log("Opening event add modal");

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/modules/timetables/events/views/add.html',
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
        var def = $q.defer();
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
    };

});