var tableShare = angular.module('TableShare', [
    'ngRoute',
    'ui.bootstrap',
    'ngAnimate',
    'ui.calendar',
    'Timetables',
    'Authentication',
    'Users',
        'ngToast',
        'ja.qr',
    'ngCookies'
]);


tableShare.run(function ($http, AuthenticationService) {
    console.log(AuthenticationService.getToken());
    $http.defaults.headers.post['x-access-token'] = AuthenticationService.getToken();
    $http.defaults.headers.put['x-access-token'] = AuthenticationService.getToken();
    $http.defaults.headers.delete = { 'x-access-token' :AuthenticationService.getToken() };
    $http.defaults.headers.get = { 'x-access-token' :AuthenticationService.getToken() };
});

var routeForUnauthorizedAccess = "/unauthorised";



