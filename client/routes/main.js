tableShare
    .config(function($routeProvider){
        $routeProvider.when('/', {
            controller: 'HomeController',
            templateUrl: 'views/home.html'
        });
    });