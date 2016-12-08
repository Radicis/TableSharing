tableShare
    .config(function($routeProvider){
        $routeProvider.when('/', {
            controller: 'HomeController',
            templateUrl: 'views/home.html'
        })
            .when('/unauthorised', {
                controller: 'HomeController',
                templateUrl: 'views/unAuth.html'
            });
    });