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

// Too much stuff in start.js now...
function maybeSeedAgents() {
  var Agent = models.Agent;
  Agent.findOrCreate({
    where: {
      key: 'DESKTOP_CHROME'
    },
    defaults: {
      key: 'DESKTOP_CHROME',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
      width: 1280
    }
  });
  Agent.findOrCreate({
    where: {
      key: 'MOBILE_IOS_SAFARI'
    },
    defaults: {
      key: 'MOBILE_IOS_SAFARI',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4',
      width: 375
    }
  });
}

function syncDbAnd(syncDoneCallback) {
  var forceSync = nconf.get('FORCE_DB_SYNC') == 'true';
  models.sequelize.sync({ force: forceSync }).then(function() {
    maybeSeedAgents();
    syncDoneCallback();
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
syncDbAnd(start);
