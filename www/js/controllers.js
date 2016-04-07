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

  var fillDashboard = function() {
    var barPromise = Charts.fillRTSBar();
    var piePromise = Charts.fillRTSPie();
    $q.all([barPromise, piePromise]).then(function(data) {
        $scope.barCfg = angular.copy(data[0]);
        // charts.js renders blank otherwise
        delayedCopy(data[1])
        .then( startPlay() );
      }, function(reason) {
        console.log('Failed: ' + reason);
      }
    );
  }
      
  var delayedCopy = function(data) {
    return $timeout( function() {
      $scope.pieCfg = angular.copy(data);
    }, 500);    
  }

  var startPlay = function() {
    // Don't start playing if the player is already on
    if ( angular.isDefined(play) ) return;
    firstPlay = true;
    $scope.playerLabel = 'ion-ios-pause';
    play = $interval( function() {
      var barPromise = Charts.fillRTSBar();
      var piePromise = Charts.fillRTSPie();
      $q.all([barPromise, piePromise]).then(function(newData) {
          $scope.barCfg.data = newData[0].data;
          $scope.barCfg.labels = newData[0].labels;
          $scope.pieCfg.data = newData[1].data;
          $scope.pieCfg.labels = newData[1].labels;

        }, function(reason) {
          console.log('Failed: ' + reason);
        }
      );
      // var data = $scope.barCfg.data;
      // var newBarData = data.map(function(series) {
      //   return randomizeArray(series);
      // });
      // $scope.barCfg.data = newBarData;

      // data = $scope.pieCfg.data;
      // var newPieData = randomizeArray(data);
      // $scope.pieCfg.data = newPieData;

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
