//. app0.js
var express = require( 'express' ),
    cfenv = require( 'cfenv' ),
    appEnv = cfenv.getAppEnv(),
    app = express();


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

var service_port = appEnv.port ? appEnv.port : 1337;
app.listen( service_port );
console.log( "server starting on " + service_port );



