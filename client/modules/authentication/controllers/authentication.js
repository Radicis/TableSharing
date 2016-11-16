authenticationModule.controller('AuthenticationController', function($scope, $window, $routeParams, TimetableService, AuthenticationService) {

    $scope.openLogin = function () {

        AuthenticationService.openLogin();

    };


    $scope.login = function(){

        var username = $scope.formUsername;
        var password = $scope.formPassword;

        AuthenticationService.login(username, password).then(function(token){
            $scope.token = token;
            console.log("Got token: " + token);
            AuthenticationService.saveToken(token);
            return token;
        });
    };

});