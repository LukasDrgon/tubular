(function(angular) {
  'use strict';

  angular.module('tubular')
    /**
     * @ngdoc filter
     * @name errormessage
     * @kind function
     *
     * @description
     * Use `errormessage` to retrieve the friendly message possible in a HTTP Error object.
     *
     * @param {object} input Input to filter.
     * @returns {string} Formatted error message.
     */
    .filter('errormessage', function() {
      return input => {
        if (angular.isDefined(input) && angular.isDefined(input.data) &&
          input.data &&
          angular.isDefined(input.data.ExceptionMessage)) {
          return input.data.ExceptionMessage;
        }

        return input.statusText || 'Connection Error';
      };
    })
})(angular);
