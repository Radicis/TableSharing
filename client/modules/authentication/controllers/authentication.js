authenticationModule.controller('AuthenticationController', function($scope, $rootScope, $window, $routeParams, TimetableService, AuthenticationService) {

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

        if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();

        var email = $scope.formEmail;
        var password = $scope.formPassword;

        AuthenticationService.login(email, password).then(function(response){
            console.log(response);
            var token = response.token;
            var userID = response.userID;
            console.log("Got token: " + token + " and userID: " + userID);
            AuthenticationService.saveToken(token, userID);
        });
    };

    $scope.logout = function(){
      AuthenticationService.clearToken();
    };

    $scope.register = function(){

        if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();

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