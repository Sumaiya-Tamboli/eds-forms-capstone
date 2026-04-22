export function handleAccordionNavigation(panel, tab, forceOpen = false) {
  const accordionTabs = panel?.querySelectorAll(':scope > fieldset');
  accordionTabs.forEach((otherTab) => {
    if (otherTab !== tab) {
      otherTab.classList.add('accordion-collapse');
    }
  });
  if (forceOpen) {
    tab.classList.remove('accordion-collapse');
  } else {
    tab.classList.toggle('accordion-collapse');
  }
}


function decorateLoanDetailsPanel(panel) {
  // Loan panel is nested: accordion > fieldset(tab) > fieldset.field-loan-details-panel
  const loanPanel = panel.querySelector('fieldset.field-loan-details-panel');
  if (!loanPanel) return;
 
  const fields = loanPanel.querySelectorAll(':scope > .text-wrapper');
 
  fields.forEach((wrapper) => {
    const input = wrapper.querySelector('input[type="text"]');
    const label = wrapper.querySelector('.field-label');
    if (!input) return;
 
    // Avoid injecting twice (e.g. if decorate runs again)
    if (wrapper.querySelector('.loan-display-value')) return;
 
    const display = document.createElement('span');
    display.className = 'loan-display-value';
 
    renderLoanValue(display, input);
 
    // Stay in sync if value is set programmatically (form prefill)
    const observer = new MutationObserver(() => renderLoanValue(display, input));
    observer.observe(input, { attributes: true, attributeFilter: ['value'] });
    input.addEventListener('change', () => renderLoanValue(display, input));
    input.addEventListener('input', () => renderLoanValue(display, input));
 
    if (label) {
      label.insertAdjacentElement('afterend', display);
    } else {
      wrapper.appendChild(display);
    }
  });
}
 
function renderLoanValue(displayEl, input) {
  const fieldName = input.name || '';
  const value = input.value ? input.value.trim() : '';
 
  // Schedule of Charges → "Click here" link
  if (fieldName === 'schedule_of_charges') {
    displayEl.classList.add('is-link');
    displayEl.textContent = 'Click here';
    if (value) {
      displayEl.onclick = () => window.open(value, '_blank');
    }
    return;
  }
 
  displayEl.classList.remove('is-link');
  displayEl.onclick = null;
 
  // Currency fields → ₹ Indian format
  if (['loan_amount', 'emi_amount', 'processing_fee'].includes(fieldName) && value) {
    displayEl.textContent = formatINR(value);
    return;
  }
 
  // Rate of interest → append %
  if (fieldName === 'rate_of_interest' && value) {
    const num = parseFloat(value);
    displayEl.textContent = isNaN(num) ? value : `${num}%`;
    return;
  }
 
  // Tenure → append "months" if purely numeric
  if (fieldName === 'tenure' && value) {
    const num = parseInt(value, 10);
    displayEl.textContent = (!isNaN(num) && !/month/i.test(value))
      ? `${num} months`
      : value;
    return;
  }
 
  displayEl.textContent = value || '—';
}
 
function formatINR(raw) {
  const num = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return raw;
  return '₹ ' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
 
export default function decorate(panel) {
  panel.classList.add('accordion');

   decorateLoanDetailsPanel(panel);

  const accordionTabs = panel?.querySelectorAll(':scope > fieldset');
  accordionTabs?.forEach((tab, index) => {
    tab.dataset.index = index;
    const legend = tab.querySelector(':scope > legend');
    legend?.classList.add('accordion-legend');
    if (index !== 0) tab.classList.toggle('accordion-collapse'); // collapse all but the first tab on load
    legend?.addEventListener('click', () => {
      handleAccordionNavigation(panel, tab);
    });
  });
  return panel;
}
