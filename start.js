#!/usr/bin/env node
var VdiffServer = require('./server/vdiff_server');
var debug = require('debug')('vdiff');
var nconf = require('nconf');
var path = require('path');
var models = require('./server/models');

function configure() {
  // In order of priority, first being most important.
  nconf.argv();
  nconf.env();

  var configFile = path.join(__dirname, 'config.json');
  if (nconf.get('config')) {
    configFile = nconf.get('config');
  }
  nconf.file(configFile);

  // Defaults.
  nconf.defaults({
    'port': 3000
  });
}

function start() {
  var staticDirectory = path.join(__dirname, 'public');

  // Things to initialize:
  // * Storage Service
  // * Screenshot Service

  var vdiffServer = new VdiffServer(
    nconf.get('port'),
    staticDirectory);
  vdiffServer.run();
}

configure();
models.sequelize.sync().then(start);
