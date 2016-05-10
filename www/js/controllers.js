angular.module('starter.controllers', ['starter.services', 'starter.config'])

.controller('DashCtrl', function($scope, OAuthSupport, Charts) {
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
                                       $q, OAuthSupport, Charts, settings, windowSize) {
  var play;

  var fillDashboard = function(dashboard, lastStep) {
    var dashFunctions = dashboard.functions;
    var promises = dashFunctions.map(function(f) {
      return f.call(Charts);
    })
    $q.all(promises)
    .then(function(visConfigs) {
        visConfigs.map(function(visConfig) {
          visConfig.zd_data_status = 'ready';
          visConfig.version++;
        }); 
        
        dashboard.ready = true;

        if (lastStep) {
          lastStep();     
        }
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
    if (settings.continuousUpdate && 
        $scope.dash.continuosUpdate) {
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
            fillDashboard($scope.dash);
          }, $scope.dash.updateRate);
  }

  var stopPlay = function() {
    if (angular.isDefined(play)) {
      $interval.cancel(play);
      play = undefined;
    }
  };

  $scope.$on("continuousUpdateChanged", function (event, args) {
    togglePlay();
  });

  $scope.$on('$destroy', function() {
    // Ensures the interval is destroyed too
    stopPlay();
    angular.element($window).off('resize', onResize);
  });

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

  $scope.dash = Charts.getDashboard($stateParams.dashId);
  $scope.visuals = Charts.getVisuals($scope.dash);

  // first call to populate data on visualizations
  fillDashboard($scope.dash, togglePlay);

})

.controller('DashChartDetailCtrl', function($scope, $stateParams, OAuthSupport, Charts, windowSize) {
  OAuthSupport.authenticate();
  // places the visual data on the chart scope
  var dash = Charts.getDashboard($stateParams.dashId);
  var visuals = Charts.getVisuals(dash);
  $scope.chart = visuals[$stateParams.chartId];

  // resize support
  $scope.style = function(windowSize) {
      return { 'height': windowSize.height + 'px', 'width':  windowSize.width + 'px'};
  }
  Charts.calcWidgetSize();
  $scope.windowSize = windowSize;

})

.controller('ChartsCtrl', function($scope, OAuthSupport, Charts) {
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

.controller('SignoutCtrl', function($state, Charts) {
  Charts.logout();
})

;
