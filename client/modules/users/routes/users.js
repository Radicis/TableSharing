usersModule
    .config(function($routeProvider){
        $routeProvider.when('/users', {
            controller: 'UserController',
            templateUrl: '/modules/users/views/users.html',
            resolve: {
                permission: function(AuthenticationService, $route) {
                    console.log("authing");
                    return AuthenticationService.checkPermissions();
                }
            }
        })
            .when('/users/:id', {
                controller: 'UserController',
                templateUrl: '/modules/users/views/user_detail.html'
            })
            .when('/users/add', {
                controller: 'UserController',
                templateUrl: '/modules/users/views/user_add.html'
            })
            .when('/users/edit/:id', {
                controller: 'UserController',
                templateUrl: '/modules/users/views/user_edit.html'
            })
    });