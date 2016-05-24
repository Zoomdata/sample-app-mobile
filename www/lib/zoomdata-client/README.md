# Zoomdata Javascript SDK #

## API Keys

The Zoomdata Javascript SDK requires an API key to connect to a Zoomdata Server. Generate a new API key by sending an HTTP GET request to the Zoomdata Server.

**Note:** Make sure to replace your User Name, Password, the URL for your Zoomdata Server and the Data Source Name you want to use.
```ssh
curl -XGET --user USER_NAME:PASSWORD 'https://localhost:8443/zoomdata/service/sources/key?source=DATA_SOURCE_NAME' --insecure
```

## Install the library

```ssh
npm install zoomdata-client
```

`zoomdat-client` comes built as an UMD. You are able to use it both in a browser:

```html
<script src="node_modules/zoomdata-client/distribute/sdk/2.0/zoomdata-client.js" type="text/javascript"></script>
```

or as a commonJS module:

```javascript
var ZoomdataSDK = require('zoomdata-client');
```

## Create a Client

When instantiating a Zoomdata JS client, you need to supply connection properties as well as an authentication key. The `.createClient` function returns a [Javascript Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves to the client.

```javascript
var credentials = {
    key: API_KEY
};

var application = {
    secure: false,
    host: 'localhost',
    port: 8080,
    path: '/zoomdata'
};

ZoomdataSDK.createClient({
    credentials: credentials,
    application: application
}).then(function (client) {
    console.log('Validated:', client);
})
```

## Create a Query

When creating a Query, you need to supply a Data Source name as well as a query configuration.

The `.createQuery` function returns a [Javascript Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves to the validated Query.

```javascript
client.createQuery({name: 'Real Time Sales'}, {
    filters: [],
    groups: [{
        name: 'userincome',
        limit: 10
    }],
    metrics: []
});
```

### Query Configuration Details
A Query can be Grouped or Ungrouped.

An Ungrouped Query only requires an array of fields. _This configuration will return all records with just the **userincome** and **usergender** fields._
```javascript
{
    fields: ['userincome, usergender']
}
```

A Grouped Query requires an array of Groupings. Optionally, you can include an array of Metrics. _This configuration will group by the **userincome** field and calculate the **average** of the **usersentiment** field._
```javascript
{
    groups: [{
        name: 'userincome',
        limit: 10
    }],
    metrics: [{
        name: 'usersentiment',
        func: 'avg'
    }]
}
```
All Queries can include an optional array of filters. _This configuration will filter only results with a **usersentiment** between **-0.5** and **0.5**_.
```javascript
{
    filters: [{
        path: 'usersentiment',
        operation: 'BETWEEN',
        value: [-0.5, 0.5]
    }]
}
```

## Run a Query

When running a Query, you must provide a callback that receives new data as it arrives from the Zoomdata Server.

```javascript
client.runQuery(query, function(data) {
    console.log(data);
});
```

## Embed a Chart

When embedding a Chart, you must provide an HTML element to embed the chart into, a query to run for the chart, the name of the visualization, and an object for overriding Chart Variables.

**Note:** You can find variable names and values in your Zoomdata Server's Source Configuration Page.

```javascript
var variables = {
    'Size': 'count'
};

client.visualize({
    element: document.body,
    query: query,
    visualization: 'Donut',
    variables: variables
});
```

## Example

```javascript
var credentials = {
    key: API_KEY
};

var application = {
    secure: false,
    host: 'localhost',
    port: 8080,
    path: '/zoomdata'
};

var variables = {
    'Size': 'count'
};

ZoomdataSDK.createClient({
    credentials: credentials,
    application: application
}).then(function (client) {
    client.createQuery({name: 'Real Time Sales'}, {
        filters: [],
        groupBy: [{
            name: 'userincome',
            limit: 10
        }],
        metrics: []
    }).then(function(query) {
        client.runQuery(query, function(data) {
            console.log(data);
        });

        client.visualize({
            element: document.body,
            query: query,
            visualization: 'Donut',
            variables: variables
        }).catch(onError);
    }).catch(onError);
}).catch(onError);

function onError(reason) {
    console.error(reason.stack || reason.statusText || reason);
}
```
