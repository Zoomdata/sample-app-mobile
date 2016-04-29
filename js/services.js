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
      name: 'Ticket Sales',
      lastText: 'Multi-source ticket marketplace fusion',
      face: 'img/fusion.png',
      continuosUpdate: false,
      updateRate: -1,
      visuals: [
        {
          id: 0,
          title: 'Tickets Sold and Transactions',
          config: null
        },
        {
          id: 1,
          title: 'Ticket Sales by State',
          config: null
        },
        {
          id: 2,
          title: 'Sales vs Commission',
          config: null
        }
      ],
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
    ];
    o.dashboards[2].functions = [
        o.fillTSalesQtyTrend,
        o.fillTSalesPriceCommissionTrend,
        o.fillTSalesByState
    ];
  }

  o.fillTSalesQtyTrend = function() {
    var visual = prepareVisual(2, 0, 'trend');
    var processData = function(queryData) {
        var qtySold = queryData.map(function(item) {
            return item.current.metrics.qtysold.sum.toFixed(0);
        });
        var counts = queryData.map(function(item) {
          return item.current.count;
        });

        var labels = queryData.map(function(item, index) {
            var currentTime = moment(item.group[0],'YYYY-MM-DD HH:mm:ss');
            return currentTime.format('MM/DD/YYYY');
        }); 

        visual.config.series[0].name = 'Tickets Sold';
        visual.config.series[1].name = 'Transactions';
        visual.config.legend.data = [visual.config.series[0].name, visual.config.series[1].name];
        visual.config.series[0].data = qtySold;
        visual.config.series[1].data = counts;
        visual.config.xAxis[0].data = labels;
        visual.config.yAxis[0].axisLabel.formatter = qtyFormatter;
        visual.config.tooltip.formatter = multiSeriesTooltipQtyFormatter;

        return visual.config;
    }

    return ZDAccess.queryTicketQuantityTrend(processData);    
  }

  o.fillTSalesByState = function() {
    var visual = prepareVisual(2, 1, 'treeMap');
      var processData = function(queryData) {
        var data = queryData.map(function(item) {
          return {value: +item.current.metrics.pricepaid.sum.toFixed(2), 
                  name: item.group[0]};
        });

        visual.config.series[0].data = data;
        visual.config.series[0].name = 'Sales Amount';
        visual.config.tooltip.formatter = tooltipMoneyFormatter;

        return visual.config;
      };

      return ZDAccess.queryTicketSalesByState(processData);
  }

  o.fillTSalesPriceCommissionTrend = function() {
    var visual = prepareVisual(2, 2, 'trend');
    var processData = function(queryData) {
        var price = queryData.map(function(item) {
            return item.current.metrics.pricepaid.sum.toFixed(0);
        });
        var commission = queryData.map(function(item) {
            return item.current.metrics.commission.sum.toFixed(0);
        });

        var labels = queryData.map(function(item, index) {
            var currentTime = moment(item.group[0],'YYYY-MM-DD HH:mm:ss');
            return currentTime.format('MM/YYYY');
        }); 

        visual.config.series[0].name = 'Sales';
        visual.config.series[1].name = 'Commission';
        visual.config.legend.data = [visual.config.series[0].name, visual.config.series[1].name];
        visual.config.series[0].data = price;
        visual.config.series[1].data = commission;
        visual.config.xAxis[0].data = labels;
        visual.config.yAxis[0].axisLabel.formatter = bigMoneyFormatter;
        visual.config.tooltip.formatter = multiSeriesTooltipMoneyFormatter;

        return visual.config;
    }

    return ZDAccess.queryTicketPriceCommission(processData);    
  }

  o.fillLCLoansByState = function() {
      var visual = prepareVisual(1, 0, 'treeMap');
      var processData = function(queryData) {
        var propensity = queryData.map(function(item) {
          return +item.current.metrics.calc_default_propensity.calc.toFixed(2);
        });

        var data = queryData.map(function(item) {
          return {value: item.current.count, name: item.group[0]};
        });

        visual.config.series[0].data = data;
        visual.config.series[0].name = 'Number of Loans';
        visual.config.tooltip.formatter = tooltipCountFormatter;

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
        visual.config.tooltip.formatter = multiSeriesTooltipMoneyFormatter;

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
        visual.config.tooltip.formatter = multiSeriesTooltipMoneyFormatter;

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
          visual.config.tooltip.formatter = multiSeriesTooltipMoneyFormatter;

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

  var numberFormatter = function(isMoney) {
    return function (v) {
      var fmtPattern = isMoney ? '$0,0' : '0,0';
      result = numeral(v).format(fmtPattern);
      return result;
    }   
  }
  var qtyFormatter = numberFormatter(false);
  var moneyFormatter = numberFormatter(true);

  var bigNumberFormatter = function(isMoney) {
    return function (v) {
      var fmtPattern = isMoney ? '$0,0' : '0,0';
      if (v > 9999999) {
        result = numeral(v/1000000).format(fmtPattern) + ' M';
      } else if (v > 999999 ) {
        result = numeral(v/1000000).format(fmtPattern + '.0') + ' M';
      } else if (v > 999) {
        result = numeral(v/1000).format(fmtPattern) + ' K';
      } else {
        result = numeral(v).format(fmtPattern);
      }
      return result;
    }
  }
  var bigMoneyFormatter = bigNumberFormatter(true);
  var bigQtyFormatter = bigNumberFormatter(false);

  var genericTooltipFormatter = function(isMoney) {
    return function(params) {
      var fmtPattern = isMoney ? '$0,000.' : '0,000.';
      return params.seriesName + '<br/>'
           + params.name + ' : ' + numeral(params.value).format(fmtPattern) + '<br/>';
    }
  }
  var tooltipCountFormatter = genericTooltipFormatter(false);
  var tooltipMoneyFormatter = genericTooltipFormatter(true);

  var genericMultiSeriesTooltipFormatter = function(isMoney) {
    return function(params) {
      var fmtPattern = isMoney ? '$0,000.' : '0,000.';
      return params[0].name + '<br/>'
           + params[0].seriesName + ' : ' + numeral(params[0].value).format(fmtPattern) + '<br/>'
           + params[1].seriesName + ' : ' + numeral(params[1].value).format(fmtPattern) + '<br/>';       
    }
  }
  var multiSeriesTooltipMoneyFormatter = genericMultiSeriesTooltipFormatter(true);
  var multiSeriesTooltipQtyFormatter = genericMultiSeriesTooltipFormatter(false);

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

