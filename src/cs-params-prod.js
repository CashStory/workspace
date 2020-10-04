(function (window) {
  window.__env = window.__env || {};

  // API url
  window.__env.production = true;
  window.__env.api = 'https://api.cashstory.com/api/v1';
  window.__env.landingUrl = 'https://cashstory.com';
  window.__env.whitelistedDomains = ['api.cashstory.com'];
  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  window.__env.enableDebug = false;
}(this));
