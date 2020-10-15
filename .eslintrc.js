module.exports = {
  env: {
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 6
  },
  globals: {
    page: true,
    browser: true,
    context: true,
    jestPuppeteer: true,
  },
}
