// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const {
    SpecReporter
  } = require('jasmine-spec-reporter');
  
  exports.config = {
    allScriptsTimeout: 11000,
    specs: [
      './src/**/**.e2e.ts',
      './src/**/*.e2e.ts',
    ],
    capabilities: {
      'browserName': 'chrome'
    },
    directConnect: true,
    baseUrl: 'http://localhost:4200/',
    framework: 'jasmine',
    jasmineNodeOpts: {
      showColors: true,
      defaultTimeoutInterval: 30000,
      print: function() {}
    },
    onPrepare() {
      require('ts-node').register({
        project: 'src/tsconfig.e2e.json'
      });
  
      jasmine.getEnv().addReporter(new SpecReporter({
        spec: {
          displayStacktrace: true
        }
      }));
    }
  };