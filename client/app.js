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
]);


tableShare.run(function ($http, AuthenticationService) {
    $http.defaults.headers.post['x-access-token'] = AuthenticationService.getToken();
});

var routeForUnauthorizedAccess = "/unauthorised";



