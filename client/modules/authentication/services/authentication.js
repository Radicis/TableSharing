authenticationModule.service('AuthenticationService', function($http, $q, $window, $location, $uibModal) {

    this.openLogin = function () {

        console.log("Opening login modal");

        var modalInstance = $uibModal.open({
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

        modalInstance.result.then(function (token) {

        }, function () {
            console.log('Modal dismissed at: ' + new Date());
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

