app.factory('config', ['$http',function($http) {
    return $http.get("/config");
}]);