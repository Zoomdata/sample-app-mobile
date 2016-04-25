angular.module('starter.services', ['starter.queries','starter.config'])
.factory('Charts', function($window, $state, windowSize, ZDAccess, visuals) {

  var o = {
    charts: [{
      id: 0,
      name: 'Real Time Sales',
      lastText: 'Continuously generated sales data',
      face: 'img/rts.png'
    }],
    dashboards: [{
      id: 0,
      name: 'Real Time Sales',
      lastText: 'Continuously generated sales data',
      face: 'img/rts.png'
    }, {
      id: 1,
      name: '1 Billion Records',
      lastText: '1 billion records of sales data',
      face: 'img/1brts.png'
    }, {
      id: 2,
      name: 'Fusion Dashboard',
      lastText: 'Multi-source ticket marketplace fusion',
      face: 'img/fusion.png'
    }, {
      id: 3,
      name: 'Hotels Dashboard',
      lastText: 'Data powered by Cloudera Search',
      face: 'img/hotels.png'
    }, {
      id: 4,
      name: 'Securities Analysis',
      lastText: 'Stock ticker data analysis',
      face: 'img/securities.png'
    }]
  };

  o.fillRTSPie = function() {
      var visConfig = visuals[1].config;
      visConfig.zd_height = windowSize.height;
      visConfig.zd_width = windowSize.width;
      var processData = function(queryData) {
        var data = queryData.map(function(item) {
          return {value: item.current.count, name: item.group[0]};
        });
        var visConfig = visuals[1].config;
        visConfig.series[0].name = 'Product Group';
        visConfig.series[0].data = data;
      };

      return ZDAccess.queryProdGroup(processData);
  }

  var truncate = function( string, n ){
    if(string.length > n) {
        string = string.substring(0,n-1)+"...";
    }
    return string;
  }

  o.fillRTSBar = function() {
      var visConfig = visuals[0].config;
      visConfig.zd_height = windowSize.height;
      visConfig.zd_width = windowSize.width;
      var processData = function(queryData) {
        var data  = queryData.map(function(item) {
          return item.current.count;
        });
        var sales = queryData.map(function(item) {
          return item.current.metrics.price.sum;
        });
        var labels = queryData.map(function(item) {
          return item.group[0];
        });        

        // shows how to obtain a color scale to use for sales amounts
        // the colors would be plugged into the series itemstyle color array for the chart
        var bins = chroma.limits(sales, 'e', 5);
        var scale = chroma.scale(([ '#fee08b', '#e6f598', '#99d594', '#3288bd']))
              .domain(bins);
        var colors = sales.map(function(value) {
            return chroma(scale(value)).hex();
        });

        // populating visualization
        var visConfig = visuals[0].config;
        visConfig.series[0].name = 'Product Category';
        visConfig.series[0].data = sales;
        visConfig.xAxis[0].data = labels
        visConfig.yAxis[0].axisLabel.formatter = bigMoneyFormatter;
      };

      return ZDAccess.queryProdCat(processData);
  }

  o.fillRTSTrend = function() {
    var visConfig = visuals[2].config;
    visConfig.zd_height = windowSize.height;
    visConfig.zd_width = windowSize.width;
    var processData = function(queryData) {
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

        var visConfig = visuals[2].config;
        visConfig.series[0].name = 'Sales';
        visConfig.series[1].name = 'Planned Sales';
        visConfig.legend.data = [visConfig.series[0].name, visConfig.series[1].name];
        visConfig.series[0].data = sales;
        visConfig.series[1].data = plannedSales;
        visConfig.xAxis[0].data = labels;
        visConfig.yAxis[0].axisLabel.formatter = bigMoneyFormatter;
    }

    return ZDAccess.querySalesTrend(processData);
  }

  o.fillRTSDayTrend = function() {
      var visConfig = visuals[3].config;
      visConfig.zd_height = windowSize.height;
      visConfig.zd_width = windowSize.width;

      var processData = function(queryData) {
          var sales = queryData.map(function(item) {
              return item.current.metrics.price.sum.toFixed(0);
          });
          var plannedSales = queryData.map(function(item) {
              return item.current.metrics.plannedsales.sum.toFixed(0);
          });

          var labels = queryData.map(function(item, index) {
              var currentTime = moment(item.group[0],'YYYY-MM-DD HH:mm:ss');
              return currentTime.format('MM/DD/YYYY');
          }); 

          var visConfig = visuals[3].config;

          visConfig.series[0].name = 'Sales';
          visConfig.series[1].name = 'Planned Sales';
          visConfig.legend.data = [visConfig.series[0].name, visConfig.series[1].name];
          visConfig.series[0].data = sales;
          visConfig.series[1].data = plannedSales;
          visConfig.xAxis[0].data = labels;
          visConfig.yAxis[0].axisLabel.formatter = bigMoneyFormatter;
      }

      return ZDAccess.queryDaySalesTrend(processData);
  }

  var bigMoneyFormatter = function (v) {
    if (v > 999999 ) {
      result = '$' + numeral(v/1000000).format('0,0') + ' M';
    } else if (v > 999) {
      result = '$' + numeral(v/1000).format('0,0') + ' K';
    } else {
      result = '$' + numeral(v).format('0,0');
    }
    return result;
  };

  var myIndexOf = function(arr, name) {    
      for (var i = 0; i < arr.length; i++) {
          if (arr[i].name == name) {
              return i;
          }
      }
      return -1;
  }

 var reduceTwoDimResult = function(queryData) {
      var data = queryData.reduce(
        function(previousValue, currentValue, currentIndex, array) {
          var firstLevel = currentValue.group[0];
          var secondLevel = currentValue.group[1]; 
          var metric = currentValue.current.metrics.usersentiment.avg;
          var dataPoint = {x: secondLevel, y: metric};
          var name = firstLevel;
          var idx = myIndexOf(previousValue, name);
          (idx == -1) ?
                previousValue.push({name: name, datapoints: [dataPoint] }) :
                previousValue[idx].datapoints.push(dataPoint);
          return previousValue;
        },[] 
      );  
      return data;  
  }

  o.fillSentimentBars = function() {
    var visConfig = visuals[4].config;
    visConfig.zd_height = windowSize.height;
    visConfig.zd_width = windowSize.width;

    var processData = function(queryData) {
      var visConfig = visuals[4].config;
      var data = reduceTwoDimResult(queryData);
      visConfig.series[0].name = data[0].name;
      visConfig.series[1].name = data[1].name;
      visConfig.legend.data = [data[0].name, data[1].name];

      var labels = data[0].datapoints.map(function(item, index) {
        return item.x;
      });
      var series0 = data[0].datapoints.map(function(item, index) {
        return item.y;
      });
      var series1 = data[1].datapoints.map(function(item, index) {
        return item.y;
      });
      visConfig.series[0].data = series0;
      visConfig.series[1].data = series1;

      visConfig.xAxis[0].data = labels;
    }

    return ZDAccess.querySentiment(processData);
  }

  o.all = function() {
    return o.charts;
  }

  o.remove = function(chart) {
    o.charts.splice(o.charts.indexOf(chart), 1);
  }

  o.get = function(chartId) {
    for (var i = 0; i < o.charts.length; i++) {
      if (o.charts[i].id === parseInt(chartId)) {
        return o.charts[i];
      }
    }
    return null;
  }

  o.allDashboards = function() {
    return o.dashboards;
  }

  o.rmDashboards = function(dashboard) {
    o.dashboards.splice(o.dashboards.indexOf(dashboard), 1);
  }

  o.getDashboard = function(id) {
    for (var i = 0; i < o.dashboards.length; i++) {
      if (o.dashboards[i].id === parseInt(id)) {
        return o.dashboards[i];
      }
    }
    return null;
  }

  o.logout = function() {
    // return ZDAccess.logout();
    ZDAccess.logout().then(function(response) {
        console.log(response);
      }
    ).finally(function() {
      $state.go('tab.dash');
    });
  }

  o.calcWidgetSize = function(gesture) {
    var width = $window.innerWidth;
    var height = width/ 2;
    windowSize.width = width;
    windowSize.height = height;
  }

  return o;
  
});

