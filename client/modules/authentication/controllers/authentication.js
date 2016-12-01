authenticationModule.controller('AuthenticationController', function($scope, $rootScope, $window, $routeParams, TimetableService, AuthenticationService, UserService) {

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
            var token = response.token;
            var userID = response.userID;
            console.log("Got token: " + token + " and userID: " + userID);
            AuthenticationService.saveToken(token, userID);
        });
    };

    $scope.getUser = function(){
        UserService.getProfileById(AuthenticationService.getUserId()).then(function(user){
            $scope.user = user;
        })
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

    var trigger = $('.hamburger'),
        overlay = $('.overlay'),
        isClosed = false;

    trigger.click(function () {
        hamburger_cross();
    });

    $scope.closeMenu = function(){
        if(isClosed) {
            overlay.hide();
            trigger.removeClass('is-open');
            trigger.addClass('is-closed');
            isClosed = false;
        }
    };

    function hamburger_cross() {

        if (isClosed == true) {
            $scope.closeMenu();
        } else {
            overlay.show();
            trigger.removeClass('is-closed');
            trigger.addClass('is-open');
            isClosed = true;
        }
    }

    $('[data-toggle="offcanvas"]').click(function () {
        $('#wrapper').toggleClass('toggled');
    });




});