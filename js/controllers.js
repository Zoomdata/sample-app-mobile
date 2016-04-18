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

.controller('DashDetailCtrl', function($scope, $timeout, $interval, $stateParams, 
                                       $q, OAuthSupport, Charts, settings) {
  OAuthSupport.authenticate();

  $scope.dash = Charts.getDashboard($stateParams.dashId);
  var play;

  $scope.onClick = function (points, evt) {
    // test to capture onClick event for trends.  See templates/dash-detail.html
    console.log(points, evt);
  };

  var fillDashboard = function() {
    var barPromise = Charts.fillRTSBar();
    var piePromise = Charts.fillRTSPie();
    var trendPromise = Charts.fillRTSTrend();
    var trendDayPromise = Charts.fillRTSDayTrend();
    $q.all([barPromise, piePromise, trendPromise, trendDayPromise]).then(function(data) {
        $scope.trendDayCfg = angular.copy(data[3]);
        // workaround as charts.js cannot render more than one chart update at the same time
        delayed( function() {
          $scope.trendCfg = angular.copy(data[2]);
        }, 900)
        .then( 
            delayed(function() {
              $scope.barCfg = angular.copy(data[0]);
            }, 2000)
        )
        .then(
            delayed( function() {
              $scope.pieCfg = angular.copy(data[1]); 
            }, 2600)
        )
        .then( 
          togglePlay()
        );
      }, function(reason) {
        console.log('Failed: ' + reason);
      }
    );
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
      $q.all([barPromise, piePromise, trendPromise, trendDayPromise]).then(function(newData) {
          delayed( function() {
            $scope.barCfg.data = newData[0].data;
            $scope.barCfg.labels = newData[0].labels;
          }, 900)
          .then(
            delayed( function() {
              $scope.pieCfg.data = newData[1].data;
              $scope.pieCfg.labels = newData[1].labels;
            }, 1600)
          )
          .then(
            delayed( function() {
              $scope.trendCfg.data = newData[2].data;
              $scope.trendCfg.labels = newData[2].labels;
            }, 1600)
          )
          .then(
            delayed( function() {
              $scope.trendDayCfg.data = newData[3].data;
              $scope.trendDayCfg.labels = newData[3].labels;
            }, 1600)
          )

        }, function(reason) {
          console.log('Failed: ' + reason);
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

  $scope.$on("continuousUpdateChanged", function (event, args) {
    togglePlay();
  });

  $scope.$on('$destroy', function() {
    // Ensures the interval is destroyed too
    stopPlay();
  });

  fillDashboard();
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

.controller('SignoutCtrl', function($scope, serverConfig, OAuthSupport, Charts) {
  serverConfig.credentials.access_token = '';
  Charts.logout().then(function(response) {
        console.log('in logout');
        cnsole.log(response);
        OAuthSupport.authenticate();
    }
  );


})

;
