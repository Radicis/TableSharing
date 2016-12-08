authenticationModule.service('AuthenticationService', function($rootScope, $cookies, $http, $q, $window, $location, $uibModal) {

    // Displays the login modal
    this.openLogin = function () {
        // Close any modal instances that may be open
        if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();

        $rootScope.modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modules/authentication/views/login.html',
            controller: 'AuthenticationController',
            size: 100
        });
    };


    // Store the provided token string in local storage
    this.saveToken = function(token, userID) {
        $window.localStorage['jwtToken'] = token;
        $window.localStorage['userID'] = userID;
    };


    // Return the stored token or boolean false
    this.getToken = function(){
        if($window.localStorage['jwtToken'] === 'undefined'){
            return false;
        }
        return $window.localStorage['jwtToken'];
    };

    // Return the stored userID or boolean false
    this.getUserId = function(){
        if($window.localStorage['userID'] === 'undefined'){
            return false;
        }
        return $window.localStorage['userID'];
    };

    // Removes the saved token
    this.clearToken = function(){
        $window.localStorage.clear();
    };

    // Opens the register modal
    this.openRegister = function () {
        // Close any modal instances that may be open
        if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();

        $rootScope.modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modules/authentication/views/register.html',
            controller: 'AuthenticationController',
            size: 100
        });
    };


    this.register = function(email, password){
        var def = $q.defer();
        $http.post('/api/auth/register', {'email': email, 'password':password}).success(function (response) {
            def.resolve(response);
        }).error(function (error) {
            console.log(error);
            def.reject(null);
        });
        return def.promise;
    };

    this.login = function (email, password) {
        var def = $q.defer();
        $http.post('/api/auth/authenticate', {'email': email, 'password':password}).success(function (response) {
            def.resolve(response);
        }).error(function (error) {
            console.log("Error: " + error);
            def.reject(null);
        });
        return def.promise;
    };

    // Determines if the user is logged in by checking for a token
    this.isLoggedIn = function(){
        return this.getToken();
    };

});

