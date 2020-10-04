module.exports = {
	preset: 'jest-puppeteer',
	"testMatch": [
		"**/__tests__/*.+(ts|tsx|js)"
	  ],
	testPathIgnorePatterns: ['/node_modules/', 'dist'], // 
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	transform: {
		"^.+\\.ts?$": "ts-jest"
	},
	globalSetup: './global-setup.ts', // will be called once before all tests are executed
	globalTeardown: './global-teardown.ts', // will be called once after all tests are executed
	moduleDirectories : ['node_modules', 'src'],
		"moduleNameMapper": {
		  "^image![a-zA-Z0-9$_-]+$": "GlobalImageStub",
		  "^[./a-zA-Z0-9$_-]+\\.png$": "<rootDir>/RelativeImageStub.js",
		  "module_name_(.*)": "<rootDir>/substituted_module_$1.js",
		  "assets/(.*)": [
			"<rootDir>/images/$1",
			"<rootDir>/photos/$1",
			"<rootDir>/recipes/$1"
		  ]
		}
};