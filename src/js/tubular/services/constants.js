(angular => {
    'use strict';

    angular.module('tubular.services')
        .constant('dataTypes', {
            STRING: 'string',
            BOOLEAN: 'boolean',
            NUMERIC: 'numeric',
            DATE_TIME: 'datetime',
            DATE: 'date',
            DATE_TIME_UTC: 'datetimeutc'
        })
        .constant('sortDirection', {
            ASC: 'Ascending',
            DESC: 'Descending',
            NONE: 'None'
        });
})(angular);