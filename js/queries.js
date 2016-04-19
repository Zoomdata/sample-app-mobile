angular.module('starter.queries', ['starter.config'])
.factory('ZDAccess', function($http, $q, serverConfig, queryConfig) {
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

	var buildEndpoint = function(service) {
		var protocol = serverConfig.application.secure ? 'https' : 'http';
		var hostname = serverConfig.application.host;
		var port = serverConfig.application.port;
		var path = serverConfig.application.path;
		var endpoint = protocol + '://' + hostname + ":" + port + path + service;

		return endpoint;
	}

	o.logout = function() {
		// forget the current token
		serverConfig.credentials.access_token = '';
		return $http.post(buildEndpoint('/logout'));
	}

    return o;

  }
);