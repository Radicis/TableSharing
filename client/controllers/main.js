tableShare
    .controller('HomeController', function($scope, $uibModal) {

        $scope.openLogin = function (size) {

            console.log("Opening login modal");

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'views/login.html',
                controller: 'AuthenticationController',
                size: size,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

});