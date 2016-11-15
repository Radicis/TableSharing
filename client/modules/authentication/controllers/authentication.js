authenticationModule.controller('AuthenticationController', function($scope, $uibModal,  $window, $routeParams, TimetableService, AuthenticationService) {

    $scope.openLogin = function (size) {

        console.log("Opening login modal");

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modules/authentication/views/login.html',
            controller: 'AuthenticationController',
            size: size,
            resolve: {
                items: function () {
                    return $scope.items;
                }
            }
        });

        modalInstance.result.then(function (token) {

        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
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