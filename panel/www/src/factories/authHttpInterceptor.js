app.factory('authHttpInterceptor', function($rootScope) {
    return {
      'request': function(config) {
        if($rootScope.token != null)
          config.headers.authorization = "Bearer " + btoa($rootScope.token);
        return config;
      },
    };
  });
  