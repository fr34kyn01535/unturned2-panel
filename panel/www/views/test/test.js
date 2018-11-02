"use strict"; 
app.register.controller('test', ['$scope', '$http', 'eventing', '$mdToast', function ($scope, $http, eventing, $mdToast) {
    var vm = this;
    vm.test = "IT WORKS";
}]);