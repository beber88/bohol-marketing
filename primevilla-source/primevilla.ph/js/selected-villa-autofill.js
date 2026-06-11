// Auto-populate the selected-villa field when clicking Reserve or Join Waitlist buttons

document.addEventListener('DOMContentLoaded', function () {
  // Helper to get villa name/title from button context
  function getVillaNameFromButton(btn) {
    // Try to find a villa name in the closest parent with a data attribute or heading
    let parent = btn.closest('.villa-card, .villa, .property, .card, section');
    if (parent) {
      // Try data attributes first
      let dataName = parent.getAttribute('data-villa') || parent.getAttribute('data-name') || parent.getAttribute('data-title');
      if (dataName) return dataName;
      // Try heading tags
      let heading = parent.querySelector('h2, h3, h4, .villa-title, .property-title');
      if (heading) return heading.textContent.trim();
    }
    // Fallback: use button text
    return btn.textContent.trim();
  }

  // Attach click listeners to all Reserve/Waitlist buttons
  document.querySelectorAll('a.button, a.location-button, a[href="#reserve"]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      // Only act if button is for reserve or waitlist
      if (/reserve|waitlist/i.test(btn.textContent)) {
        var villaName = getVillaNameFromButton(btn);
        var input = document.querySelector('input[name="selected-villa"]');
        if (input) input.value = villaName;
      }
    });
  });
});
