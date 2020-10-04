module.exports = {
  launch: {
    headless: false,
    ignoreDefaultArgs: ["--disable-extensions","--no-sandbox"],
    args: ['--no-sandbox', '--disable-setuid-sandbox','--headless']
  },
  server: {
    command: "npm start",
    port: 4200,
    launchTimeout: 900000
  }
};