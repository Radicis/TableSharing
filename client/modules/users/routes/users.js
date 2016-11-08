usersModule
    .config(function($routeProvider){
        $routeProvider.when('/users', {
            controller: 'UserController',
            templateUrl: '/modules/timetables/views/users.html'
        })
            .when('/users/:id', {
                controller: 'UserController',
                templateUrl: '/modules/timetables/views/user_detail.html'
            })
            .when('/users/add', {
                controller: 'UserController',
                templateUrl: '/modules/timetables/views/user_add.html'
            })
            .when('/users/edit/:id', {
                controller: 'UserController',
                templateUrl: '/modules/timetables/views/user_edit.html'
            })
    });