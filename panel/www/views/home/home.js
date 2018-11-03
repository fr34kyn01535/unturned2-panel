"use strict"; 
app.register.controller('home', ['$rootScope','$scope', '$http', 'eventing', '$mdToast','$timeout', function ($rootScope,$scope, $http, eventing, $mdToast,$timeout) {
    var vm = this;
    vm.test = "IT WORKS";
}]);