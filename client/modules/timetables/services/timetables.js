timetableModule.service('TimetableService', function($http, $q, $uibModal, AuthenticationService) {

    this.getAll = function () {
        // Initialize the defferred promise variable
        var def = $q.defer();
        // Make the http request from the node API
        $http.get('/api/timetables').success(function (response) {
            // When this request succeeds resolve the promise
            def.resolve(response);
        }).error(function (error) {
            // If the http request fails then log an error to the console
            console.log("Error: " + error);
            // Reject the promise so it does not return incorrect data to the controller
            def.reject(null);
        });
        // Return the promise object which tells the controller
        // to expect data once the http request completes
        return def.promise;
    };

    this.getTableById = function (id) {
        var def = $q.defer();
        $http.get('/api/timetables/' + id).success(function (response) {
            def.resolve(response);
        }).error(function (error) {
            console.log("Error: " + error);
            def.reject(null);
        });
        return def.promise;
    };

    this.addTimetableModal = function () {

        console.log("Opening timetable add modal");

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/modules/timetables/views/timetable_add.html',
            controller: 'TimetableController',
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

    this.createTimetable = function(timetable){

        timetable.owner = AuthenticationService.getUserId();

        var def = $q.defer();
        $http.post('/api/timetables/add', timetable).success(function (response) {
            def.resolve(response);
        }).error(function (error) {
            console.log("Error: " + error);
            def.reject(null);
        });
        return def.promise;
    }





});