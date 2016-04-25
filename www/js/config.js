angular.module('starter.config', ['ionic', 'ngCordovaOauth'])
.constant('redirect', {
	cordova_uri: "http://localhost/callback",
	browser_dev_uri: "http://localhost:8100/%23/tab/dash",
	browser_prod_uri: "http://demos.zoomdata.com/zd-mobile-app-02/%23/tab/dash"
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
          client_id: "emQtbW9iaWxlLWFwcC0wMi1jbGllbnQxNDYwOTI4OTA5ODkxNmU5MmM5MGYtZGU3Ny00OTI2LTk4NzUtYjMzNjRhNzliZGMw",
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
		         timeWindowScale: 'PINNED'
		       },
		       time: {
				 from: '+$start_of_day',
				 to: '+$now',
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
		},
		sentimentByGroupQuery: {
			source: 'Real Time Sales',
			cfg: {
		       tz: 'EST',
		       player: {
		         pauseAfterRead: true,
		         timeWindowScale: 'ROLLING'
		       },
		       time: {
		         timeField: '_ts'
		       },
		       filters: [],
		       groups: [{
				 name: 'usergender',
				 limit: 10,				 
				 sort: {
				    name: 'count',
				    dir: 'desc'
				 }
		       },{
		         name: 'group',
		         limit: 20,
		         sort: {
		           dir: 'desc',
		           name: 'count'
		         }
		       }],
		       metrics: [{
		         name: 'usersentiment',
		         func: 'avg'
		       }]
		    }
		}
})
.constant('settings', {
		enableAlerts: false, 
		continuousUpdate: true
})
.constant('windowSize', {
	width: null,		// dynamically calculated
	height: null		// dynamically calculated
})
.constant('visuals', [
	{
		title: 'Sales by Category - Rolling Hour',
		type: 'bar',
		config: null
	},
	{
		title: 'Transactions by Group - Today',
		type: 'pie',
		config: null
	},
	{
		title: 'Actual vs. Planned - Rolling Hour',
		type: 'line',
		config: null
	},
	{
		title: 'Actual vs. Planned - Rolling 7 Days',
		type: 'line',
		config: null
	},
	{
		title: 'Avg Satisfaction - Rolling Hour',
		type: 'bar',
		config: {
			zd_data_status: 'not_ready',
			zd_height: null,
			zd_width: null,
		    version: 1,
			tooltip: {
				formatter: function (params) {
				  return params[0] + '<br/>'
				         + params[1] + ' : ' + numeral(params.value).format('0.000') + '<br/>';
				}
			},
			legend: {
				show: true,
				y: 'top'
			},
		    toolbox: {
		      show: false
		    },
			grid: {
				x: 50,
				y: 30,
				x2: 20,
				y2: 20
			},
			stack: false,
		    padding: 0,
		    calculable: true,
		    xAxis: [
		      {
		        type: 'category',
		        axisLine: {show: true},
		        data: []
		      }
		    ],
		    yAxis: [
		      {
		        type: 'value',
		        axisLine: {show: true},
		        splitArea: {show: true}
		      }
		    ],
		    series: [
		      {
		        name: '',
		        type:'bar',
		        smooth: true,
		        itemStyle: {normal: {areaStyle: {type: 'default'}}},
		        data: []
		      },
		      {
		        name: '',
				type:'bar',
		        smooth: true,
		        itemStyle: {normal: {areaStyle: {type: 'default'}}},
		        data: []
		      }
		    ]
		  }
	},
	{
		title: 'Actual vs. Planned - Rolling Hour',
		type: 'line',
		config: {
			zd_data_status: 'not_ready',
			zd_height: null,
			zd_width: null,
		    version: 1,
		    color: ['#fdc086','#386cb0'], 
		    tooltip: {
		      	trigger: 'axis',
				formatter: function (params) {
					return params[0][1] + '<br/>'
					     + params[0][0] + ' : ' + numeral(params[0].value).format('$0,000.') + '<br/>'
					     + params[1][0] + ' : ' + numeral(params[1].value).format('$0,000.') + '<br/>';
				}
		    },
		    legend: {
		      data: [],
		      y: 'top'
		    },
		    toolbox: {
		      show: false
		    },
		    grid: {
	            x: 60,
	            y: 30,
	            x2: 28,
	            y2: 20
		    },
		    padding: 0,
		    calculable: true,
		    xAxis: [
		      {
		        type: 'category',
		        data: []
		      }
		    ],
		    yAxis: [
		      {
		        type: 'value',
		        splitArea: {show: true},
		        axisLabel: {
		        	formatter: function (params) {
						return numeral(params).format('$0,000.');
					}
		        }
		      }
		    ],
		    series: [
		      {
		        name: '',
		        type: 'line',
		        smooth: true,
		        itemStyle: {normal: {areaStyle: {type: 'default'}}},
		        data: []
		      },
		      {
		        name: '',
		        type: 'line',
		        smooth: true,
		        itemStyle: {normal: {areaStyle: {type: 'default'}}},
		        data: []
		      }
		    ]
		  },
		  processData: function(queryData) {
	        var sales = queryData.map(function(item) {
	            return item.current.metrics.price.sum.toFixed(0);
	        });
	        var plannedSales = queryData.map(function(item) {
	            return item.current.metrics.plannedsales.sum.toFixed(0);
	        });

	        var labels = queryData.map(function(item, index) {
	            var currentTime = moment(item.group[0] + 'Z','YYYY-MM-DD HH:mm:ssZ');
	            return currentTime.format('HH:mm');
	        }); 
	        this.series[0].name = 'Sales';
	        this.series[1].name = 'Planned Sales';
	        this.legend.data = [this.series[0].name, this.series[1].name];
	        this.series[0].data = sales;
	        this.series[1].data = plannedSales;

	        this.xAxis[0].data = labels;
	      }
	}
	])

.factory('OAuthSupport', function($q, $cordovaOauth, serverConfig, redirect, production) {
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

	o.obtainRedirect = function() {
		console.log('production mode is ' + production);
		var result;
		if (window.cordova === undefined ) {
			result = production ? redirect.browser_prod_uri : redirect.browser_dev_uri ;
		} else {
			result = redirect.cordova_uri;
		}
		return result;
	}

	o.oauthAuthenticate = window.cordova === undefined ? 
						$cordovaOauth.browserOnly : $cordovaOauth.generic;

	serverConfig.oauthOptions.redirect_uri = o.obtainRedirect();

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