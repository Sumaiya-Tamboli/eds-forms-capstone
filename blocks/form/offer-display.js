/**
 * offer-display.js
 * Handles:
 *  1. Orange filled track on range sliders
 *  2. Value display box above each slider
 *  3. Live EMI calculation in the summary panel
 */

(function () {
  /* ── Helpers ── */

  /** Format a number in Indian currency style: ₹15,00,000 */
  function formatINR(value) {
    value = parseInt(value, 10);
    var s = value.toString();
    var result = '';
    if (s.length > 3) {
      result = ',' + s.slice(-3);
      s = s.slice(0, -3);
      while (s.length > 2) {
        result = ',' + s.slice(-2) + result;
        s = s.slice(0, -2);
      }
      result = s + result;
    } else {
      result = s;
    }
    return '\u20B9' + result; // ₹
  }

  /** Calculate EMI using standard formula */
  function calcEMI(principal, annualRate, tenureMonths) {
    var r = annualRate / 12 / 100;
    if (r === 0) return Math.round(principal / tenureMonths);
    var emi = principal * r * Math.pow(1 + r, tenureMonths) / (Math.pow(1 + r, tenureMonths) - 1);
    return Math.round(emi);
  }

  /** Update the orange fill on a range input */
  function updateTrack(input) {
    var min = parseFloat(input.min) || 0;
    var max = parseFloat(input.max) || 100;
    var val = parseFloat(input.value) || 0;
    var pct = ((val - min) / (max - min)) * 100;
    input.style.background =
      'linear-gradient(to right, #f97316 0%, #f97316 ' + pct + '%, #e5e7eb ' + pct + '%, #e5e7eb 100%)';
  }

  /** Inject or update the value-display box above a range slider */
  function updateValueBox(wrapper, text) {
    var box = wrapper.querySelector('.range-value-display');
    if (!box) {
      box = document.createElement('div');
      box.className = 'range-value-display';
      wrapper.insertBefore(box, wrapper.firstChild);
    }
    box.textContent = text;
  }

  /* ── Main init ── */
  function init() {
    var loanInput    = document.querySelector('input[name="loan_amount_inr"]');
    var tenureInput  = document.querySelector('input[name="loan_tenure_months"]');
    var emiField     = document.querySelector('input[name="emi_amount"]');
    var rateField    = document.querySelector('input[name="rate_of_interest"]');
    var taxesField   = document.querySelector('input[name="taxes_amount"]');

    /* Constants (replace with real values from your backend if needed) */
    var ANNUAL_RATE  = 10.97;   // %
    var TAX_RATE     = 0.18;    // 18% GST on processing fee (illustrative)
    var PROC_FEE_PCT = 0.005;   // 0.5% processing fee

    if (!loanInput || !tenureInput) return; // fields not on page

    /* Prefill read-only summary fields */
    if (rateField) rateField.value = ANNUAL_RATE.toFixed(2) + '%';

    function refreshSummary() {
      var principal = parseInt(loanInput.value, 10)   || 50000;
      var tenure    = parseInt(tenureInput.value, 10) || 12;

      var emi  = calcEMI(principal, ANNUAL_RATE, tenure);
      var proc = Math.round(principal * PROC_FEE_PCT);
      var tax  = Math.round(proc * TAX_RATE);

      if (emiField)   emiField.value   = formatINR(emi);
      if (taxesField) taxesField.value = formatINR(tax);

      /* Update summary heading amount if present */
      var summaryHeading = document.querySelector('.field-offer-summary-heading');
      if (summaryHeading) {
        var bold = summaryHeading.querySelector('b, strong');
        if (bold) bold.textContent = formatINR(principal);
      }
    }

    /* ── Loan Amount slider ── */
    function onLoanChange() {
      var val = parseInt(loanInput.value, 10);
      updateTrack(loanInput);
      var wrapper = loanInput.closest('.range-widget-wrapper');
      if (wrapper) updateValueBox(wrapper, formatINR(val));
      refreshSummary();
    }

    /* ── Tenure slider ── */
    function onTenureChange() {
      var val = parseInt(tenureInput.value, 10);
      updateTrack(tenureInput);
      var wrapper = tenureInput.closest('.range-widget-wrapper');
      if (wrapper) updateValueBox(wrapper, val + ' months');
      refreshSummary();
    }

    loanInput.addEventListener('input', onLoanChange);
    loanInput.addEventListener('change', onLoanChange);
    tenureInput.addEventListener('input', onTenureChange);
    tenureInput.addEventListener('change', onTenureChange);

    /* Run once on load to set initial state */
    onLoanChange();
    onTenureChange();
  }

  /* Wait for DOM */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Also re-init if AEM/EDS dynamically renders the form later */
  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].addedNodes.length) {
        var loanInput = document.querySelector('input[name="loan_amount_inr"]');
        if (loanInput && !loanInput._offerInited) {
          loanInput._offerInited = true;
          init();
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();