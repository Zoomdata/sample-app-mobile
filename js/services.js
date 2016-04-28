angular.module('starter.services', ['starter.queries','starter.config'])
.factory('Charts', function($window, $state, windowSize, ZDAccess, visualizations) {

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
      face: 'img/rts.png',
      continuosUpdate: true,
      updateRate: 4000,
      visuals: [
        {
          id: 0,
          title: 'Avg Satisfaction - Rolling Hour',
          config: null
        },
        {
          id: 1,
          title: 'Actual vs. Planned - Rolling Hour',
          config: null
        }, 
        {
          id: 2,
          title: 'Sales by Category - Rolling Hour',
          config: null      
        }, 
        {
          id: 3,
          title: 'Transactions by Group - Today',
          config: null
        },
        {
          id: 4,
          title: 'Actual vs. Planned - Rolling 7 Days',
          config: null       
        }
      ],
      functions: []
    }, {
      id: 1,
      name: 'Peer Lending',
      lastText: 'Default Propensity Analysis',
      face: 'img/securities.png',
      continuosUpdate: false,
      updateRate: -1,
      visuals: [
        {
          id: 0,
          title: 'Number of Loans by State',
          config: null
        },
        {
          id: 1,
          title: 'Total Payment vs Loan Amount',
          config: null
        },
        {
          id: 2,
          title: 'Loans by Grade',
          config: null
        }
      ],
      functions: []
    }, {
      id: 2,
      name: 'Fusion Dashboard',
      lastText: 'Multi-source ticket marketplace fusion',
      face: 'img/fusion.png',
      continuosUpdate: false,
      updateRate: -1,
      visuals: [],
      functions: []
    }]
  };

  o.initDashboards = function() {
    o.dashboards[0].functions = [
        o.fillRTSSentimentBars,
        o.fillRTSTrend,
        o.fillRTSBar,
        o.fillRTSPie,
        o.fillRTSDayTrend
    ];
    o.dashboards[1].functions = [
        o.fillLCLoansByState,
        o.fillLCTrend,
        o.fillLCLoansByGrade
    ]
  }

  o.fillLCLoansByState = function() {
      var visual = prepareVisual(1, 0, 'treeMap');
      var processData = function(queryData) {
        console.log(queryData);
        var propensity = queryData.map(function(item) {
          return +item.current.metrics.calc_default_propensity.calc.toFixed(2);
        });

        var data = queryData.map(function(item) {
          return {value: item.current.count, name: item.group[0]};
        });

        visual.config.series[0].data = data;

        return visual.config;
      };

      return ZDAccess.queryLendingClubByState(processData);
  }

  o.fillLCTrend = function() {
    var visual = prepareVisual(1, 1, 'trend');
    var processData = function(queryData) {
        var totalPmt = queryData.map(function(item) {
            return item.current.metrics.total_pymnt.sum.toFixed(0);
        });
        var loanAmt = queryData.map(function(item) {
            return item.current.metrics.loan_amnt.sum.toFixed(0);
        });

        var labels = queryData.map(function(item, index) {
            var currentTime = moment(item.group[0],'YYYY-MM-DD HH:mm:ss');
            return currentTime.format('MM/DD/YYYY');
        }); 

        visual.config.series[0].name = 'Total Payment';
        visual.config.series[1].name = 'Loan Amount';
        visual.config.legend.data = [visual.config.series[0].name, visual.config.series[1].name];
        visual.config.series[0].data = totalPmt;
        visual.config.series[1].data = loanAmt;
        visual.config.xAxis[0].data = labels;
        visual.config.yAxis[0].axisLabel.formatter = bigMoneyFormatter;

        return visual.config;
    }

    return ZDAccess.queryLendingClubTrend(processData);    
  }

  o.fillLCLoansByGrade = function() {
      var visual = prepareVisual(1, 2, 'pie');

      var processData = function(queryData) {
        var data = queryData.map(function(item) {
          return {value: item.current.count, name: item.group[0]};
        });
        visual.config.series[0].name = 'Loans by Grade';
        visual.config.series[0].data = data;

        return visual.config;
      };

      return ZDAccess.queryLendingClubByGrade(processData);  
  }

  o.fillRTSPie = function() {
      var visual = prepareVisual(0, 3, 'pie');

      var processData = function(queryData) {
        var data = queryData.map(function(item) {
          return {value: item.current.count, name: item.group[0]};
        });

        visual.config.series[0].name = 'Product Group';
        visual.config.series[0].data = data;

        return visual.config;
      };

      return ZDAccess.queryProdGroup(processData);
  }

  o.fillRTSBar = function() {
      var visual = prepareVisual(0, 2, 'bars');
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
        visual.config.series[0].name = 'Product Category';
        visual.config.series[0].data = sales;
        visual.config.xAxis[0].data = labels
        visual.config.yAxis[0].axisLabel.formatter = bigMoneyFormatter;

        return visual.config;
      };

      return ZDAccess.queryProdCat(processData);
  }

  o.fillRTSTrend = function() {
    var visual = prepareVisual(0, 1, 'trend');
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

        visual.config.series[0].name = 'Sales';
        visual.config.series[1].name = 'Planned Sales';
        visual.config.legend.data = [visual.config.series[0].name, visual.config.series[1].name];
        visual.config.series[0].data = sales;
        visual.config.series[1].data = plannedSales;
        visual.config.xAxis[0].data = labels;
        visual.config.yAxis[0].axisLabel.formatter = bigMoneyFormatter;

        return visual.config;
    }

    return ZDAccess.querySalesTrend(processData);
  }

  o.fillRTSDayTrend = function() {
      var visual = prepareVisual(0, 4, 'trend');
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

          visual.config.series[0].name = 'Sales';
          visual.config.series[1].name = 'Planned Sales';
          visual.config.legend.data = [visual.config.series[0].name, visual.config.series[1].name];
          visual.config.series[0].data = sales;
          visual.config.series[1].data = plannedSales;
          visual.config.xAxis[0].data = labels;
          visual.config.yAxis[0].axisLabel.formatter = bigMoneyFormatter;

          return visual.config;
      }

      return ZDAccess.queryDaySalesTrend(processData);
  }

  o.fillRTSSentimentBars = function() {
    var visual = prepareVisual(0, 0, 'groupedBars');
    var processData = function(queryData) {
      var data = reduceTwoDimResult(queryData);
      visual.config.series[0].name = data[0].name;
      visual.config.series[1].name = data[1].name;
      visual.config.legend.data = [data[0].name, data[1].name];

      var labels = data[0].datapoints.map(function(item, index) {
        return item.x;
      });
      var series0 = data[0].datapoints.map(function(item, index) {
        return item.y;
      });
      var series1 = data[1].datapoints.map(function(item, index) {
        return item.y;
      });
      visual.config.series[0].data = series0;
      visual.config.series[1].data = series1;

      visual.config.xAxis[0].data = labels;

      return visual.config;
    }

    return ZDAccess.querySentiment(processData);
  }

  var prepareVisual = function(dashId, visId, visType) {
      var visual = o.dashboards[dashId].visuals[visId];
      if (!visual.config) {
        // visuals[visId].config should become pie.config, bar.config, etc.
        // maybe passed as a parameter
        visual.config = angular.copy(visualizations[visType].config);
      }
      visual.config.zd_height = windowSize.height;
      visual.config.zd_width = windowSize.width;   

      return visual; 
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

  o.getVisuals = function(dash) {
    return dash.visuals;
  }

  o.logout = function() {
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

