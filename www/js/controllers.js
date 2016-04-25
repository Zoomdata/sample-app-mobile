angular.module('starter.controllers', ['starter.services', 'starter.config'])

.controller('DashCtrl', function($scope, serverConfig, OAuthSupport, Charts) {
  $scope.$on('$ionicView.enter', function(e) {
      OAuthSupport.authenticate()
      .then( function(result) {
          $scope.dashboards = Charts.allDashboards();
          $scope.removeDash = function(dash) {
            Charts.rmDashboards(dash);
          };
        }
      );
  });

})

.controller('DashDetailCtrl', function($window, $scope, $state, $timeout, $interval, $stateParams, 
                                       $q, OAuthSupport, Charts, settings, visuals, windowSize) {
  var play;

  var fillDashboard = function() {
    $scope.visuals = visuals;
    var barPromise = Charts.fillRTSBar();
    var piePromise = Charts.fillRTSPie();
    var trendPromise = Charts.fillRTSTrend();
    var trendDayPromise = Charts.fillRTSDayTrend();
    var sentimentPromise = Charts.fillSentimentBars();
    $q.all([barPromise, piePromise, trendPromise, trendDayPromise, sentimentPromise])
    .then(function(data) {
        visuals[4].config.zd_data_status = 'ready';
        visuals[4].config.version++;
        // workaround as charts.js cannot render more than one chart update at the same time
        delayed( function() {
          visuals[2].config.zd_data_status = 'ready';
          visuals[2].config.version++;
        }, 1)
        .then(
          delayed( function() {
            visuals[0].config.zd_data_status = 'ready';
            visuals[0].config.version++;
          }, 1)
        )
        .then(
          delayed( function() {
            visuals[1].config.zd_data_status = 'ready';
            visuals[1].config.version++;
          }, 1)
        )
        .then(function() {
            visuals[3].config.zd_data_status = 'ready';
            visuals[3].config.version++;
          }
        )
        .then(function() {
            togglePlay();
          }
        );
      }, function(reason) {
        checkFailReason(reason);
      }
    );
  }

  var checkFailReason = function(reason) {
    console.log('Failed: ' + reason);
    var reauth = false;
    if ((reason + '').includes('Internal XMLHttpRequest Error')) {
      reauth = true;
    } else if (reason.type === 'error') {
      reauth = true;
    } else if (reason.responseText !== undefined) {
      var responseText = reason.responseText;
      if (responseText.includes('authentication') || 
          responseText.includes('login')) {
        reauth = true;
      }
    }
    if (reauth) {
      Charts.logout();      
    }
  }
      
  var togglePlay = function() {
    if (settings.continuousUpdate) {
      startPlay();
    } else {
      stopPlay();
    }
  }

  var delayed = function( myFunction, delay ) {
    return $timeout( myFunction, delay);    
  }

  var startPlay = function() {
    // Don't start playing if the player is already on
    if ( angular.isDefined(play) ) return;
    play = $interval( function() {
      var barPromise = Charts.fillRTSBar();
      var piePromise = Charts.fillRTSPie();
      var trendPromise = Charts.fillRTSTrend();
      var trendDayPromise = Charts.fillRTSDayTrend();
      var sentimentPromise = Charts.fillSentimentBars();
      $q.all([barPromise, piePromise, trendPromise, trendDayPromise, sentimentPromise])
      .then(function(newData) {
          visuals[0].config.zd_data_status = 'ready';
          visuals[0].config.version++;
          delayed( function() {
            visuals[1].config.zd_data_status = 'ready';
            visuals[1].config.version++;
          }, 1)
          .then(
            delayed( function() {
              visuals[2].config.zd_data_status = 'ready';
              visuals[2].config.version++;
            }, 1)
          )
          .then(
            delayed( function() {
              visuals[3].config.zd_data_status = 'ready';
              visuals[3].config.version++;
            }, 1)
          )
          .then( function() {
              visuals[4].config.zd_data_status = 'ready';
              visuals[4].config.version++;
            }
          )
        }, function(reason) {
          checkFailReason(reason);
        }
      );

    }, 6000);
  }

  var stopPlay = function() {
    if (angular.isDefined(play)) {
      $interval.cancel(play);
      play = undefined;
    }
  };

  $scope.sentimentOptions = {
    scaleLabel : function (label) {
      var v = label.value;
      result = numeral(v).format('0.000');
      return result;
    },
    showTooltips: true,
    scaleBeginAtZero: false,
    responsive: true,
    multiTooltipTemplate : function (label) {
      var v = label.value;
      return label.datasetLabel + ': ' + numeral(v).format('0.000');
    }
  };

  $scope.transactPieOptions = {
    tooltipTemplate : function (label) {
      var v = label.value;
      return label.label + ': ' + numeral(v).format('0,000');
    },
    showTooltips: true
  }

  $scope.$on("continuousUpdateChanged", function (event, args) {
    togglePlay();
  });

  $scope.$on('$destroy', function() {
    // Ensures the interval is destroyed too
    stopPlay();
    angular.element($window).off('resize', onResize);
  });

  $scope.dash = Charts.getDashboard($stateParams.dashId);

  $scope.onClick = function (points, evt) {
    // test to capture onClick event for trends.  See templates/dash-detail.html
    console.log(points, evt);
  };

  // supports window resizing
  var onResize = function() {
    $scope.$apply(function() {
      Charts.calcWidgetSize();    
    }) 
  }
  $scope.style = function(windowSize) {
      return { 'height': windowSize.height + 'px', 'width':  windowSize.width + 'px'};
  }
  Charts.calcWidgetSize();
  $scope.windowSize = windowSize;
  angular.element($window).bind('resize', onResize);

  // ensures user is authenticated
  $scope.$on('$ionicView.enter', function(e) {
      OAuthSupport.authenticate();
  });

  // first call to populate data on visualizations
  fillDashboard();

})

.controller('DashChartDetailCtrl', function($scope, $stateParams, OAuthSupport, visuals, Charts, windowSize) {
  OAuthSupport.authenticate();
  // places the visual datea on the chart scope
  $scope.chart = visuals[$stateParams.chartId];

  // resize support
  $scope.style = function(windowSize) {
      return { 'height': windowSize.height + 'px', 'width':  windowSize.width + 'px'};
  }
  Charts.calcWidgetSize();
  $scope.windowSize = windowSize;

})

.controller('ChartsCtrl', function($scope, serverConfig, OAuthSupport, Charts) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  $scope.$on('$ionicView.enter', function(e) {
      OAuthSupport.authenticate()
      .then( function(result) {
          $scope.charts = Charts.all();
          $scope.remove = function(chart) {
            Charts.remove(chart);
          };
        }
      );
  });

})

.controller('ChartDetailCtrl', function($scope, $stateParams, OAuthSupport, Charts) {
  OAuthSupport.authenticate();

  $scope.chart = Charts.get($stateParams.chartId);

})

.controller('AccountCtrl', function($rootScope, $scope, OAuthSupport, settings) {
  OAuthSupport.authenticate();

  // $scope.settings is updated by UI events and it is assigned to settings
  // settings is the model defined in config.js
  $scope.settings = settings;

  $scope.continuousUpdateChanged = function() {
    $rootScope.$broadcast("continuousUpdateChanged");
  }
})

.controller('SignoutCtrl', function($state, serverConfig, OAuthSupport, Charts) {
  Charts.logout();
})

;
