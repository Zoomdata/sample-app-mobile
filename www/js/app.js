

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','chart.js', 'starter.controllers'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
// .factory('ZDClient', ZDClientFactory)
.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    resolve: {
        cordova: function($q, $timeout) {
            var deferred = $q.defer();
            ionic.Platform.ready(function() {
                // need to wait for ionic and cordova to be fully initialized
                // otherwise, app will not work after coming back from the 
                // inapp brwoser for OAuth
                var delay = window.cordova ? 25000 : 1;
                $timeout(function () {
                  console.log('ionic.Platform.ready');
                  deferred.resolve();
                }, delay);
            });
            return deferred.promise;
        }
    }
  })

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.dash-detail', {
    url: '/dash/:dashId',
    views: {
      'tab-dash': {
        templateUrl: 'templates/dash-detail.html',
        controller: 'DashDetailCtrl'
      }
    }
  })

  .state('tab.charts', {
      url: '/charts',
      views: {
        'tab-charts': {
          templateUrl: 'templates/tab-charts.html',
          controller: 'ChartsCtrl'
        }
      }
  })

  .state('tab.chart-detail', {
    url: '/charts/:chartId',
    views: {
      'tab-charts': {
        templateUrl: 'templates/chart-detail.html',
        controller: 'ChartDetailCtrl'
      }
    }
  })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

})
.constant('chroma', window.chroma)
.constant('moment', window.moment)
.constant('numeral', window.numeral)
;

// Charts.js global defaults
Chart.defaults.global.scaleLabel = function (label) {
    var v = label.value;
    if (v > 999999 ) {
      result = '$' + numeral(v/1000000).format('0,0') + ' M';
    } else if (label.value > 999999) {
      result = '$' + numeral(v/1000).format('0,0') + ' k';
    } else {
      result = '$' + numeral(v).format('0,0');
    }
    return result;
};

Chart.defaults.global.multiTooltipTemplate = function (label) {
    var v = label.value;
    return label.datasetLabel + ': ' + '$' + numeral(v).format('0,0');
}; 

Chart.defaults.global.tooltipTemplate = function(value) {
    if (value.label)  {
        return value.label + ":" + '$' + numeral(value.value).format('0,0');
    } else {
        return value.value;
    }
};
