﻿(function(angular, saveAs) {
    'use strict';

    function getColumns(gridScope) {
        return gridScope.columns.map(function (c) { return c.Label; });
    }

    function getColumnsVisibility(gridScope) {
        return gridScope.columns
            .map(function (c) { return c.Visible; });
    }

    function exportToCsv(filename, header, rows, visibility) {
        var processRow = function (row) {
            if (angular.isObject(row)) {
                row = Object.keys(row).map(function (key) { return row[key]; });
            }

            var finalVal = '';
            for (var j = 0; j < row.length; j++) {
                if (!visibility[j]) {
                    continue;
                }

                var innerValue = row[j] == null ? '' : row[j].toString();

                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                }

                var result = innerValue.replace(/"/g, '""');

                if (result.search(/("|,|\n)/g) >= 0) {
                    result = '"' + result + '"';
                }

                if (j > 0) {
                    finalVal += ',';
                }

                finalVal += result;
            }
            return finalVal + '\n';
        };

        var csvFile = '';

        if (header.length > 0) {
            csvFile += processRow(header);
        }

        for (var i = 0; i < rows.length; i++) {
            csvFile += processRow(rows[i]);
        }

        // Add "\uFEFF" (UTF-8 BOM)
        var blob = new Blob(['\uFEFF' + csvFile], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, filename);
    }

    /**
     * @ngdoc module
     * @name tubular.services
     * 
     * @description
     * Tubular Services module. 
     * It contains common services like HTTP client, filtering and printing services.
     */
    angular.module('tubular.services', ['ui.bootstrap', 'LocalStorageModule'])
        /**
         * @ngdoc factory
         * @name tubularPopupService
         *
         * @description
         * Use `tubularPopupService` to show or generate popups with a `tbForm` inside.
         */
        .factory('tubularPopupService', [
            '$uibModal', '$rootScope', 'tubularTemplateService',
            function ($uibModal, $rootScope, tubularTemplateService) {
                return {
                    onSuccessForm: function(callback) {
                        $rootScope.$on('tbForm_OnSuccessfulSave', callback);
                    },

                    onConnectionError: function(callback) {
                        $rootScope.$on('tbForm_OnConnectionError', callback);
                    },

                    /**
                     * Opens a new Popup
                     * 
                     * @param {string} template 
                     * @param {object} model 
                     * @param {object} gridScope 
                     * @param {string} size 
                     * @returns {object} The Popup instance
                     */
                    openDialog: function(template, model, gridScope, size) {
                        if (angular.isUndefined(template)) {
                            template = tubularTemplateService.generatePopup(model);
                        }

                        var dialog = $uibModal.open({
                            templateUrl: template,
                            backdropClass: 'fullHeight',
                            animation: false,
                            size: size,
                            controller:
                                // TODO: Move out of this scope
                                [
                                '$scope', function($scope) {
                                    $scope.Model = model;

                                    $scope.savePopup = function(innerModel, forceUpdate) {
                                        innerModel = innerModel || $scope.Model;

                                        // If we have nothing to save and it's not a new record, just close
                                        if (!forceUpdate && !innerModel.$isNew && !innerModel.$hasChanges) {
                                            $scope.closePopup();
                                            return null;
                                        }

                                        var result = innerModel.save(forceUpdate);

                                        if (angular.isUndefined(result) || result === false) {
                                            return null;
                                        }

                                        result.then(
                                            function(data) {
                                                $scope.$emit('tbForm_OnSuccessfulSave', data);
                                                $rootScope.$broadcast('tbForm_OnSuccessfulSave', data);
                                                $scope.Model.$isLoading = false;
                                                if (gridScope.autoRefresh) gridScope.retrieveData();
                                                dialog.close();

                                                return data;
                                            },
                                            function(error) {
                                                $scope.$emit('tbForm_OnConnectionError', error);
                                                $rootScope.$broadcast('tbForm_OnConnectionError', error);
                                                $scope.Model.$isLoading = false;

                                                return error;
                                            });

                                        return result;
                                    };

                                    $scope.closePopup = function() {
                                        if (angular.isDefined($scope.Model.revertChanges)) {
                                            $scope.Model.revertChanges();
                                        }

                                        dialog.close();
                                    };
                                }
                            ]
                        });

                        return dialog;
                    }
                };
            }
        ])
        /**
         * @ngdoc factory
         * @name tubularGridExportService
         *
         * @description
         * Use `tubularGridExportService` to export your `tbGrid` to a CSV file.
         */
        .factory('tubularGridExportService', function () {
            return {
                exportAllGridToCsv: function(filename, gridScope) {
                    var columns = getColumns(gridScope);
                    var visibility = getColumnsVisibility(gridScope);

                    gridScope.getFullDataSource(function(data) {
                        exportToCsv(filename, columns, data, visibility);
                    });
                },

                exportGridToCsv: function(filename, gridScope) {
                    var columns = getColumns(gridScope);
                    var visibility = getColumnsVisibility(gridScope);

                    gridScope.currentRequest = {};
                    exportToCsv(filename, columns, gridScope.dataSource.Payload, visibility);
                    gridScope.currentRequest = null;
                }
            };
        })
        /**
         * @ngdoc service
         * @name tubularEditorService
         *
         * @description
         * The `tubularEditorService` service is a internal helper to setup any `TubularModel` with a UI.
         */
        .service('tubularEditorService', [
            '$filter', function($filter) {
                var me = this;

                me.isValid = function(value) { return !(!value); };

                /**
                * Simple helper to generate a unique name for Tubular Forms
                */
                me.getUniqueTbFormName = function() {
                    me.tbFormCounter = me.tbFormCounter || (me.tbFormCounter = -1);
                    me.tbFormCounter++;
                    return 'tbForm' + me.tbFormCounter;
                };

                /**
                 * Setups a new Editor, this functions is like a common class constructor to be used
                 * with all the tubularEditors.
                 */
                me.setupScope = function(scope, defaultFormat, ctrl, setDirty) {
                    if (angular.isUndefined(ctrl)) {
                        ctrl = scope;
                    }

                    ctrl.isEditing = angular.isUndefined(ctrl.isEditing) ? true : ctrl.isEditing;
                    ctrl.showLabel = ctrl.showLabel || false;
                    ctrl.label = ctrl.label || (ctrl.name || '').replace(/([a-z])([A-Z])/g, '$1 $2');
                    ctrl.required = ctrl.required || false;
                    ctrl.readOnly = ctrl.readOnly || false;
                    ctrl.format = ctrl.format || defaultFormat;
                    ctrl.$valid = true;

                    // Get the field reference using the Angular way
                    ctrl.getFormField = function() {
                        var parent = scope.$parent;

                        while (parent != null) {
                            if (angular.isDefined(parent.tubularDirective) && parent.tubularDirective === 'tubular-form') {
                                var formScope = parent.getFormScope();

                                return formScope == null ? null : formScope[scope.Name];
                            }

                            parent = parent.$parent;
                        }

                        return null;
                    };

                    ctrl.$dirty = function() {
                        // Just forward the property
                        var formField = ctrl.getFormField();

                        return formField == null ? true : formField.$dirty;
                    };

                    ctrl.checkValid = function() {
                        ctrl.$valid = true;
                        ctrl.state.$errors = [];

                        if ((angular.isUndefined(ctrl.value) && ctrl.required) ||
                            (angular.isDate(ctrl.value) && isNaN(ctrl.value.getTime()) && ctrl.required)) {
                            ctrl.$valid = false;
                            ctrl.state.$errors = [$filter('translate')('EDITOR_REQUIRED')];

                            if (angular.isDefined(scope.$parent.Model)) {
                                scope.$parent.Model.$state[scope.Name] = ctrl.state;
                            }

                            return;
                        }

                        // Check if we have a validation function, otherwise return
                        if (angular.isUndefined(ctrl.validate)) {
                            return;
                        }

                        ctrl.validate();
                    };

                    scope.$watch(function() {
                        return ctrl.value;
                    }, function(newValue, oldValue) {
                        if (angular.isUndefined(oldValue) && angular.isUndefined(newValue)) {
                            return;
                        }

                        // This is the state API for every property in the Model
                        ctrl.state = {
                            $valid: function() {
                                ctrl.checkValid();
                                return this.$errors.length === 0;
                            },
                            $dirty: ctrl.$dirty,
                            $errors: []
                        };

                        ctrl.$valid = true;

                        // Try to match the model to the parent, if it exists
                        if (angular.isDefined(scope.$parent.Model)) {
                            if (angular.isDefined(scope.$parent.Model[ctrl.name])) {
                                scope.$parent.Model[ctrl.name] = newValue;

                                if (angular.isUndefined(scope.$parent.Model.$state)) {
                                    scope.$parent.Model.$state = [];
                                }

                                scope.$parent.Model.$state[scope.Name] = ctrl.state;
                            } else if (angular.isDefined(scope.$parent.Model.$addField)) {
                                scope.$parent.Model.$addField(ctrl.name, newValue, true);
                            }
                        }

                        ctrl.checkValid();
                    });

                    var parent = scope.$parent;

                    // We try to find a Tubular Form in the parents
                    while (parent != null) {
                        if (angular.isDefined(parent.tubularDirective) &&
                        (parent.tubularDirective === 'tubular-form' ||
                            parent.tubularDirective === 'tubular-rowset')) {

                            if (ctrl.name === null) {
                                return;
                            }

                            if (parent.hasFieldsDefinitions !== false) {
                                throw 'Cannot define more fields. Field definitions have been sealed';
                            }

                            ctrl.$component = parent.tubularDirective === 'tubular-form' ? parent : parent.$component;

                            scope.Name = ctrl.name;

                            ctrl.bindScope = function() {
                                scope.$parent.Model = parent.model;

                                if (angular.equals(ctrl.value, parent.model[scope.Name]) === false) {
                                    if (angular.isDefined(parent.model[scope.Name])) {
                                        if (ctrl.DataType === 'date' && parent.model[scope.Name] != null && angular.isString(parent.model[scope.Name])) {
                                            // TODO: Include MomentJS
                                            var timezone = new Date(Date.parse(parent.model[scope.Name])).toString().match(/([-\+][0-9]+)\s/)[1];
                                            timezone = timezone.substr(0, timezone.length - 2) + ':' + timezone.substr(timezone.length - 2, 2);
                                            ctrl.value = new Date(Date.parse(parent.model[scope.Name].replace('Z', '') + timezone));
                                        } else {
                                            ctrl.value = parent.model[scope.Name];
                                        }
                                    }

                                    parent.$watch(function() {
                                        return ctrl.value;
                                    }, function(value) {
                                        if (value === parent.model[scope.Name]) return;

                                        parent.model[scope.Name] = value;
                                    });
                                }

                                scope.$watch(function() {
                                    return parent.model[scope.Name];
                                }, function(value) {
                                    if (value === ctrl.value) return;

                                    ctrl.value = value;
                                }, true);

                                if ((!ctrl.value || ctrl.value == null) && (ctrl.defaultValue && ctrl.defaultValue != null)) {
                                    if (ctrl.DataType === 'date' && ctrl.defaultValue != null) {
                                        ctrl.defaultValue = new Date(ctrl.defaultValue);
                                    }
                                    if (ctrl.DataType === 'numeric' && ctrl.defaultValue != null) {
                                        ctrl.defaultValue = parseFloat(ctrl.defaultValue);
                                    }

                                    ctrl.value = ctrl.defaultValue;
                                }

                                if (angular.isUndefined(parent.model.$state)) {
                                    parent.model.$state = {};
                                }

                                // This is the state API for every property in the Model
                                parent.model.$state[scope.Name] = {
                                    $valid: function() {
                                        ctrl.checkValid();
                                        return this.$errors.length === 0;
                                    },
                                    $dirty: ctrl.$dirty,
                                    $errors: []
                                };

                                if (angular.equals(ctrl.state, parent.model.$state[scope.Name]) === false) {
                                    ctrl.state = parent.model.$state[scope.Name];
                                }

                                if (setDirty) {
                                    var formScope = ctrl.getFormField();
                                    if (formScope) formScope.$setDirty();
                                }
                            };

                            parent.fields.push(ctrl);

                            break;
                        }

                        parent = parent.$parent;
                    }
                };
            }
        ]);
})(angular, saveAs);