var tableShare = angular.module('TableShare', [
    'ngRoute',
    'ui.bootstrap',
    'ngAnimate',
    'Timetables',
    'Authentication',
    'Users'
]
)
//
// .config(['$httpProvider', function($httpProvider) {
//     $httpProvider.interceptors.push('APIInterceptor');
// }])

    ;

var routeForUnauthorizedAccess = "/unauthorised";

