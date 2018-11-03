var app = angular.module('Unturned2', ['ngMaterial', 'ngRoute', 'ngSanitize','angular-script.js', 'ngWebSocket']);
app.config(function ($mdThemingProvider,$httpProvider,$locationProvider, $routeProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
    app.register = {
        controller: $controllerProvider.register,
        directive: $compileProvider.directive,
        filter: $filterProvider.register,
        factory: $provide.factory,
        service: $provide.service
    };

    $httpProvider.interceptors.push('authHttpInterceptor');
    $mdThemingProvider
        .theme('default')
        .primaryPalette('green')
        .accentPalette('light-green')
        .warnPalette('red');

        $routeProvider.when('/login/:token', {
            templateUrl:function(rd){
                localStorage.setItem("token",atob(rd.token));
            },
            redirectTo: function(){ return "home"; }
        });
        $routeProvider.when('/logout', {
            templateUrl:function(rd){
                localStorage.removeItem("token");
            },
            redirectTo: function(){ return "home"; }
        });
    
    $routeProvider.when('/:view', {
        templateUrl: function (rd) {
            return '/views/' + rd.view + '/' + rd.view + '.html';
        },
        resolve: {
            load: function ($q, $route, $rootScope, $script) {
                var deferred = $q.defer();
                var dependencies = [
                    '/views/' + $route.current.params.view + '/' + $route.current.params.view + '.js'
                ];

                $script(dependencies, function () {
                    $rootScope.$apply(function () {
                        deferred.resolve();
                    });
                });

                return deferred.promise;
            }
        }
    });
});//.constant("$MD_THEME_CSS", "")

app.run(['$rootScope', 'config', 'eventing', '$location', '$timeout','$mdToast', function ($rootScope, config, eventing, $location, $timeout,$mdToast) {
    $rootScope.currentMenuItem = {};
    $rootScope.profile = { steamID: null, avatar: '/img/unknown.jpg', userName: "Guest" }
    $rootScope.loggedIn = false;
    $rootScope.breadcrumbs = [];
    $rootScope.loading = true;
    $rootScope.navigate = function (item, parents, keepBreadcrumbs) {
        if (!item.view) return;
        $rootScope.currentMenuItem = item;
        if (!keepBreadcrumbs) {
            $rootScope.breadcrumbs = parents || [];
            $rootScope.breadcrumbs.push($rootScope.currentMenuItem);
        }else if (parents){
            var index = parents.indexOf(item);
            if(index != -1){
                $rootScope.breadcrumbs = parents.slice(0,index+1)
            }
        }
        $location.path($rootScope.currentMenuItem.view);
    }

    $rootScope.config = { title: 'Unturned II Dashboard' };
    var jwt = localStorage.getItem("token");
    $rootScope.token = jwt;
    config.then(function (config) {
        if (!$location.path() || $location.path() == "/") {
            if (config.data.menuItems.length != 0) {
                $rootScope.navigate(config.data.menuItems[0]);
            }
        } else {
            $rootScope.currentMenuItem = config.data.menuItems.filter(m => "/" + m.ID == $location.path())[0];
            if (!$rootScope.currentMenuItem){
                $rootScope.currentMenuItem = config.data.menuItems[0];
            }
            $rootScope.breadcrumbs = [$rootScope.currentMenuItem];
        }
        $rootScope.config.title = config.data.title;
        $rootScope.loggedIn = (jwt != null);
        if ($rootScope.loggedIn) {
            const session = JSON.parse(atob(jwt.split(".")[1]));
            $rootScope.profile = session;
        }
            eventing.connect();
            eventing.emit("connected",jwt);
            eventing.on('connected',function(a){
                console.log(a);
            }) 

            eventing.on("*", function (event,data) {
                console.log(event+": "+data);
                /*$mdToast.show($mdToast.simple()
                .textContent(event+": "+data)
                .hideDelay(5000)
                .position("bottom right"));*/
            });

            

        /*function sanitize(d){
            return d.trim().replace(/(\[0m|\[  0\])/g,"").replace(/\n/g,"<br />\n").replace(/^(?:\[([\d]*)m)([^\n]*)$/gm, '<span class="color-$1">$2</span>');
        }*/

        $rootScope.stdout = "";
        eventing.on("log",function(data){
            $rootScope.log = data;
            $rootScope.$apply(function(){
                $timeout(function(){
                    $(".console").scrollTop($(".console")[0] && $(".console")[0].scrollHeight);
                })
            })
        });
    });
}]);