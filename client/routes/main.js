angular.module('MainRoutes', [])
    .config(function($routeProvider){
        $routeProvider.when('/', {
            controller: 'HomeController',
            templateUrl: 'views/home.html'
        })
    });