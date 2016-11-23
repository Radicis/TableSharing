usersModule.controller('UserController', function($scope, UserService, $routeParams) {

    $scope.getUserById = function(){
        var id = $routeParams._id;
        UserService.getProfileById(id).then(function(user){
            $scope.user = user;
        });
    }

});