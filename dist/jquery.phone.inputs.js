(function ($, document) {
    $.fn.phoneInputs = function (options) {

        var settings = $.extend({
            // These are the defaults.
            countriesUrl: 'https://restcountries.eu/rest/v2/all',
            multiple: true,
            defaultCountry: null,
            countryCodeAttr: 'alpha2Code',
            countryNameAttr: 'name',
            countryCallPrefix: 'callingCodes',
            limit: 1,
            lineTemplate: '#phone-inputs-line-template',
            inputName: 'phone',
            inputCountryName: 'country',
            inputNumberName: 'number',
            inputDefaultName: 'default',
            inputNameAttr: 'data-form-name',
            inputCountryNameAttr: 'data-form-country-name',
            inputNumberNameAttr: 'data-form-number-name',
            inputDefaultNameAttr: 'data-form-default-name',
            addLineBtnClass: "btn-phone-inputs-add-line",
            deleteLineBtnClass: "btn-phone-inputs-delete-line",
            checkboxInputSectionClass: "phone-inputs-default-checkbox-section",
            lineClass: 'phone-inputs-line',
            required: false
        }, options);

        var events = {
            debug: 'phone.inputs.debug',
            lineDelete: 'phone.inputs.line.delete',
            change: 'phone.inputs.change',
            lineAdded: 'phone.inputs.line.added',
            defaultChoose: 'phone.inputs.default.choose'
        };

        let countries = [];
        const self = this;

        function loadCountries(rootElement) {
            return $.get(settings.countriesUrl, function (data) {
                countries = data;

                return rootElement.each(function (index, element) {
                    /**
                     * Phone inputs element
                     */
                    var phoneInputs = $(element);

                    /**
                     * Check form data name
                     */
                    if(!phoneInputs.attr('data-form-name')){
                        if(rootElement.length > 1){
                            phoneInputs.attr(settings.inputNameAttr, `phone_${index}`);
                        }else{
                            phoneInputs.attr(settings.inputNameAttr, settings.inputName);
                        }
                    }

                    /**
                     * Check form data country name
                     */
                    if(!phoneInputs.attr(settings.inputCountryNameAttr)){
                        phoneInputs.attr(settings.inputCountryNameAttr, settings.inputCountryName);
                    }

                    /**
                     * Check form data number name
                     */
                    if(!phoneInputs.attr(settings.inputNumberNameAttr)){
                        phoneInputs.attr(settings.inputNumberNameAttr, settings.inputNumberName);
                    }

                    /**
                     * Check form data default name
                     */
                    if(!phoneInputs.attr(settings.inputDefaultNameAttr)){
                        phoneInputs.attr(settings.inputDefaultNameAttr, settings.inputDefaultName);
                    }


                    /**
                     * Add the first line
                     */
                    if (phoneInputs.find(`.${settings.lineClass}`).length == 0) {
                        addNewLine(rootElement, phoneInputs, null);
                    } else {
                        if (settings.multiple) {
                            console.log('Make sur you have the add button add give the "addLineBtnClass" option.');
                        }
                    }

                    /**
                     * Listen to the new line call
                     */
                    $(document).on('click', `.${settings.addLineBtnClass}`, function (event) {
                        event.preventDefault();
                        if (settings.multiple) {
                            /**
                             * Add the new input
                             */
                            addNewLine(rootElement, $(this).closest(phoneInputs), null);
                        } else {
                            logEvent(rootElement, events.debug, [{
                                message: 'multiple option is false. You can\'t add a new input.'
                            }]);
                        }
                    })

                    /**
                     * Listen to delete line call
                     */
                    $(document).on('click', `.${settings.deleteLineBtnClass}`, function (event) {
                        event.preventDefault();
                        const line = $(this).closest(`.${settings.lineClass}`);
                        const inputData = {
                            country: line.find('select').val(),
                            default: line.find('input[type="checkbox"]').prop('checked'),
                            number: line.find('input[type="text"]').val()
                        };

                        /**
                         * Trigger event
                         */
                        var lineDeletedEvent = jQuery.Event(events.lineDelete);
                        triggerEvent(rootElement, lineDeletedEvent, [{
                            message: 'A phone number field is going to be removed',
                            data: inputData
                        }]);

                        /**
                         * Debug
                         */
                        logEvent(rootElement, events.debug, [{
                            message: 'A phone number field is going to be removed',
                            data: inputData
                        }]);

                        /**
                         * If event is not prevented delete the row
                         */
                        if (!lineDeletedEvent.isDefaultPrevented()) {
                            line.remove();
                            /**
                             * Trigger event
                             */
                            triggerEvent(rootElement, events.change, [{
                                message: 'A phone number field has been removed',
                                data: inputData
                            }]);

                            /**
                             * Update index
                             */
                            updateInputsIndex(phoneInputs);

                            /**
                             * Debug
                             */
                            logEvent(rootElement, events.debug, [{
                                message: 'A phone number field has been removed',
                                data: inputData
                            }]);
                        }
                    })
                });
            });
        }

        /**
         * Load countries and initialize the phone inputs field
         */
        loadCountries(self).fail(function () {
            logEvent(self, events.debug, [{
                message: `Unable to load countries from ${settings.countriesUrl}`
            }]);
        });

        /**
         * Add a new phone number entry field
         */
        function addNewLine(rootElement, phoneInputs, data = null) {
            // Get the line template
            var lineTemplate = $(document).find(settings.lineTemplate).text();
            var template = $(lineTemplate);

            if (phoneInputs.find(`.${settings.lineClass}`).length < settings.limit) {
                /**
                 * If it is an multiple input
                 */
                if (settings.multiple) {
                    /**
                     * If it is the first line
                     */
                    if (phoneInputs.find(`.${settings.lineClass}`).length == 0) {
                        template.find(`.${settings.deleteLineBtnClass}`).css({
                            'display': 'none'
                        });

                        /**
                         * Set the line as the default phone number
                         */
                        template.find('input[type="checkbox"]').prop('checked', true);
                    } else {
                        /**
                         * Hide add line button input
                         */
                        template.find(`.${settings.addLineBtnClass}`).css({
                            'display': 'none'
                        });
                    }

                    /**
                     * Give name to field
                     */
                    template.find('select').attr('name', `${phoneInputs.attr(settings.inputNameAttr)}[${phoneInputs.find(`.${settings.lineClass}`).length}][${phoneInputs.attr(settings.inputCountryNameAttr)}]`);
                    template.find('input[type="text"]').attr('name', `${phoneInputs.attr(settings.inputNameAttr)}[${phoneInputs.find(`.${settings.lineClass}`).length}][${phoneInputs.attr(settings.inputNumberNameAttr)}]`);
                    template.find('input[type="checkbox"]').attr('name', `${phoneInputs.attr(settings.inputNameAttr)}[${phoneInputs.find(`.${settings.lineClass}`).length}][${phoneInputs.attr(settings.inputDefaultNameAttr)}]`);

                    /** Add change event */
                    template.find('input[type="checkbox"]').change(function (event) {
                        /**
                         * Get input values
                         */
                        let inputData = {
                            country: template.find('select').val(),
                            default: true,
                            number: template.find('input[type="text"]').val()
                        };

                        /**
                         * Trigger event
                         */
                        var defaultChooseEvent = jQuery.Event(events.defaultChoose);
                        triggerEvent(rootElement, defaultChooseEvent, [{
                            message: 'Choosing a default number',
                            data: inputData
                        }]);

                        /**
                         * Debug
                         */
                        logEvent(rootElement, events.debug, [{
                            message: 'Choosing a default number',
                            data: inputData
                        }]);

                        if (!defaultChooseEvent.isDefaultPrevented()) {
                            phoneInputs.find('input[type="checkbox"]').prop('checked', false);
                            $(this).prop('checked', true);

                            /**
                             * Trigger change event
                             */
                            triggerEvent(rootElement, events.change, [{
                                message: 'Default number choosed',
                                data: inputData
                            }]);
                            

                            /**
                             * Debug
                             */
                            logEvent(rootElement, events.debug, [{
                                message: 'Default number choosed',
                                data: inputData
                            }]);

                        }
                    });
                } else {
                    /**
                     * Hide delete line button input
                     */
                    template.find(`.${settings.deleteLineBtnClass}`).css({
                        'display': 'none'
                    });
                    /**
                     * Hide add line button input
                     */
                    template.find(`.${settings.addLineBtnClass}`).css({
                        'display': 'none'
                    });

                    /**
                     * Hide radio checkbox
                     */
                    template.find('input[type="checkbox"]').css({
                        'display': 'none'
                    });
                    template.find(`.${settings.checkboxInputSectionClass}`).css({
                        'display': 'none'
                    });

                    /**
                     * Give name to field
                     */
                    template.find('select').attr('name', `${phoneInputs.attr(settings.inputNameAttr)}[${phoneInputs.attr(settings.inputCountryNameAttr)}]`);
                    template.find('input[type="text"]').attr('name', `${phoneInputs.attr(settings.inputNameAttr)}[${phoneInputs.attr(settings.inputNumberNameAttr)}]`);
                    template.find('input[type="checkbox"]').attr('name', `${phoneInputs.attr(settings.inputNameAttr)}[${phoneInputs.attr(settings.inputDefaultNameAttr)}]`);
                }

                if (data != null) {
                    template.find('input[type="text"]').val(data.number);
                    template.find('input[type="checkbox"]').prop('checked', data.default);
                }

                /**
                 * Check required property
                 * :) Not sure that required option will always be a boolean value so...
                 */
                if (settings.required || phoneInputs.attr('required')) {
                    template.find('select').prop('required', true);
                    template.find('input[type="text"]').prop('required', true);
                } else {
                    template.find('select').prop('required', false);
                    template.find('input[type="text"]').prop('required', false);
                }

                /**
                 * Clear country select list
                 */
                template.find('select').find('option').remove();

                countries.forEach(country => {
                    var option = $(`<option value="${country[settings.countryCodeAttr]}">${country[settings.countryNameAttr]} (+${country[settings.countryCallPrefix]})</option>`);
                    if (data != null) {
                        if(data.coutry != null){
                            if(country[settings.countryCodeAttr].toLowerCase() == data.country.toLowerCase()){
                                option.prop('selected', true);
                            }
                        }else{
                            /**
                             * Debug
                             */
                            logEvent(rootElement, event.debug, [{
                                message: 'The country attribute cannot be null.',
                                data: data
                            }]);
                        }
                    }else if(settings.defaultCountry != null && country[settings.countryCodeAttr].toLowerCase() == settings.defaultCountry.toLowerCase()){
                        option.prop('selected', true);
                    }
                    template.find('select').append(option);
                });

                /**
                 * Add the line
                 */
                phoneInputs.append(template);

                /**
                 * Trigger lineAdded event
                 */
                triggerEvent(rootElement, events.lineAdded, [{
                    message: `A new phone number entry field has been added.`
                }]);

                /**
                 * Trigger change event
                 */
                triggerEvent(rootElement, events.change, [{
                    message: 'A new phone number entry field has been added.'
                }]);

                /**
                 * Debug
                 */
                logEvent(rootElement, events.debug, [{
                    message: `A new phone number entry field has been added.`
                }]);
            } else {
                /**
                 * Debug
                 */
                logEvent(rootElement, events.debug, [{
                    message: `The limit of phone number inputs (${settings.limit}) have been reached.`
                }]);
            }
        }

        /**
         * Update inputs index
         */
        function updateInputsIndex(phoneInputs) {
            phoneInputs.find(`.${settings.lineClass}`).each(function (index, element) {
                const line = $(element);
                line.find('select').attr('name', `${phoneInputs.attr(settings.inputNameAttr)}[${index}][${phoneInputs.attr(settings.inputCountryNameAttr)}]`);
                line.find('input[type="text"]').attr('name', `${phoneInputs.attr(settings.inputNameAttr)}[${index}][${phoneInputs.attr(settings.inputNumberNameAttr)}]`);
                line.find('input[type="checkbox"]').attr('name', `${phoneInputs.attr(settings.inputNameAttr)}[${index}][${phoneInputs.attr(settings.inputDefaultNameAttr)}]`);
            });
        }

        /**
         * Log debug event
         */
        function logEvent(rootElement, event, data){
            rootElement.trigger(event, data);
        }

        /**
         * Trigger event
         */
        function triggerEvent(rootElement, event, data){
            rootElement.trigger(event, data);
        }
    };
}(jQuery, document));