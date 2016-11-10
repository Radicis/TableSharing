authenticationModule
    .config(function($routeProvider){
        $routeProvider.when('/login', {
            controller: 'AuthenticationController',
            templateUrl: '/modules/authentication/views/login.html'
        });
    });