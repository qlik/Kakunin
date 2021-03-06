'use strict';

var _cucumber = require('cucumber');

(0, _cucumber.defineSupportCode)(function ({ Then, Given }) {
  Given(/^I visit the "([^"]*)" page$/, function (pageName) {
    expect(browser.page[pageName]).to.not.be.undefined;

    this.currentPage = browser.page[pageName];

    return this.currentPage.visit();
  });

  Given(/^I visit the "([^"]*)" page with parameters:$/, function (pageName, data) {
    expect(browser.page[pageName]).to.not.be.undefined;

    this.currentPage = browser.page[pageName];

    return this.currentPage.visitWithParameters(data);
  });

  Then(/^the "([^"]*)" page is displayed$/, function (pageName) {
    const self = this;

    return browser.page[pageName].isOn().then(checkResult => {
      self.currentPage = browser.page[pageName];
      self.urlParameters = checkResult.parameters;
    });
  });
});