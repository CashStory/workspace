(function (window) {
  window.__env = window.__env || {};

  // API url
  window.__env.production = true;
  window.__env.api = 'https://api.dev.cashstory.com/api/v1';
  window.__env.landingUrl = 'https://landing.dev.cashstory.com';
  window.__env.whitelistedDomains = ['api.dev.cashstory.com'];
  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  window.__env.enableDebug = false;
}(this));
