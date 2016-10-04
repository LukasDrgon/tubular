/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false */

describe('tb Form Date Editor', function () {
    var tbFormSaveBtn,
        tbFormCancelBtn,
        tbDateEditor,
        tbDateEditorInput,
        tbDateEditorLabel,
        tbDateEditorHelper,
        tbFormEditBtn1,
        tbDateEditor_errorMessages,
        tbDateEditorDate_original = '02/02/2016';
        
    var tbDateEditorRestore = function () {
        return browser.wait(function () {
            return tbFormCancelBtn.isPresent().then(function (present) {
                if (present) {
                    tbFormCancelBtn.click();
                }
            })
                .then(function () {
                    return tbFormEditBtn1.click().then(function() {
                        return tbDateEditorInput.getAttribute('value').then(function(val) {
                            if (val !== tbDateEditorDate_original) {
                                return tbDateEditorInput.clear().then(function() {
                                    return tbDateEditorInput.sendKeys(tbDateEditorDate_original).then(function() {
                                            return tbFormSaveBtn.click().then(function() {
                                                return true;
                                            });
                                    });
                                });
                            } 
                            else {
                                return tbFormCancelBtn.click().then(function () {
                                    return true;
                                });
                            }
                        });
                    });
                });
        });
    }
    
    beforeAll(function(){
         browser.get('indexMoment.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbFormTest')).click().then(function () {
            // Save and Cancel buttons
            tbFormSaveBtn = $('div.modal-dialog form').$('#btnSave');
            tbFormCancelBtn = $('div.modal-dialog form').$('#btnCancel');
        });
    });
    
    beforeEach(function () {
        browser.executeScript('localStorage.clear()');
    });

    afterAll(function () {
        browser.executeScript('localStorage.clear()');
    });
    
    describe('tbDateEditor', function() {
        
        beforeAll(function () {
            //* Assign test variables *\\
            // 4th element in list, should be: <OrderID = 4 , Customer Name = Unosquare LLC, Shipped Date = 1/30/16  ... >
            tbFormEditBtn1 = element.all(by.repeater('row in $component.rows')).get(3).$$('td').first().$$('button').first();
            
            // tbSimpleEditor component and subcomponents
            tbDateEditor = $('div.modal-dialog form').$('tb-simple-editor');
            tbDateEditorInput = $('div.modal-dialog form').$('tb-date-editor').$('input');
            tbDateEditorLabel = $('div.modal-dialog form').$('tb-date-editor').$('label');
            tbDateEditor_errorMessages = $('div.modal-dialog form').$('tb-date-editor').all(by.repeater('error in $ctrl.state.$errors'));
            tbDateEditorHelper = $('div.modal-dialog form').$('tb-date-editor').$$('span').filter(function (elem) {
                return elem.getAttribute('ng-show').then(function (val) {
                    return val != null ? val.indexOf('$ctrl.help') != -1 : false;
                });
            }).first();
            //* Restore default value and open form popup *\\
            tbDateEditorRestore().then(function () {
                tbFormEditBtn1.click();
            });

        });

        beforeEach(function () {           
            //* Restore default value and open form popup *\\    
            tbDateEditorRestore().then(function () {
                tbFormEditBtn1.click();
            });
        });

        it('should set initial date value to the value of "value" attribute when defined', function () {
            expect(tbDateEditorInput.getAttribute('value')).toMatch(tbDateEditorDate_original);
        });

        it('should be invalidated when the date is not in the range of "min" and "max" attributes', function () {
            var errorPresent = false;
            var messageCount;
            
            tbDateEditorInput.clear().then(function () {
                // input  an invalid < min date
                tbDateEditorInput.sendKeys('02/20/2015').then(function () {
                    //browser.pause();
                    tbDateEditor_errorMessages.getText().then(function (errorsArray) {
                        errorsArray.forEach(function (val) {
                            if (val == 'The minimum date is 01/28/2016.') {
                                errorPresent = true;
                            }
                        });
                        // Expect min chars error to be displayed
                        expect(errorPresent).toBe(true);
                    });
                })
                    .then(function () {
                        tbDateEditor_errorMessages.count().then(function (count) {
                            messageCount = count;
                        })
                            .then(function () {
                                tbDateEditorInput.clear().then(function() {
                                    tbDateEditorInput.sendKeys('05/08/2016').then(function () {
                                        // Expect min date error to have been removed
                                        expect(tbDateEditor_errorMessages.count()).toBeLessThan(messageCount);
                                    });
                                });
                            });
                    })
                    .then(function () {
                        tbDateEditorInput.clear().then(function () {
                            tbDateEditorInput.sendKeys('06/11/2016').then(function () {
                                // Expect max chars error to be displayed
                                expect(tbDateEditor_errorMessages.count()).toBe(messageCount);
                            });
                        });
                    });
            });
        });

        it('should show the component name value in a label field when "showLabel" attribute is true', function () {
            expect(tbDateEditorLabel.getText()).toMatch('Date Editor Date');
        });

        it('should show a help field equal to this attribute, is present', function () {
            expect(tbDateEditorHelper.getText()).toMatch("Date help");
        });

        it('should submit modifications to item/server when clicking form "Save"', function () {
            tbDateEditorInput.clear().then(function() {
                tbDateEditorInput.sendKeys('05/05/2016').then(function () {
                    tbFormSaveBtn.click().then(function () {
                        tbFormEditBtn1.click().then(function () {
                            tbDateEditorInput.getAttribute('value').then(function (text) {
                                expect(text).toMatch('05/05/2016');
                            });
                        });
                    });
                });
            });
        });

        it('should NOT submit modifications to item/server when clicking form "Cancel"', function () {
            tbDateEditorInput.getAttribute('value').then(function(text) {
                expect(text).toMatch(tbDateEditorDate_original);
            })
            .then(function() {
                tbDateEditorInput.sendKeys('05/05/2016').then(function() {
                    tbFormCancelBtn.click().then(function() {
                        tbFormEditBtn1.click().then(function() {
                            tbDateEditorInput.getAttribute('value').then(function(text) {
                                expect(text).toMatch(tbDateEditorDate_original);
                            });
                        });
                    });
                });
            });
        });
    });
});
