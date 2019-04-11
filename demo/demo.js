(function ($, document) {

    $('.phone-inputs').phoneInputs({
        'countriesUrl': 'https://restcountries.eu/rest/v2/all',
        'multiple': true,
        'limit': 5,
        'lineTemplate': '#phone-inputs-line-template'
    });

    // listen to form
    $('#phone-inputs-test-form').on('submit', function (event) {
        event.preventDefault();
        $('#serialize-section').JSONView(JSON.stringify($(this).serializeArray()));
    })

    // Listen to bug
    $(document).on('phone.inputs.debug', '.phone-inputs', function (event, data) {
        let alert = $('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
        alert.append(`<span>${data.message}</span>`);
        alert.append('<br>');

        let dataJson = $('<span></span>');

        if (data.data) {
            dataJson.JSONView(JSON.stringify(data.data));
            alert.append(dataJson);
        }


        $('#debug-section').append(alert);
    })

    /**
     * Clear debug section
     */
    $(document).on('click', '.clear-debug', function(event){
        event.preventDefault();
        $(document).find('#debug-section').find('.alert').remove();
    })

    //Prevent delete
    $(document).on('phone.inputs.line.delete', '.phone-inputs', function (event, data) {
        //event.preventDefault();
        //alert(data.message)
    })
}(jQuery, document));