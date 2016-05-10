angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.config', 'iu'])
.run(function($ionicPlatform, OAuthFinish, Charts) {
  OAuthFinish.checkToken();
  Charts.calcWidgetSize();
  Charts.initDashboards();
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

  .state('tab.dash-list', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.dash', {
    url: '/dash/:dashId',
    views: {
      'tab-dash': {
        templateUrl: 'templates/dash-detail.html',
        controller: 'DashDetailCtrl'
      }
    }
  })
  .state('tab.chart', {
    url: '/dash/:dashId/:chartId',
    views: {
      'tab-dash': {
        templateUrl: 'templates/dash-single-viz.html',
        controller: 'DashChartDetailCtrl'
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
  })

  .state('tab.signout', {
    url: '/signout',
    views: {
      'tab-signout': {
        templateUrl: 'templates/tab-signout.html',
        controller: 'SignoutCtrl'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

})
.constant('chroma', window.chroma)
.constant('moment', window.moment)
.constant('numeral', window.numeral)
// switch to false for development mode
.constant('production', false)  
;
