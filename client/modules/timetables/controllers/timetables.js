timetableModule.controller('TimetableController', function($scope, $routeParams, TimetableService) {

    $scope.getAllTables = function(){
      TimetableService.getAll().then(function(tables){
        $scope.tables = tables;
      });
    };

    $scope.getTable = function(){
        var id = $routeParams._id;
        console.log("Getting table by id in controller");
        TimetableService.getTableById(id).then(function(table){
            $scope.table = table;
        });
    }

});