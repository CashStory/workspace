/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
declare global {
  interface Window {
    __env: any;
    __info: any;
  }
}

import * as info from '../../info.json';

export const environment = {
  info,
  production: window.__env.production,
  api: window.__env.api,
  landingUrl: window.__env.landingUrl,
  whitelistedDomains: window.__env.whitelistedDomains,
  crispWebsiteId: window.__env.crispWebsiteId,
};

window.__info = info;
