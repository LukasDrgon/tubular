// Karma configuration
// Generated on Mon Jun 16 2014 15:04:49 GMT+1000 (AUS Eastern Standard Time)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],



        // list of files / patterns to load in the browser
        files: [
          'bower_components/angular/angular.js',
          'bower_components/angular-mocks/angular-mocks.js',
          'bower_components/angular-route/angular-route.js',
          'bower_components/angular-loader/angular-loader.js',
          'bower_components/angular-local-storage/dist/angular-local-storage.js',
          'bower_components/angular-bootstrap/ui-bootstrap.js',
          'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
          'bower_components/file-saver.js/FileSaver.js',
          'src/Unosquare.Tubular/Javascript/tubular/tubular-models.js',
          'src/Unosquare.Tubular/Javascript/tubular/tubular-services.js',
          'src/Unosquare.Tubular/Javascript/tubular/tubular-directives.js',
          'src/Unosquare.Tubular/Javascript/tubular/tubular.js',
          'src/Unosquare.Tubular/Javascript/tubular*/**/*.js',
          'src/**/*.spec.js'
        ],


        // list of files to exclude
        exclude: [
           'src/*.min.js',
           'src/*bundle.js'
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
             'src/Unosquare.Tubular/Javascript/tubular*/!(*spec|*bundle).js': ['coverage']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage', 'html'],

        junitReporter: {
            outputDir: 'report/unit', // results will be saved as $outputDir/$browserName.xml
            useBrowserName: true,
        },
        htmlReporter: {
            outputDir: 'report/unit', // where to put the reports  
            focusOnFailures: true, // reports show failures on start 
            namedFiles: true, // name files instead of creating sub-directories 
           reportName: 'index',


            // experimental 
            preserveDescribeNesting: false, // folded suites stay folded  
            foldAll: false, // reports start folded (only with preserveDescribeNesting) 
        },

        // optionally, configure the reporter
        coverageReporter: {
            type: 'html',
            dir: 'report/coverage',
            subdir: '.'

        },
        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_DEBUG,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        failOnEmptyTestSuite: false
    });
};