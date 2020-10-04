import * as puppeteer from 'puppeteer'
import teremock from 'teremock'


describe('Login page', () => {
  let page, browser;

  beforeAll(async () => {
    browser = await puppeteer.launch({args: ['--no-sandbox']});
    page = await browser.newPage();
    await page.setUserAgent("Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)");
  });

  test('Navigate to login', async () => {
    await page.goto('http://localhost:4200/auth/login',{timeout:0,waitUntil:"domcontentloaded"});
  });
  
  test('Input - Email address', async () => {
    await page.waitForSelector('#cs_loader_wrap',{timeout:0,hidden:true})
    await page.waitForSelector('#input-email',{timeout:0,visible:true})
    await page.focus('#input-email')
    await page.keyboard.type('bob@cashstory.com')
  });

  test('Input - Password', async () => {
    await page.waitForSelector('#cs_loader_wrap',{timeout:0,hidden:true})
    await page.waitForSelector('#input-password',{timeout:0,visible:true})
    await page.focus('#input-password')
    await page.keyboard.type('bobworkspace')
  });  

  test('Click and signin', async () => {
    const options = {
      page: page,
      ci: false,
      interceptors: {
        login_api: {
          url: 'http://localhost:4200/dev/api/v1/auth/login',
          methods: `post`,
          response: async (request) => ({
            status: 200,
            headers: {},
            body: {
              "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjVmMzNkNThkMjllZDFmMzA1YzBkMDcyMiIsInJvbGUiOiJhZG1pbiJ9LCJpYXQiOjE1OTc3NDYyNDcsImV4cCI6MTU5ODYxMDI0N30.GQx_GfrCFmSz5-7gZqVLORTi7U2SUGVgzBJjE6Hb4VI"
            }
          })
        },
        saml_auth: {
          url: 'http://localhost:4200/dev/api/v1/auth/saml',
          methods: `GET`,
          response: async (request) => ({
            status: 200,
            headers: {},
            body: {
              
            }
          })
        },
      }
    }
    await teremock.start(options)
    await page.click("#login-button")
    await page.setDefaultNavigationTimeout(0); 
    await page.waitForNavigation({waitUntil:"domcontentloaded",timeout:0})
    await page.waitForSelector('#cs_loader_wrap',{timeout:0,hidden:true})
    await page.screenshot({path: 'screenshot.png'});
  });

});