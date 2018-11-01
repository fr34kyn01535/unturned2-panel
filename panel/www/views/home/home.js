"use strict"; 
app.register.controller('home', ['$scope', '$http', 'eventing', '$mdToast', function ($scope, $http, eventing, $mdToast) {
    var vm = this;
    eventing.on("playerConnected", function (data) {
        $mdToast.show($mdToast.simple().textContent(data).hideDelay(3000));
    });

    eventing.on("connected", function (data) {
        $mdToast.show($mdToast.simple().textContent(data).hideDelay(3000));
    });
    vm.test = "IT WORKS";
}]);