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
		}
	};

	o.genericQuery = function(query) {
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

	// currying 
	o.queryProdGroup = o.genericQuery(o.prodGroupQuery);
	o.queryProdCat = o.genericQuery(o.prodCatQuery);

    return o;

  }
);