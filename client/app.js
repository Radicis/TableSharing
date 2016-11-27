var tableShare = angular.module('TableShare', [
    'ngRoute',
    'ui.bootstrap',
    'ngAnimate',
    'ui.calendar',
    'Timetables',
    'Authentication',
    'Users',
        'ngToast'
]
)
//
// .config(['$httpProvider', function($httpProvider) {
//     $httpProvider.interceptors.push('APIInterceptor');
// }])

    ;

var routeForUnauthorizedAccess = "/unauthorised";



