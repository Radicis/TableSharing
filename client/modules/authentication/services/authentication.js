authenticationModule.service('AuthenticationService', function($rootScope, $http, $q, $window, $location, $uibModal) {

    this.openLogin = function () {

        console.log("Opening login modal");

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
            $rootScope.modalInstance.dismiss();
        }, function () {
            console.log('Login Modal dismissed');
        });
    };

    this.openRegister = function () {
        $rootScope.modalInstance.dismiss();
        console.log("Opening register modal");

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

        $rootScope.modalInstance.result.then(function (token) {
            $rootScope.modalInstance.dismiss();
        }, function () {
            console.log('Register Modal dismissed');
        });
    };

    this.login = function (username, password) {
        console.log("Trying login...");
        var def = $q.defer();
        $http.post('/api/auth/authenticate', {'username': username, 'password':password}).success(function (response) {
            def.resolve(response.token);
        }).error(function (error) {
            console.log("Error: " + error);
            def.reject(null);
        });
        return def.promise;
    };

    // Store the provided token string in local storage
    this.saveToken = function(token) {
        $window.localStorage['jwtToken'] = token;
    };

    // Return the stored token or boolean false
    this.getToken = function(){
        console.log("Getting token..");
        if($window.localStorage['jwtToken'] === 'undefined'){
            return false;
        }
        return $window.localStorage['jwtToken'];
    };

    // Middlewaye to chekc users permissions on a route
    this.checkPermissions = function(){
        if(this.getToken()){
            return true;
        }
        $location.path(routeForUnauthorizedAccess);
    }

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

