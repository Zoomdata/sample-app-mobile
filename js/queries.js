angular.module('starter.queries', ['starter.config'])
.factory('ZDAccess', function($http, $q, ServerConfig, queryConfig) {
	var o = {};
	
	o.genericQuery = function(query) {
	    return function(processData) {
	    	return $q(function (resolve, reject){
	    		var queryData = [];
				if (!window.ZoomdataSDK) {
					console.log('ERROR: ZoomdataSDK is not available');
				} 
				window.ZoomdataSDK.createClient({
				  credentials: ServerConfig.get().credentials,
				  application: ServerConfig.get().application
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
	o.querySentiment = o.genericQuery(queryConfig.sentimentByGroupQuery);

	o.queryLendingClubTrend = o.genericQuery(queryConfig.lendingClubTrendQuery);
	o.queryLendingClubByGrade = o.genericQuery(queryConfig.lendingClubByGradeQuery);
	o.queryLendingClubByState = o.genericQuery(queryConfig.lendingClubByStateQuery);

	o.queryTicketSalesByState = o.genericQuery(queryConfig.ticketSalesByStateQuery);
	o.queryTicketQuantityTrend = o.genericQuery(queryConfig.ticketQuantityTrendQuery);
	o.queryTicketPriceCommission = o.genericQuery(queryConfig.ticketPriceCommission);

	var buildEndpoint = function(service) {
		var protocol = ServerConfig.get().application.secure ? 'https' : 'http';
		var hostname = ServerConfig.get().application.host;
		var port = ServerConfig.get().application.port;
		var path = ServerConfig.get().application.path;
		var endpoint = protocol + '://' + hostname + ":" + port + path + service;

		return endpoint;
	}

	o.logout = function() {
		// forget the current token
		ServerConfig.get().credentials.access_token = '';
		return $http.post(buildEndpoint('/logout'));
	}

    return o;

  }
);