// Accordion for .projection-table on mobile
(function() {
  function isMobile() {
    return window.innerWidth <= 768;
  }

  function createAccordion() {
    var table = document.querySelector('.projection-table');
    if (!table) return;
    var thead = table.querySelector('thead');
    var tbody = table.querySelector('tbody');
    if (!thead || !tbody) return;

    // Only run on mobile
    if (!isMobile()) return;

    // Hide the original table
    table.style.display = 'none';

    // Build accordion
    var headers = Array.from(thead.querySelectorAll('th'));
    var rows = Array.from(tbody.querySelectorAll('tr'));
    var accordion = document.createElement('div');
    accordion.className = 'projection-accordion';

    rows.forEach(function(row, i) {
      var cells = Array.from(row.querySelectorAll('td'));
      var item = document.createElement('div');
      item.className = 'projection-accordion-item';
      var header = document.createElement('button');
      header.className = 'projection-accordion-header';
      header.type = 'button';
      // Add caret span
      var caret = document.createElement('span');
      caret.className = 'accordion-caret';
      caret.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 7L9 11L13 7" stroke="#121212" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      header.appendChild(document.createTextNode(cells[0].innerText));
      header.appendChild(caret);
      var content = document.createElement('div');
      content.className = 'projection-accordion-content';
      content.style.display = 'none';
      var list = document.createElement('ul');
      for (var j = 1; j < cells.length; j++) {
        var li = document.createElement('li');
        li.innerHTML = '<strong>' + headers[j].innerText + ':</strong> ' + cells[j].innerHTML;
        list.appendChild(li);
      }
      content.appendChild(list);
      header.addEventListener('click', function() {
        var isOpen = content.style.display === 'block';
        content.style.display = isOpen ? 'none' : 'block';
        if (!isOpen) {
          caret.classList.add('open');
        } else {
          caret.classList.remove('open');
        }
      });
      item.appendChild(header);
      item.appendChild(content);
      accordion.appendChild(item);
    });

    // Insert accordion after table
    table.parentNode.insertBefore(accordion, table.nextSibling);
  }

  window.addEventListener('DOMContentLoaded', createAccordion);
  window.addEventListener('resize', function() {
    var accordion = document.querySelector('.projection-accordion');
    var table = document.querySelector('.projection-table');
    if (!table) return;
    if (isMobile()) {
      if (!accordion) createAccordion();
      table.style.display = 'none';
      if (accordion) accordion.style.display = '';
    } else {
      table.style.display = '';
      if (accordion) accordion.style.display = 'none';
    }
  });
})();
