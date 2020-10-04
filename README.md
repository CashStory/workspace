# Bob CashStory front 

The frontend is generated with [Angular CLI](https://github.com/angular/angular-cli). 

This project uses the [MEAN stack](https://en.wikipedia.org/wiki/MEAN_(software_bundle)):
* [**A**ngular 7+](https://angular.io): frontend framework

Other tools and technologies used:
* [Angular CLI](https://cli.angular.io): frontend scaffolding
* [Bootstrap](http://www.getbootstrap.com): layout and styles
* [Font Awesome Pro](http://fontawesome.io): icons
* [JSON Web Token](https://jwt.io): user authentication
* [Angular 2 JWT](https://github.com/auth0/angular2-jwt/tree/v1.0): JWT helper for Angular
* [stylelint](https://github.com/stylelint/stylelint): style linter
* [htmllint](https://github.com/htmllint/htmllint): html linter

## Prerequisites
1. From project root folder install all the dependencies: `npm i`
2. run
3. HotChange proxy backend, if necessary.

## Run
`npm start`: [nps](https://github.com/kentcdodds/nps#readme) Angular build, TypeScript compiler.

A window will automatically open at [localhost:4200](http://localhost:4200). Angular files are being watched. Any change automatically creates a new bundle and reload your browser.

## HotChange proxy backend
In a second terminal, you can change backend on the fly.
`npm start proxy.local` => to localhost:3000
`npm start proxy.dev` => to darkknight.dev.cashstory.com
`npm start proxy.prod` => to darkknight.cashstory.com

## Build for Dev
`npm start env.dev` set to real backend in production. (will work only in deployed front with real url, otherwise you get CORS).
`npm start build`: build the project with a production bundle and AOT compilation.
`npm start serve`: serve the bundle listening at [localhost:8080](http://localhost:8080), no HotReload.

## Build for Production
`npm start env.prod` set to real backend in production. (will work only in deployed front with real url, otherwise you get CORS).
`npm start build`: build the project with a production bundle and AOT compilation.
`npm start serve`: serve the bundle listening at [localhost:8080](http://localhost:8080), no HotReload.

## Running linters
Run `npm start lint` to execute all lint

Run `npm start lint.front` to execute the frontend TS linting via [TSLint](https://github.com/palantir/tslint).

Run `npm start lint.html` to execute the frontend HTML linting via [HTMLHint](https://github.com/htmlhint/HTMLHint).

Run `npm start lint.style` to execute the frontend SCSS linting via [SASS-Lint](https://github.com/sasstools/sass-lint).

## Further help
To get more help on the `angular-cli` use `ng --help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

### Author
* [Martin donadieu](https://github.com/riderx)
