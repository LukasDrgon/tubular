exports.config = {
    allScriptsTimeout: 11000,

    specs: [
<<<<<<< HEAD
    //   'tbGridPager-scen.js',
    //   'tbPageSizeSelector-scen.js',
    //   'tbGridPagerInfo-scen.js',
    //   'tbColumn-scen.js',
      'tbFilters-scen.js'
=======
      'tbGridPager-scen.js',
      'tbPageSizeSelector-scen.js',
      'tbGridPagerInfo-scen.js',
      'tbColumn-scen.js',
      'tbFilters-scen.js',
      'tbForm-scen.js'
>>>>>>> unosquare/master
    ],

    capabilities: {
        'browserName': 'chrome'
    },

    baseUrl: 'http://localhost:8000/Unosquare.Tubular.WebTest/',

    framework: 'jasmine',

    jasmineNodeOpts: {
        // High timeout interval for debugging purposes:
        defaultTimeoutInterval: 3000000

        // Uncomment:
        // defaultTimeoutInterval: 3000
    }
};