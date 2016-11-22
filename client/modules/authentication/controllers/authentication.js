authenticationModule.controller('AuthenticationController', function($scope, $window, $routeParams, TimetableService, AuthenticationService) {

    $scope.openLogin = function () {
        AuthenticationService.openLogin();
    };

    $scope.openRegister = function () {
        AuthenticationService.openRegister();
    };

    $scope.addTable = function(){
        TimetableService.addTimetableModal();
    };

    $scope.login = function(){

        var email = $scope.formEmail;
        var password = $scope.formPassword;

        AuthenticationService.login(email, password).then(function(token){
            $scope.token = token;
            console.log("Got token: " + token);
            AuthenticationService.saveToken(token);
            AuthenticationService.setLoggedIn(true);
            $window.location.href = '/';
        });
    };

    $scope.logout = function(){
      AuthenticationService.clearToken();
        $window.location.href = '/';
    };

    $scope.register = function(){

        var email = $scope.formEmail;
        var password = $scope.formPassword;

        AuthenticationService.register(email, password).then(function(response){
            AuthenticationService.login(response.email, response.password).then(function(){
                $window.location.href = '/';
            });
        });
    };

    $scope.isLoggedIn = function(){
        return AuthenticationService.isLoggedIn();
    };

});