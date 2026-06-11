// This script initializes intl-tel-input on the phone input field
// Requires intl-tel-input JS and CSS to be loaded in the HTML

document.addEventListener('DOMContentLoaded', function () {
  var input = document.querySelector('input[name="phone"]');
  if (input && window.intlTelInput) {
    var iti = window.intlTelInput(input, {
      initialCountry: 'ph',
      utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@19.5.6/build/js/utils.js',
    });

    // Always ensure country code is present on focus
    input.addEventListener('focus', function () {
      var number = iti.getNumber();
      if (!number || number === '+') {
        // Set to default country code
        var countryData = iti.getSelectedCountryData();
        input.value = '+' + countryData.dialCode + ' ';
        setTimeout(function() {
          input.setSelectionRange(input.value.length, input.value.length);
        }, 0);
      }
    });
  }
});
