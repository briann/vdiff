var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var debug = require('debug')('vdiff');
var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var path = require('path');

var ApiRouter = require('./api/router');
var PlansApi = require('./api/plans_api');
var ExecutionsApi = require('./api/executions_api');

var VdiffServer = function(port, staticDirectory) {
  this._port = port;
  this._staticDirectory = staticDirectory;
};

VdiffServer.prototype.run = function() {
  var app = express();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'hbs');

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use(require('less-middleware')(this._staticDirectory));
  app.use(express.static(this._staticDirectory));

  var plansApi = new PlansApi();
  var executionsApi = new ExecutionsApi();
  var apiRouter = new ApiRouter(plansApi, executionsApi);
  app.use('/api', apiRouter.getRouter());

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

  app.set('port', this._port);
  var server = app.listen(app.get('port'), function() {
    debug('VdiffServer started on port ' + server.address().port);
  });
};

module.exports = VdiffServer;
