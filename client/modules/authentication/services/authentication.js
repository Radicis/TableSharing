authenticationModule.service('AuthenticationService', function($rootScope, $http, $q, $window, $location, $uibModal) {

    this.openLogin = function () {

        if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();

        $rootScope.modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modules/authentication/views/login.html',
            controller: 'AuthenticationController',
            size: 100,
            resolve: {
                items: function () {
                    return null;
                }
            }
        });

        $rootScope.modalInstance.result.then(function (token) {
            this.saveToken(token);
            $rootScope.modalInstance.dismiss();
        }, function () {
            console.log('Login Modal dismissed');
        });
    };

    // Store the provided token string in local storage
    this.saveToken = function(token) {
        $window.localStorage['jwtToken'] = token;
    };

    // Return the stored token or boolean false
    this.getToken = function(){
        if($window.localStorage['jwtToken'] === 'undefined'){
            return false;
        }
        return $window.localStorage['jwtToken'];
    };

    this.clearToken = function(){
        $window.localStorage.clear();
    };

    this.openRegister = function () {
        $rootScope.modalInstance.dismiss();

        $rootScope.modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modules/authentication/views/register.html',
            controller: 'AuthenticationController',
            size: 100,
            resolve: {
                items: function () {
                    return null;
                }
            }
        });

        $rootScope.modalInstance.result.then(function () {
            $rootScope.modalInstance.dismiss();
        }, function () {
            console.log('Register Modal dismissed');
        });
    };

    this.register = function(email, password){
        console.log("Registering user...");
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
        console.log("Trying login...");
        var def = $q.defer();
        $http.post('/api/auth/authenticate', {'email': email, 'password':password}).success(function (response) {
            def.resolve(response.token);
        }).error(function (error) {
            console.log("Error: " + error);
            def.reject(null);
        });
        return def.promise;
    };

    // Middleware to check users permissions on a route
    this.checkPermissions = function(){
        if(this.getToken()){
            return true;
        }
        $location.path(routeForUnauthorizedAccess);
    };

    this.isLoggedIn = function(){
        return this.getToken();
    };

});

authenticationModule.service('APIInterceptor', function($rootScope, AuthenticationService) {
    var service = this;
    service.request = function(config) {
        var accessToken = AuthenticationService.getToken();
        if (accessToken) {
            config.headers.authorization = accessToken;
        }
        return config;
    };
    service.responseError = function(response) {
        return response;
    };
});

