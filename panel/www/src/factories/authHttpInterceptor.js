app.factory('authHttpInterceptor', function($rootScope) {
    return {
      'request': function(config) {
        config.headers.authorization = "Bearer " + btoa($rootScope.token);
        return config;
      },
    };
  });
  