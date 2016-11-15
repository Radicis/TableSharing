var tableShare = angular.module('TableShare', [
    'ngRoute',
    'ui.bootstrap',
    'ngAnimate',
    'mwl.calendar',
        //'daypilot',
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

