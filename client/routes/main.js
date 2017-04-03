'use strict';

tableShare
    .config(function($routeProvider){
        $routeProvider.when('/', {
            templateUrl: 'views/home.html'
        })
            .when('/unauthorised', {
                templateUrl: 'views/unAuth.html'
            });
    });