angular.module('starter.queries', [])
.factory('Rts', function($q, ZDClient) {
	var o = {
		prodGroupQuery: {
			source: 'Real Time Sales',
			cfg: {
		       tz: 'EST',
		       player: {
		         speed: 1,
		         pauseAfterRead: true,
		         timeWindowScale: 'ROLLING'
		       },
		       time: {
		         timeField: '_ts'
		       },
		       filters: [],
		       groups: [{
		         name: 'group',
		         limit: 20,
		         sort: {
		           dir: 'desc',
		           name: 'count'
		         }
		       }],
		       metrics: [{
		         name: 'price',
		         func: 'sum'
		        }]
		    }
		},
		prodCatQuery: {
			source: 'Real Time Sales',
			cfg: {
		       tz: 'EST',
		       player: {
		         speed: 1,
		         pauseAfterRead: true,
		         timeWindowScale: 'ROLLING'
		       },
		       time: {
		         timeField: '_ts'
		       },
		       filters: [],
		       groups: [{
		         name: 'category',
		         limit: 10,
		         sort: {
	              'name': 'price',
	              'dir': 'desc',
	              'metricFunc': 'sum'
		         }
		       }],
		       metrics: [
		          {
		            'name': 'price',
		            'func': 'sum'
		          }
		        ]
		    }			
		},
		salesTrendQuery: {
			source: 'Real Time Sales',
			cfg: {
				filters: [],
				player: {
		         pauseAfterRead: true,
		         timeWindowScale: 'ROLLING'
		       },
		       time: {
		         timeField: '_ts'
		       },
		       groups: [{
		         name: '$to_minute(_ts)',
		         sort: {
	              'dir': 'asc',
	              'name': '_ts'
		         },
		         'limit': 1000
		       }],
		       metrics: [
		          {
		            'name': 'price',
		            'func': 'sum'
		          },
		          {
		            'name': 'plannedsales',
		            'func': 'sum'
		          }
		        ]
			}
		},
		salesDayTrendQuery: {
			source: 'Real Time Sales',
			cfg: {
				filters: [],
				player: {
		         pauseAfterRead: true,
		         timeWindowScale: 'PINNED'
		       },
		       time: {
		       	 from: '+$now_-7_day',
      			 to: '+$now',
		         timeField: '_ts'
		       },
		       groups: [{
		         name: '$to_day(_ts)',
		         sort: {
	              'dir': 'asc',
	              'name': '_ts'
		         },
		         'limit': 1000
		       }],
		       metrics: [
		          {
		            'name': 'price',
		            'func': 'sum'
		          },
		          {
		            'name': 'plannedsales',
		            'func': 'sum'
		          }
		        ]
			}			
		}
	};

	o.genericOldQuery = function(query) {
	    return function(processData) {
	    	return $q(function (resolve, reject){
				ZDClient
				.then(function(client) {
				  window.client = client;
				  return client.createQuery(
				    {name: query.source},
				    query.cfg
				  );
				})
				.then( function(result) {
				    return window.client.runQuery(result, function(queryData) {
				    	resolve(processData(queryData));
				    });
				})
				.catch( function (error) {
				      // The client library returns user friendly error messages
				      console.log( 'Error: ' + error );
				      reject(error);
				})
				;
	    	});
	    };
	}

	o.genericQuery = function(query) {
	    return function(processData) {
	    	return $q(function (resolve, reject){
	    		let queryData = [];
				ZDClient
				.then(function(client) {
				  window.client = client;
				  return client.createQuery(
				    {name: query.source},
				    query.cfg
				  );
				})
				.then( function(result) {
				    return window.client.run(result);
				})
				.then( function(thread) {      
					// console.log( thread );  
					thread.on('thread:message', function(data) {
						queryData = data;
					})
					thread.on('thread:notDirtyData', function() {
						resolve(processData(queryData));
					})
					thread.on('thread:exeption', function(error) {
						reject(error);
            		});
				})
				.catch( function (error) {
				      // The client library returns user friendly error messages
				      console.log( 'Error: ' + error );
				      reject(error);
				})
				;
	    	});
	    };		
	}

	// currying for different query configurations
	o.queryProdGroup = o.genericQuery(o.prodGroupQuery);
	o.queryProdCat = o.genericQuery(o.prodCatQuery);
	o.querySalesTrend = o.genericQuery(o.salesTrendQuery);
	o.queryDaySalesTrend = o.genericQuery(o.salesDayTrendQuery);

    return o;

  }
);