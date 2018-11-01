app.controller('MenuController', ['$rootScope', '$location', 'config', function ($rootScope, $location, config) {
    var vm = this;
    vm.menu = []
    config.then(function(response) {
        vm.menu = response.data.menuItems;
    });
}]);