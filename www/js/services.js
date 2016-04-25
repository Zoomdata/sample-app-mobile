angular.module('starter.services', ['starter.queries','starter.config'])
.factory('Charts', function($state, windowSize, ZDAccess, visuals) {

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
      var processData = function(queryData) {
        var result = {};
        var data = queryData.map(function(item) {
          return item.current.count;
        });
        var labels = queryData.map(function(item) {
          return item.group[0];
        });
        result.type = 'pie';
        result.data = data;
        result.labels = labels;

        return result;
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
      var processData = function(queryData) {
        var result = {};
        var data  = queryData.map(function(item) {
          return item.current.count;
        });
        var sales = queryData.map(function(item) {
          return item.current.metrics.price.sum;
        });
        var labels = queryData.map(function(item) {
          var truncStr = truncate(item.group[0], 7);
          return truncStr;
        });        

        // colors setup
        var bins = chroma.limits(sales, 'e', 5);
        var scale = chroma.scale(([ '#fee08b', '#e6f598', '#99d594', '#3288bd']))
              .domain(bins);
        var colors = sales.map(function(value) {
            return chroma(scale(value)).hex();
        });
        result.type = 'bar';
        result.series = ['Product Category'];
        result.data = [sales];
        result.labels = labels;
        result.fillColor = [{
          fillColor: colors,
          strokeColor: colors
        }];

        return result;
      };

      return ZDAccess.queryProdCat(processData);
  }

  o.fillRTSTrend = function() {
      var processData = function(queryData) {
        result = {};

        var sales = queryData.map(function(item) {
            return item.current.metrics.price.sum.toFixed(0);
        });
        var plannedSales = queryData.map(function(item) {
            return item.current.metrics.plannedsales.sum.toFixed(0);
        });

        var labels = queryData.map(function(item, index) {
            var currentTime = moment(item.group[0] + 'Z','YYYY-MM-DD HH:mm:ssZ');
            return index % 5 ? "" : currentTime.format('HH:mm');
        }); 

        result.type = 'line';
        result.series = ['Sales', 'Planned Sales'];
        result.data = [sales, plannedSales];
        result.labels = labels;
        result.fillColor = ['#2b83ba', '#fdae61'];

        return result;
      }

      return ZDAccess.querySalesTrend(processData);
  }

  o.fillRTSTrend2 = function() {
    visuals[5].config.zd_height = windowSize.height;
    visuals[5].config.zd_width = windowSize.width;

    var processData = visuals[5].processData.bind(visuals[5].config);

    return ZDAccess.querySalesTrend(processData);
  }

  o.fillRTSDayTrend = function() {
      var processData = function(queryData) {
        result = {};

        var sales = queryData.map(function(item) {
            return item.current.metrics.price.sum.toFixed(0);
        });
        var plannedSales = queryData.map(function(item) {
            return item.current.metrics.plannedsales.sum.toFixed(0);
        });

        var labels = queryData.map(function(item, index) {
            return moment(item.group[0],'YYYY-MM-DD HH:mm:ss')
                  .format('MM/DD/YYYY');
        }); 

        result.type = 'line';
        result.series = ['Sales', 'Planned Sales'];
        result.data = [sales, plannedSales];
        result.labels = labels;
        result.fillColor = ['#2b83ba', '#fdae61'];

        return result;
      }

      return ZDAccess.queryDaySalesTrend(processData);
  }

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
    var processData = function(queryData) {
      var result = {};

      var data = reduceTwoDimResult(queryData);

      var config = {
          debug: true,
          width: windowSize.width,
          height: windowSize.height,
          showXAxis: true,
          showYAxis: true,
          showLegend: true,
          grid: {
            x: 30,
            y: 30,
            x2: 20,
            y2: 20
          },
          stack: false,
          yAxis: {axisLine: {show: true} },
          xAxis: {axisLine: {show: true} },
          tooltip: {
            formatter: function (params) {
              return params[0] + '<br/>'
                     + params[1] + ' : ' + numeral(params.value).format('0.000') + '<br/>';
            }
          },
          legend: {
            show: true
          }
      };
      result.config = config;
      result.data = data;

      return result;
    };

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

  return o;
  
});

