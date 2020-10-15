(function (window) {
  window.__env = window.__env || {};

  // API url
  window.__env.production = true;
  window.__env.api = '/api/v1';
  window.__env.gtm_id = null;
  window.__env.landingUrl = 'https://landing.dev.cashstory.com';
  window.__env.whitelistedDomains = ['localhost'];
  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  window.__env.enableDebug = true;
}(this));
