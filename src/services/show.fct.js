'use strict';
angular
    .module('app.services').factory('ShowService', ['$http', '$q', function($http, $q){
        return {
            getData:function(pagenumber){
                var requestUrl = "https://reqres.in/api/users?page="+pagenumber;
                return $http({
                    'url': requestUrl,
                    'method': 'GET',
                    'headers': {
                        'Content-Type': 'application/json'
                    },
                    'cache': true
                }).then(function(response){
                    return response.data;
                }).catch(this.dataServiceError());
            },
            dataServiceError:function(errorResponse) {
                return errorResponse;
            }
        }

}]);