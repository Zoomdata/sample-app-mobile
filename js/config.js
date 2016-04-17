angular.module('starter.config', ['ionic', 'ngCordovaOauth'])
.constant('redirect', {
	cordova_uri: "http://localhost/callback",
	browser_uri: "http://localhost:8100/%23/tab/dash"
	// browser_uri: "http://192.168.1.125:8100/%23/tab/dash"
})
.constant('serverConfig', {
      credentials: {
          access_token: ''
      },
      application: {
          secure: true,
          host: 'pubsdk.zoomdata.com',
          port: 8443,
          path: '/zoomdata'
      },
      oauthOptions: {
          client_id: "emQtbW9iaWxlLWFwcC0wMi1jbGllbnQxNDYwNzI1MDg4NzM5MzU4MTRiYjItMzY4YS00YWQwLTlkNWMtMGU5OTNiYTcyZWEz",
          redirect_uri: "",
          auth_uri: "https://pubsdk.zoomdata.com:8443/zoomdata/oauth/authorize",
          scope: ['read']
      }
})
.constant('queryConfig', {
		prodGroupQuery: {
			source: 'Real Time Sales',
			cfg: {
		       tz: 'EST',
		       player: {
		         speed: 1,
		         pauseAfterRead: true,
		         timeWindowScale: 'ROLLING'
		       },
		       time: {
		         timeField: '_ts'
		       },
		       filters: [],
		       groups: [{
		         name: 'group',
		         limit: 20,
		         sort: {
		           dir: 'desc',
		           name: 'count'
		         }
		       }],
		       metrics: [{
		         name: 'price',
		         func: 'sum'
		        }]
		    }
		},
		prodCatQuery: {
			source: 'Real Time Sales',
			cfg: {
		       tz: 'EST',
		       player: {
		         speed: 1,
		         pauseAfterRead: true,
		         timeWindowScale: 'ROLLING'
		       },
		       time: {
		         timeField: '_ts'
		       },
		       filters: [],
		       groups: [{
		         name: 'category',
		         limit: 10,
		         sort: {
	              'name': 'price',
	              'dir': 'desc',
	              'metricFunc': 'sum'
		         }
		       }],
		       metrics: [
		          {
		            'name': 'price',
		            'func': 'sum'
		          }
		        ]
		    }			
		},
		salesTrendQuery: {
			source: 'Real Time Sales',
			cfg: {
				filters: [],
				player: {
		         pauseAfterRead: true,
		         timeWindowScale: 'ROLLING'
		       },
		       time: {
		         timeField: '_ts'
		       },
		       groups: [{
		         name: '$to_minute(_ts)',
		         sort: {
	              'dir': 'asc',
	              'name': '_ts'
		         },
		         'limit': 1000
		       }],
		       metrics: [
		          {
		            'name': 'price',
		            'func': 'sum'
		          },
		          {
		            'name': 'plannedsales',
		            'func': 'sum'
		          }
		        ]
			}
		},
		salesDayTrendQuery: {
			source: 'Real Time Sales',
			cfg: {
				filters: [],
				player: {
		         pauseAfterRead: true,
		         timeWindowScale: 'PINNED'
		       },
		       time: {
		       	 from: '+$now_-7_day',
      			 to: '+$now',
		         timeField: '_ts'
		       },
		       groups: [{
		         name: '$to_day(_ts)',
		         sort: {
	              'dir': 'asc',
	              'name': '_ts'
		         },
		         'limit': 1000
		       }],
		       metrics: [
		          {
		            'name': 'price',
		            'func': 'sum'
		          },
		          {
		            'name': 'plannedsales',
		            'func': 'sum'
		          }
		        ]
			}			
		}
})
.factory('OAuthSupport', function($q, $cordovaOauth, serverConfig, redirect) {
	var o = {};
	o.authenticate = function() {
		return $q(function (resolve, reject){
			if (serverConfig.credentials.access_token === '') {
				ionic.Platform.ready(function(){
					o.performOAuth(resolve, reject); 
				});
			} else {
				resolve(serverConfig);
			}
		});
	}

	o.oauthAuthenticate = window.cordova === undefined ? 
						$cordovaOauth.browserOnly : $cordovaOauth.generic;

	serverConfig.oauthOptions.redirect_uri = window.cordova === undefined ? 
						redirect.browser_uri : redirect.cordova_uri;

	o.performOAuth = function(resolve, reject) {
		o.oauthAuthenticate(
		  serverConfig.oauthOptions.client_id, 
		  serverConfig.oauthOptions.auth_uri,
		  serverConfig.oauthOptions.scope,
		  serverConfig.oauthOptions)
		.then( function(result) {
			  console.log("Response Object -> " + JSON.stringify(result));
			  serverConfig.credentials.access_token = result.access_token;
			  resolve(result);
			}, function(error) {
			  console.log("Error -> " + error);
			  reject(error);
			}
		 );			
	}

    return o;
  }
)
.factory('OAuthFinish', function($location, serverConfig) {
	var o = {};

	o.checkToken = function() {
        if($location.path().indexOf('#access_token') !== -1) {
        	return o.extractHashToken();
        } else if($location.path().indexOf('&access_token') !== -1) {
        	return o.extractAmpToken();
        }
	}

	o.extractHashToken = function() {
	      var callbackResponse = ($location.path()).split("#")[1];
	      var responseParameters = (callbackResponse).split("&");
	      var parameterMap = [];
	      var authResult = null;
	      for(var i = 0; i < responseParameters.length; i++) {
	        parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
	      }
	      if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
	        authResult = { access_token: parameterMap.access_token, 
	                          token_type: parameterMap.token_type, 
	                          expires_in: parameterMap.expires_in, 
	                          scope: parameterMap.scope };
	        serverConfig.credentials.access_token = authResult.access_token;
	      } else {
	        console.log("Problem authenticating");
	      }
	      console.log(authResult);

	      return authResult;
	}

	o.extractAmpToken = function() {
          var responseParameters = ($location.path()).split("&");
          var parameterMap = [];
          var authResult = null;
          for(var i = 0; i < responseParameters.length; i++) {
            parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
          }
          if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
            authResult = { access_token: parameterMap.access_token, 
                              token_type: parameterMap.token_type, 
                              expires_in: parameterMap.expires_in, 
                              scope: parameterMap.scope };
            serverConfig.credentials.access_token = authResult.access_token;
          } else {
            console.log("Problem authenticating");
          }
          console.log(authResult);

          return authResult;
	}

    return o;
  }
)
;	
