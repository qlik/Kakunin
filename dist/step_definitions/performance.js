'use strict';

var _cucumber = require('cucumber');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _config = require('../helpers/config.helper');

var _config2 = _interopRequireDefault(_config);

var _timeToFirstByteAnalyser = require('../helpers/time-to-first-byte-analyser.helper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const browsermob = require('browsermob-proxy').Proxy;
const fs = require('fs');
let proxy;

(0, _cucumber.defineSupportCode)(function ({ When, Then }) {
  When(/^I start performance monitor mode$/, function () {
    proxy = new browsermob({
      port: _config2.default.browserMob.serverPort
    });

    let proxyReady = false;
    proxy.start(_config2.default.browserMob.port, (err, data) => {
      if (!err) {
        proxy.startHAR(_config2.default.browserMob.port, 'test', true, true, () => {
          proxyReady = true;
        });
      } else {
        console.error(err);
      }
    });

    browser.driver.wait(() => {
      return proxyReady;
    });
  });

  When(/^I save performance report file as "([^"]*)"$/, function (fileName) {
    const uniqueFileName = `${fileName}-${Date.now()}.har`;
    let proxyDone = false;

    proxy.getHAR(_config2.default.browserMob.port, (err, resp) => {
      if (!err) {
        console.log(`har saved at ${uniqueFileName}`);
        fs.writeFileSync(`reports/performance/${uniqueFileName}`, resp, 'utf8');
      } else {
        console.err('Error getting HAR file: ' + err);
      }
      proxy.stop(_config2.default.browserMob.port, () => {
        proxyDone = true;
      });
    });

    return browser.driver.wait(() => {
      return this.performanceReportFile = uniqueFileName, proxyDone;
    });
  });

  Then(/^the requests should take a maximum of "([^"]*)" milliseconds$/, function (maxTiming) {
    const slowRequests = _timeToFirstByteAnalyser.analyser.checkTiming(this.performanceReportFile, maxTiming);

    if (slowRequests === null) {
      return Promise.reject('Report file contains incorrect data!');
    }

    if (slowRequests.length > 0) {
      slowRequests.forEach(item => {
        console.log(_chalk2.default.white.bgRed('\r\n', `Slow request:`, '\r\n', `URL: ${item.url}`, '\r\n', `TTFB: ${item.ttfb.toFixed(2)} ms`, '\r\n'));
      });

      return Promise.reject('TTFB value is too big! Details available above.');
    }

    return Promise.resolve();
  });
});