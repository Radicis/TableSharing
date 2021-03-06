'use strict';

timetableModule
    .controller('TimetableController', function ($scope, ngToast, $route, $uibModal, $rootScope, $window, $routeParams, TimetableService, EventService, AuthenticationService, UserService, DAYS, HOURS) {

    // Initialise variables
    $rootScope.table = {};
    $scope.newTable = {};
    $scope.eventSources = [];
    $rootScope.events = [];
    $scope.codeUrl = "";

    // Day range for form display
    $rootScope.days = DAYS;

    // Hour range for form display
    $rootScope.hours = HOURS;

    $scope.getAllTables = function () {
        TimetableService.getAll().then(function (tables) {
            $scope.tables = tables;
        });
    };

    $scope.getTable = function () {
        var id = $routeParams._id;
        TimetableService.getTableById(id).then(function (table) {
            $rootScope.table = table;
            $scope.initTable();
        });
    };

    // Calculates which days are hidden based on selected start and end days
    var calculateHiddenDays = function (startDay, endDay) {
        var allDays = [0, 1, 2, 3, 4, 5, 6];
        var hiddenDays = [];

        for (var i = 0; i < allDays.length; i++) {
            if (allDays[i] < startDay || allDays[i] > endDay) {
                hiddenDays.push(allDays[i]);
            }
        }
        return hiddenDays.length0 = 0 ? null : hiddenDays;
    };

    $scope.createTimetable = function () {

        // Dismiss any active modals
        if ($rootScope.modalInstance) $rootScope.modalInstance.dismiss();

        $scope.newTable.hiddenDays = calculateHiddenDays($scope.newTable.startDay, $scope.newTable.endDay);

        TimetableService.createTimetable($scope.newTable).then(function (table) {
            var userID = AuthenticationService.getUserId();
            UserService.subscribeToTable(userID, table).then(function () {
                // Redirect to newly created table view
                $window.location.href = '/#/timetables/' + table._id;
                // update the user object to refresh the subscribed timetables in the view
                $rootScope.getUser();
                ngToast.create('Timetable Created');
            })
        });
    };

    // Determines if the logged in user is the owner of the table in scope
    $scope.isOwner = function () {
        if ($rootScope.table.owner) return AuthenticationService.getUserId() === $rootScope.table.owner._id;
    };


    // Initialises timetable
    $scope.initTable = function () {

        EventService.getEventsByTableId($rootScope.table._id).then(function (events) {
            $rootScope.events = events;
            $scope.eventSources.push($rootScope.events);
            // Calendar configuration
            $scope.uiConfig = {
                calendar: {
                    theme: true,
                    columnFormat: {
                        week: 'ddd' // Only show day of the week names
                    },
                    header: false, // Hide buttons/titles
                    contentHeight: 'auto',
                    slotDuration: '00:20:00',
                    editable: $scope.isOwner(),
                    defaultView: "agendaWeek",
                    nowIndicator: true,
                    allDaySlot: false,
                    minTime: $rootScope.table.startHour + ':00:00',
                    maxTime: $rootScope.table.endHour + ':00:00',
                    scrollTime: $rootScope.table.startHour + ':00:00',
                    firstDay: $rootScope.table.startDay,
                    allDayText: '',
                    hiddenDays: $rootScope.table.hiddenDays,
                    eventClick: $scope.editEvent,
                    eventDrop: $scope.move,
                    eventResize: $scope.resize
                }
            };
        });
    };

    // Event move action
    $scope.move = function (event) {
        event.dow = [event.start._d.getDay()];
        EventService.editEventTime(event).then(function (event) {
            ngToast.create(event.title + ' updated');
        });
    };

    // Event resize action
    $scope.resize = function (event) {
        EventService.editEventTime(event).then(function (event) {
            ngToast.create(event.title + ' updated');
        });
    };

    $scope.addEvent = function () {

        // Calculate a displayed day/time and place the new event
        var day = moment().startOf('week').add('days', $rootScope.table.startDay).add($rootScope.table.startHour, 'hours');

        var event = {
            title: 'New Event',
            start: day,
            parentTable: $rootScope.table._id,
            end: day,
            location: 'Room 1',
            dow: $rootScope.table.startDay
        };
        EventService.addEventModal(event, $scope.events);
    };


    $scope.editEvent = function (event) {
        // Establish of logged in user is the event owner then display edit modal
        if ($scope.isOwner()) EventService.editEventModal(event, $rootScope.events);
    };

    $scope.editTimetable = function () {
        // Close any modal instances that may be open
        if($rootScope.modalInstance) $rootScope.modalInstance.dismiss();


        $rootScope.modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/modules/timetables/views/timetable_edit.html',
            scope: $scope,
            size: 100
        });
    };

    $scope.delete = function (timetableID) {
        TimetableService.delete(timetableID).then(function () {
            if ($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
            $window.location.href = '/';
            ngToast.create('Timetable deleted');
        })
    };

    $scope.update = function () {
        $rootScope.table.hiddenDays = calculateHiddenDays($rootScope.table.startDay, $rootScope.table.endDay);
        TimetableService.updateTimetable($rootScope.table).then(function () {
            if ($rootScope.modalInstance) $rootScope.modalInstance.dismiss();
            $route.reload();
            ngToast.create('Timetable updated');
        })
    };

    // Subscribed a user form a table
    $scope.subscribe = function () {
        var userID = AuthenticationService.getUserId();
        UserService.subscribeToTable(userID, $rootScope.table).then(function () {
            $route.reload();
            $rootScope.getUser();
            ngToast.create('Subscribed to ' + $rootScope.table.title);
        })
    };

    // Unsubscribes a user from a table
    $scope.unSubscribe = function () {
        var userID = AuthenticationService.getUserId();
        UserService.unSubscribeToTable(userID, $rootScope.table._id).then(function () {
            $route.reload();
            $rootScope.getUser();
            ngToast.create('UnSubscribed to ' + $rootScope.table.title);
        })
    };

    // Determines if the logged in user is subscribed to the table in scope
    $scope.isSubscribed = function () {
        var found = false;
        if ($scope.user) {
            $.each($scope.user.subscribed, function (index, value) {
                if (value._id == $rootScope.table._id) found = true;
            });
            return found;
        }
        return false;
    };

    $scope.shareTable = function () {
        if ($rootScope.modalInstance) $rootScope.modalInstance.dismiss();

        $scope.codeUrl = "http://www.tableshare.com/#/timetables/" + $rootScope.table._id;

        $rootScope.modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/modules/timetables/views/timetable_share.html',
            scope: $scope, //passed current scope to the modal
            size: 100
        });
    };


});