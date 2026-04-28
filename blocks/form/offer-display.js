(function () {

  /* ── EMI Calculation Formula ── */
  function calculateEMI(principal, annualRate, tenureMonths) {
    // EMI = [P × r × (1+r)^n] / [(1+r)^n - 1]
    // where r = monthly interest rate
    const monthlyRate = annualRate / 12 / 100;
    const n = tenureMonths;
    
    if (monthlyRate === 0) {
      return principal / n;
    }
    
    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, n);
    const denominator = Math.pow(1 + monthlyRate, n) - 1;
    
    return Math.round(numerator / denominator);
  }

  /* ── helpers ── */
  function formatINR(val) {
    // e.g. 1500000 → ₹15,00,000
    return '₹' + Number(val).toLocaleString('en-IN');
  }

  function formatLabel(val) {
    // e.g. 50000 → 50K | 200000 → 2L | 1500000 → 15L
    if (val >= 100000) return (val / 100000) + 'L';
    if (val >= 1000)   return (val / 1000)  + 'K';
    return val;
  }

  function formatMonthLabel(val) {
    return val + 'm';
  }

  /* ── orange fill on webkit (CSS can't do it natively) ── */
  function updateTrackFill(input) {
    const min  = Number(input.min)   || 0;
    const max  = Number(input.max)   || 100;
    const val  = Number(input.value) || 0;
    const pct  = ((val - min) / (max - min)) * 100;
    input.style.background =
      `linear-gradient(to right,
        #f97316 0%, #f97316 ${pct}%,
        #e5e7eb ${pct}%, #e5e7eb 100%)`;
  }

  /* ── build tick labels below a slider ── */
  function buildLabels(wrapper, ticks, formatter) {
    const existing = wrapper.querySelector('.loan-slider-labels');
    if (existing) existing.remove();

    const row = document.createElement('div');
    row.className = 'loan-slider-labels';
    ticks.forEach(t => {
      const s = document.createElement('span');
      s.textContent = formatter(t);
      row.appendChild(s);
    });
    wrapper.appendChild(row);
  }

  /* ── build the value display box above the slider ── */
  function buildValueBox(fieldWrapper, input, formatter) {
    let box = fieldWrapper.querySelector('.loan-value-display');
    if (!box) {
      box = document.createElement('div');
      box.className = 'loan-value-display';
      // insert after the <label>
      const label = fieldWrapper.querySelector('label');
      if (label) {
        label.parentNode.insertBefore(box, label.nextSibling);
      }
    }
    box.textContent = formatter(input.value);
    return box;
  }

  /* ── Update summary panel values ── */
  function updateSummary() {
    const amountInput = document.querySelector('.field-loan-amount-inr input[type="range"]');
    const tenureInput = document.querySelector('.field-loan-tenure-months input[type="range"]');
    const emiInput = document.querySelector('.field-emi-amount input[type="text"]');
    const rateInput = document.querySelector('.field-rate-of-interest input[type="text"]');
    const taxesInput = document.querySelector('.field-taxes-amount input[type="text"]');
    const summaryHeading = document.querySelector('.field-offer-summary-heading p b, .field-offer-summary-heading p strong');

    if (!amountInput || !tenureInput) return;

    const principal = Number(amountInput.value) || 1500000;
    const tenure = Number(tenureInput.value) || 84;
    const annualRate = 10.97; // Fixed rate as per the design
    
    // Calculate EMI
    const emi = calculateEMI(principal, annualRate, tenure);
    
    // Calculate taxes (assuming 18% GST on processing fee, which is ~2% of loan amount)
    const processingFee = principal * 0.02;
    const taxes = Math.round(processingFee * 0.18);

    // Update summary heading
    if (summaryHeading) {
      summaryHeading.textContent = formatINR(principal);
    }

    // Update fields
    if (emiInput) {
      emiInput.value = formatINR(emi);
      emiInput.readOnly = true;
    }
    
    if (rateInput) {
      rateInput.value = annualRate + '%';
      rateInput.readOnly = true;
    }
    
    if (taxesInput) {
      taxesInput.value = formatINR(taxes);
      taxesInput.readOnly = true;
    }
  }

  /* ── wire up one slider ── */
  function initSlider(fieldSelector, ticks, labelFormatter, valueFormatter, min, max, step) {
    const field = document.querySelector(fieldSelector);
    if (!field) return;

    const input = field.querySelector('input[type="range"]');
    if (!input) return;

    // Set slider attributes
    input.min = min;
    input.max = max;
    input.step = step;

    const rangeWrapper = field.querySelector('.range-widget-wrapper');

    // build UI
    const valueBox = buildValueBox(field, input, valueFormatter);
    if (rangeWrapper) buildLabels(rangeWrapper, ticks, labelFormatter);

    // initial state
    updateTrackFill(input);
    updateSummary();

    // live update
    input.addEventListener('input', () => {
      updateTrackFill(input);
      valueBox.textContent = valueFormatter(input.value);
      updateSummary();
    });
  }

  /* ── wait for AEM form to finish rendering ── */
  function tryInit() {
    const amountInput = document.querySelector(
      '.field-loan-amount-inr input[type="range"]'
    );
    if (!amountInput) {
      // retry until the form mounts
      setTimeout(tryInit, 300);
      return;
    }

    /* Loan Amount slider
       ticks: 50K, 2L, 4L, 6L, 8L, 10L, 15L  */
    initSlider(
      '.field-loan-amount-inr',
      [50000, 200000, 400000, 600000, 800000, 1000000, 1500000],
      formatLabel,   // tick labels  → "50K", "2L" …
      formatINR,     // value box    → "₹15,00,000"
      50000,         // min
      1500000,       // max
      50000          // step
    );

    /* Tenure slider
       ticks: 12m, 24m, 36m, 48m, 60m, 72m, 84m
       Based on the design image showing "84 months" */
    initSlider(
      '.field-loan-tenure-months',
      [12, 24, 36, 48, 60, 72, 84],
      formatMonthLabel,  // tick labels → "12m", "24m" …
      v => v + ' months', // value box → "84 months"
      12,                 // min
      84,                 // max
      12                  // step (12 month increments)
    );
  }

  /* kick off after DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }

})();
