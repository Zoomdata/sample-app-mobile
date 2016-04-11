angular.module('starter.controllers', ['starter.services'])

.controller('DashCtrl', function($scope, Charts) {
  $scope.dashboards = Charts.allDashboards();
  $scope.removeDash = function(dash) {
    Charts.rmDashboards(dash);
  };
})

.controller('DashDetailCtrl', function($scope, $timeout, $interval, $stateParams, $q, Charts) {
  $scope.dash = Charts.getDashboard($stateParams.dashId);
  $scope.playerLabel = 'ion-ios-pause';
  var play;
  var firstPlay = false;

  $scope.onClick = function (points, evt) {
    // test to capture onClick event for trends.  See templates/dash-detail.html
    console.log(points, evt);
  };

  var fillDashboard = function() {
    // console.log('in fillDashboard');
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
        .then( startPlay() );
      }, function(reason) {
        console.log('Failed: ' + reason);
      }
    );
  }
      
  var delayed = function( myFunction, delay ) {
    return $timeout( myFunction, delay);    
  }

  var startPlay = function() {
    // console.log('in startPlay');
    // Don't start playing if the player is already on
    if ( angular.isDefined(play) ) return;
    firstPlay = true;
    $scope.playerLabel = 'ion-ios-pause';
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

    }, 4000);
  }

  var stopPlay = function() {
    if (angular.isDefined(play)) {
      $interval.cancel(play);
      play = undefined;
      $scope.playerLabel = 'ion-ios-play';
    }
  };

  $scope.togglePlay = function() {
    if (!firstPlay) {
      return;
    }
    if (!play) {
      startPlay();
    } else {
      stopPlay();
    }
  }

  $scope.$on('$destroy', function() {
    // Ensures the interval is destroyed too
    stopPlay();
  });

  function randomizeArray(series) {
    var newSeries = series.map(function(item) {
      return randomIntFromInterval(50, 100);
    });
    return newSeries;
  }

  function randomIntFromInterval(min,max) {
      return Math.floor(Math.random()*(max-min+1)+min);
  }

  fillDashboard();
})

.controller('ChartsCtrl', function($scope, Charts) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.charts = Charts.all();
  $scope.remove = function(chart) {
    Charts.remove(chart);
  };
})

.controller('ChartDetailCtrl', function($scope, $stateParams, Charts) {
  $scope.chart = Charts.get($stateParams.chartId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: false
  };
})
;
