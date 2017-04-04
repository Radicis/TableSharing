'use strict';

/**
 * Handles authentication actions
 */
authenticationModule.controller('AuthenticationController', function($scope, $rootScope, $route, $window, $routeParams, TimetableService, AuthenticationService, UserService) {

    $rootScope.user = {};


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

        AuthenticationService.login(email, password).then(function(response){
            if(response.success) {
                var token = response.token;
                var userID = response.userID;
                AuthenticationService.saveToken(token, userID);
                // Close any modal instances that may be open
                if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
                $route.reload();
            }
            else{
                alert("Invalid Login");
            }
        });
    };

    $rootScope.getUser = function(){
        UserService.getProfileById(AuthenticationService.getUserId()).then(function(user){
            $rootScope.user = user;
        })
    };

    $scope.logout = function(){
        AuthenticationService.clearToken();
        $route.reload();
    };

    $scope.register = function(){
        // Close any modal instances that may be open
        if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();

        var email = $scope.formEmail;
        var password = $scope.formPassword;

        AuthenticationService.register(email, password).then(function(){
            AuthenticationService.openLogin();
        });
    };

    $scope.isLoggedIn = function(){
        return AuthenticationService.isLoggedIn();
    };


});