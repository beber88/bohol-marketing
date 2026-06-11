// Show a loading indicator on the submit button when the form is submitting

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('reserveForm');
  var submitBtn = form ? form.querySelector('.submit-button') : null;
  var submitBtnInner = form ? form.querySelector('.submit-button-inner') : null;

  if (form && submitBtn && submitBtnInner) {
    form.addEventListener('submit', function (e) {
      // Add loading state
      
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      submitBtnInner.innerHTML = '<span class="spinner"></span> Submitting...';
    });
  }
});
