'use strict';

angular
    .module('app.core')
    .controller('HomeController', ["$scope", "ShowService", "$window", function ($scope, ShowService, $window) {
        $scope.query = "";
        $scope.counter = 1;
        var vm = this;
        $scope.sortParam='first_name';
        var getdata = ShowService.getData(1)
            .then(
                function (d) {
                    vm.tutorials = d.data;
                },
                function (errResponse) {
                    console.error('Error while fetching Currencies');
                }
            );
        $scope.loadMore = function () {
            $scope.counter = $scope.counter + 1;
            if ($scope.counter < 5) {
                ShowService.getData($scope.counter)
                    .then(
                        function (d) {
                            if (d.data) {
                                vm.tutorials = vm.tutorials.concat(d.data);
                            }
                        },
                        function (errResponse) {
                            console.error('Error while fetching Currencies');
                        }
                    );
            } 
        };
        $scope.sortBy= function(sortParameter){
            $scope.sortParam = sortParameter;
            $filter('orderBy')(vm.tutorials , sortParam);
        };
        angular.element($window).bind("wheel", function () {
            if (this.pageYOffset >= 0) {
                $scope.loadMore();
            }
        });
        angular.element($window).bind("keypress", function (event) {
           console.log(event.keyCode);
           if(event.keyCode == 40){
            $scope.loadMore();
           }
        });

    }]);

