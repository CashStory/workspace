const npsUtils=require('nps-utils');

module.exports= {
    scripts: {
        default: npsUtils.series.nps('conf.init', 'jsonModel', 'run'),
        run: 'ng serve --proxy-config proxy.conf.json --open',
        build:  'ng build --configuration=master',
        serve: 'node serve.js',
        env: {
          dev: 'cp src/cs-params-dev.js src/cs-params.js',
          prod: 'cp src/cs-params-prod.js src/cs-params.js',
          local: 'cp src/cs-params-local.js src/cs-params.js',
        },
        proxy: {
          local: 'cp src/cs-params-proxy-local.js src/cs-params.js',
          dev: 'cp src/cs-params-proxy-dev.js src/cs-params.js',
          prod: 'cp src/cs-params-proxy-prod.js src/cs-params.js',
        },
        conf: {
          init: 'test -f src/cs-params.js || cp src/cs-params-proxy-dev.js src/cs-params.js',
          get: 'tail -n "+6" src/cs-params.js | head -n "1"',
        },
        app: {
          default: npsUtils.series.nps('app.build'),
          build: npsUtils.series.nps('env.dev', 'build', 'app.copy'),
          resources: "cordova-res ios && cordova-res android && node scripts/resources.js",
          copy: 'cap copy',
          sync: 'cap sync',
        },
        tag: {
          init: "./scripts/init_git_ci.sh",
          done: "./scripts/tag_git_ci.sh"
        },
        lint: {
            default: npsUtils.concurrent.nps('lint.front', 'lint.html', 'lint.style'), // default: npsUtils.concurrent.nps('lint.commit', 'lint.front', 'lint.html', 'lint.style', 'lint.back'),
            commit: 'commitlint --from=$(git rev-parse --abbrev-ref --symbolic-full-name @{u}) --to=HEAD',
            front: 'ng lint',
            html: 'htmlhint src/app/**/**/**.html',
            style: 'stylelint src/app/**/**/**.scss --config ./stylelint.json',
            style2: 'sass-lint \"src/**/**.s+(a|c)ss\" -v',
            fix: 'tslint --format verbose --project tsconfig.json --config tslint.json --fix',
        },
        jsonModel: {
          default: npsUtils.series.nps('jsonModel.workspace', 'jsonModel.user'),
          user: "ts-json-schema-generator --path 'src/app/shared/models/user.ts' > src/app/shared/user_models.json",
          workspace: "ts-json-schema-generator --path 'src/app/shared/models/workspace.ts' > src/app/shared/workspace_models.json",
        },
    }
};
