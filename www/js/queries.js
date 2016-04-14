angular.module('starter.queries', ['starter.config'])
.factory('Rts', function($q, serverConfig, queryConfig) {
	var o = {};
	
	o.genericQuery = function(query) {
	    return function(processData) {
	    	return $q(function (resolve, reject){
	    		var queryData = [];
				if (!window.ZoomdataSDK) {
					console.log('ERROR: ZoomdataSDK is not available');
				} 
				window.ZoomdataSDK.createClient({
				  credentials: serverConfig.credentials,
				  application: serverConfig.application
				})
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
	o.queryProdGroup = o.genericQuery(queryConfig.prodGroupQuery);
	o.queryProdCat = o.genericQuery(queryConfig.prodCatQuery);
	o.querySalesTrend = o.genericQuery(queryConfig.salesTrendQuery);
	o.queryDaySalesTrend = o.genericQuery(queryConfig.salesDayTrendQuery);

    return o;

  }
);