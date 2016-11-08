timetableModule
    .config(function($routeProvider){
    $routeProvider.when('/timetables', {
            controller: 'TimetableController',
            templateUrl: '/modules/timetables/views/timetables.html'
        })
        .when('/timetables/:_id', {
            controller: 'TimetableController',
            templateUrl: '/modules/timetables/views/timetable_detail.html'
        })
        .when('/timetables/add', {
            controller: 'TimetableController',
            templateUrl: '/modules/timetables/views/timetable_add.html'
        })
        .when('/timetables/edit/:id', {
            controller: 'TimetableController',
            templateUrl: '/modules/timetables/views/timetable_edit.html'
        })
});