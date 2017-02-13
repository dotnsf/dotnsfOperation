//. app.js
var express = require( 'express' ),
    basicAuth = require( 'basic-auth-connect' ),
    bodyParser = require( 'body-parser' ),
    cfenv = require( 'cfenv' ),
    uuid = require( 'uuid' ),
    appEnv = cfenv.getAppEnv(),
    app = express();

app.use( bodyParser.urlencoded( {
    extended: true
}));
app.use( bodyParser.json() );

//. API Version
const X_BROKER_API_VERSION = 2.0;
const X_BROKER_API_VERSION_NAME = 'X-Broker-Api-Version';

//. Plans
const plan0 = {
  'id': uuid.v4(),
  'name': 'free',
  'description': 'Free plan',
  'free': true
};
const plan1 = {
  'id': uuid.v4(),
  'name': 'enterprise',
  'description': 'Enterprise plan',
  'free': false
};

//. service endpoint
var service_host = 'dotnsf-operation.mybluemix.net'; //'148.100.4.193';
var service_port = appEnv.port ? appEnv.port : 1337;
var service_base = service_host; // + ':' + service_port;
var service_instance = 'http://' + service_base + '/operation/';
var service_dashboard = 'http://' + service_base + '/operation/dashboard';

//. Service
var my_service_id = uuid.v4();
var my_service = {
  'id': my_service_id,
  'name': 'dotnsf-operation-service',
  'description': '四則演算 API',
  'bindable': true,
  'tags': [ 'private' ],
  'plans': [ plan0, plan1 ],
  'dashboard_client': {
    'id': uuid.v4(),
    'secret': 'secret-1',
    'redirect_uri': 'http://bluemix.net'
  },
  'metadata': {
    'displayName': 'My operational service',
    'longDescription': 'WebAPI で四則演算を行う',
    'providerDisplayName': 'dotnsf',
    'documenttationUrl': 'http://' + service_base + '/doc',
    'supportUrl': 'https://stackoverflow.com/questions/tagged/ibm-bluemix'
  }
};


//. Auth for /v2/*
const auth_user = 'username';
const auth_pass = 'password';
app.all( '/v2/*', basicAuth( function( username, password ){
  return username === auth_user && password === auth_pass;
}));


//. Cloud Foundry Broker APIs

//. Catalog
app.get( '/v2/catalog', function( req, res ){
  console.log( 'GET /v2/catalog' );

  var api_version = req.get( X_BROKER_API_VERSION_NAME );
  if( !api_version || X_BROKER_API_VERSION > parseFloat( api_version ) ){
    res.writeHead( 412, [ { 'Content-Type': 'text/plain' } ] );
    res.write( 'Precondition failed. Missing or imcompatible ' + X_BROKER_API_VERSION_NAME + '. Expecting version ' + X_BROKER_API_VERSION + ' or later.' );
    res.end();
  }else{
    var services = {};
    services['services'] =[];
    services['services'][0] = my_service;
    res.writeHead( 200, [ { 'Content-Type': 'application/json' } ] );
    res.write( JSON.stringify( services ) );
    res.end();
  }
});

//. Provision
app.put( '/v2/service_instances/:instance_id', function( req, res ){
  var instance_id = req.params.instance_id;

  var contentType = req.get( 'Content-Type' );
  if( contentType != 'application/json' ){
    res.writeHead( 415, [ { 'Content-Type': 'text/plain' } ] );
    res.write( 'Unsupported Content-Type: expecting application/json.' );
    res.end();
  }

  var provision_details = req.body;
  //. {
  //    "service_id": "<service-guid>",
  //    "plan_id": "<plan-guid>",
  //    "organization_guid": "<org-guid>",
  //    "space_guid": "<space-guid>"
  //  }
  console.log( 'PUT /v2/service_instances/' + instance_id );
  console.log( provision_details );

  //. Provisioning process here.

  //. Return basic service information
  var new_service = {};
  //new_service['dashboard_url'] = service_dashboard + '/' + instance_id;
  new_service['dashboard_url'] = service_dashboard + '/' + instance_id;
  res.writeHead( 200, [ { 'Content-Type': 'application/json' } ] );
  res.write( JSON.stringify( new_service ) );
  res.end();
});


//. Deprovision
app.delete( '/v2/service_instances/:service_id', function( req, res ){
  var service_id = req.params.service_id;

  console.log( 'DELETE /v2/service_instances/' + service_id );

  //. Deprovisioning process here.

  //. Return basic information
  res.writeHead( 200, [ { 'Content-Type': 'application/json' } ] );
  res.write( JSON.stringify( {} ) );
  res.end();
});

//. Bind
app.put( '/v2/service_instances/:service_id/service_bindings/:binding_id', function( req, res ){
  var service_id = req.params.service_id;
  var binding_id = req.params.binding_id;

  var contentType = req.get( 'Content-Type' );
  if( contentType != 'application/json' ){
    res.writeHead( 415, [ { 'Content-Type': 'text/plain' } ] );
    res.write( 'Unsupported Content-Type: expecting application/json.' );
    res.end();
  }

  var binding_details = req.body;
  //. {
  //    "plan_id": "<plan-guid>",
  //    "service_id": "<service-guid>",
  //    "app_guid": "<app-guid>"
  //  }
  console.log( 'PUT /v2/service_instances/' + service_id + '/service_bindings/' + binding_id );
  console.log( binding_details );

  //. Binding process here.

  //. Return result to the Bluemix Cloud Controller
  var result = {};
  result['credentials'] = {};
  result['credentials']['uri'] = 'http://' +  service_base + '/';
  res.writeHead( 200, [ { 'Content-Type': 'application/json' } ] );
  res.write( JSON.stringify( result ) );
  res.end();
});

//. Unbind
app.delete( '/v2/service_instances/:service_id/service_bindings/:binding_id', function( req, res ){
  var service_id = req.params.service_id;
  var binding_id = req.params.binding_id;

  console.log( 'DELETE /v2/service_instances/' + service_id + '/service_bindings/' + binding_id );

  //. Unbinding process here.

  //. Return basic information
  res.writeHead( 200, [ { 'Content-Type': 'application/json' } ] );
  res.write( JSON.stringify( {} ) );
  res.end();
});



//. Service related functions
app.all( '/operation/:instance_id', function( req, res ){
  var instance_id = req.params.instance_id;

  console.log( req.method + ' /operation/' + instance_id );

  //. Return service information
  var service_info = {};
  service_info['greeting'] = instance_id;
  res.writeHead( 200, [ { 'Content-Type': 'application/json' } ] );
  res.write( JSON.stringify( service_info ) );
  res.end();
});

app.get( '/operation/dashboard/:instance_id', function( req, res ){
  var instance_id = req.params.instance_id;

  console.log( req.method + ' /operation/' + instance_id );

  //. Return hard-coded HTML
  var html = '見つかっちゃった。。。(*/ω＼*)';
  res.writeHead( 200, [ { 'Content-Type': 'text/html; charset=UTF8' } ] );
  res.write( html );
  res.end();
});

app.all( '/operation/:instance_id/:binding_id', function( req, res ){
  var instance_id = req.params.instance_id;
  var binding_id = req.params.binding_id;

  var contentType = req.get( 'Content-Type' );
  if( contentType != 'application/json' ){
    res.writeHead( 415, [ { 'Content-Type': 'text/plain' } ] );
    res.write( 'Unsupported Content-Type: expecting application/json.' );
    res.end();
  }

  //. Return service information
  var service_info = {};
  service_info['instance_id'] = instance_id;
  service_info['binding_id'] = binding_id;
  res.writeHead( 200, [ { 'Content-Type': 'application/json' } ] );
  res.write( JSON.stringify( service_info ) );
  res.end();
});



//. Service APIs
app.get( '/', function( req, res ){
  var html = '<title>My Broker</title>';
  html += '<h1>My Broker</h1>';
  html += '<p>ドキュメントは<a target="_blank" href="./doc">こちら</a>を参照ください</p>';
  res.writeHead( 200, [ { 'Content-Type': 'text/html; charset=UTF8' } ] );
  res.write( html );
  res.end();
});

app.get( '/:operation/:x/:y', function( req, res ){
  var operation = req.params.operation;
  var x = parseFloat( req.params.x );
  var y = parseFloat( req.params.y );
  var z = 0;

  if( operation == 'plus' ){
    z = x + y;
  }else if( operation == 'minus' ){
    z = x - y;
  }else if( operation == 'multiply' ){
    z = x * y;
  }else if( operation == 'divide' ){
    z = x / y;
  }

  res.writeHead( 200, [ { 'Content-Type': 'text/plain' } ] );
  res.write( '' + z );
  res.end();
});

app.get( '/doc', function( req, res ){
  var html = '<title>My Operation Document</title>';
  html += '<h1>My Operation Document</h1>';
  html += '<p>This is a document for my operation</p>';
  html += '<hr/>';
  html += '/plus/x/y => return ( x + y )<br/>';
  html += '/minus/x/y => return ( x - y )<br/>';
  html += '/multiply/x/y => return ( x + y )<br/>';
  html += '/divide/x/y => return ( x / y )<br/>';
  res.writeHead( 200, [ { 'Content-Type': 'text/html; charset=UTF8' } ] );
  res.write( html );
  res.end();
});

app.listen( service_port );
console.log( "server starting on " + service_port );



