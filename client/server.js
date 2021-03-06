var config = require('../config');

var http = require('http');
var debug = require('debug')('server:server');
var path = require("path");
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var pug = require('pug');
var fs = require('fs');

var fbHelper = require('./helpers/facebookAnswerBuilder');

var mongoose = require('mongoose');

mongoose.connect(config.mongoUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected correctly to MongoDB");
});

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('port', config.portClient);
app.set('mode', 'development');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-session-id, x-device-id");
  next();
});

// REST Routes
var images = require('./routes/images');
app.use('/images', images);
var client = require('./routes/client');
app.use('/api/client', client);
var startPage = require('./routes/startPage');
app.use('/api/start-page', startPage);
var products = require('./routes/products');
app.use('/api/products', products);
var translation = require('./routes/translation');
app.use('/api/translation', translation);
var brands = require('./routes/brands');
app.use('/api/brands', brands);
var categories = require('./routes/categories');
app.use('/api/categories', categories);
var tags = require('./routes/tags');
app.use('/api/tags', tags);
var shops = require('./routes/shops');
app.use('/api/shops', shops);
var search = require('./routes/search');
app.use('/api/search', search);
var topNavigationMenus = require('./routes/topNavigationMenus');
app.use('/api/top-navigation-menus', topNavigationMenus);
var shopGroups = require('./routes/shopGroups');
app.use('/api/shop-groups', shopGroups);
var subscribe = require('./routes/newsletterSubscribers');
app.use('/api/subscribe', subscribe);
var similar = require('./routes/similar');
app.use('/api/similar', similar);
var prices = require('./routes/prices');
app.use('/api/prices', prices);


// Facebook crawler case
app.get('*', (req, res, next) => {
//
  let url = req.protocol + '://' + req.get('host') + req.originalUrl;
  let userAgent = req.headers['user-agent'];
  if (userAgent) {
    fbHelper.facebookAnswer(userAgent, url, (err, result) => {
      if (err) {
        next(err);
      }
      if (result) {
        console.log(result);
        res.end(result);
      } else {
        next();
      }
    });
  } else next();
});

// Angular client
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});



// Error cases
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  
  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

var server = http.createServer(app);

server.listen(app.get('port'), function() {
  console.log('Server listening on port', app.get('port'));
});
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
  
    var bind = typeof app.get('port') === 'string'
      ? 'Pipe ' + app.get('port')
      : 'Port ' + app.get('port');
  
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
  
  function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    debug('Listening on ' + bind);
  }