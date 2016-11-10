authenticationModule.controller('AuthenticationController', function($scope,  $window, $routeParams, TimetableService, AuthenticationService) {

    $scope.foo = function(){

        var username = $scope.formUsername;
        var password = $scope.formPassword;

        AuthenticationService.login(username, password).then(function(token){
            $scope.token = token;
            console.log("Got token: " + token);
            console.log("Saving token..");
            AuthenticationService.saveToken(token);
            console.log('Getting token: ' + AuthenticationService.getToken());
        });
    };


});