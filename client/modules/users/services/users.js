'use strict';

usersModule.service('UserService', function($http, $q) {

    // Returns the users profile
    this.getProfileById = function(id){
        var def = $q.defer();
        $http.get('/api/users/' + id).success(function (user) {
            def.resolve(user);
        }).error(function (error) {
            console.log("Error: " + error);
            def.reject(null);
        });
        return def.promise;
    };

    // Adds a table to the users subscriptions
    this.subscribeToTable = function(userID, table){

        var def = $q.defer();
        $http.post('/api/users/subscribe', {'userID': userID, 'table':table}).success(function (response) {
            def.resolve(response._id);
        }).error(function (error) {
            console.log("Error: " + error);
            def.reject(null);
        });
        return def.promise;
    };

    // Removed a table from the users subscriptions
    this.unSubscribeToTable = function(userID, tableID){

        var def = $q.defer();
        $http.post('/api/users/unsubscribe', {'userID': userID, 'tableID':tableID}).success(function (response) {
            def.resolve(response._id);
        }).error(function (error) {
            console.log("Error: " + error);
            def.reject(null);
        });
        return def.promise;
    };

});