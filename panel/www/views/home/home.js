"use strict"; 
app.register.controller('home', ['$scope', '$http', 'eventing', '$mdToast', function ($scope, $http, eventing, $mdToast) {
    var vm = this;
    vm.test = "IT WORKS";
}]);