var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var debug = require('debug')('vdiff');
var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var nconf = require('nconf');
var path = require('path');

var routes = require('./routes/index');
var users = require('./routes/users');

var VdiffServer = function(staticDirectory) {
  this._staticDirectory = staticDirectory;
};

VdiffServer.prototype.run = function() {
  var app = express();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'hbs');

  // uncomment after placing your favicon in /public
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use(require('less-middleware')(this._staticDirectory));
  app.use(express.static(this._staticDirectory));

  app.use('/', routes);
  app.use('/users', users);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });

  app.set('port', nconf.get('port'));
  var server = app.listen(app.get('port'), function() {
    debug('VdiffServer started on port ' + server.address().port);
  });
};

module.exports = VdiffServer;
