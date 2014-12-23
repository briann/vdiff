#!/usr/bin/env node
var VdiffServer = require('./server/vdiff_server');
var debug = require('debug')('vdiff');
var nconf = require('nconf');
var path = require('path');

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
  var vdiffServer = new VdiffServer(path.join(__dirname, 'public'));
  vdiffServer.run();
}

configure();
start();
