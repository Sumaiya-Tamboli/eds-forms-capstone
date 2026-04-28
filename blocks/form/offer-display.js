(function () {

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

  function formatMonths(val) {
    return val + ' mo';
  }

  /* ── orange fill on webkit (CSS can't do it natively) ── */
  function updateTrackFill(input) {
    const min  = Number(input.min)   || 0;
    const max  = Number(input.max)   || 100;
    const val  = Number(input.value) || 0;
    const pct  = ((val - min) / (max - min)) * 100;
    input.style.background =
      `linear-gradient(to right,
        #f59e0b 0%, #f59e0b ${pct}%,
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

  /* ── build the value display box beside the label ── */
  function buildValueBox(fieldWrapper, input, formatter) {
    let box = fieldWrapper.querySelector('.loan-value-display');
    if (!box) {
      box = document.createElement('div');
      box.className = 'loan-value-display';
      // insert after the <label>
      const label = fieldWrapper.querySelector('label');
      if (label) label.after(box);
    }
    box.textContent = formatter(input.value);
    return box;
  }

  /* ── wire up one slider ── */
  function initSlider(fieldSelector, ticks, labelFormatter, valueFormatter) {
    const field = document.querySelector(fieldSelector);
    if (!field) return;

    const input = field.querySelector('input[type="range"]');
    if (!input) return;

    const rangeWrapper = field.querySelector('.range-widget-wrapper');

    // build UI
    const valueBox = buildValueBox(field, input, valueFormatter);
    if (rangeWrapper) buildLabels(rangeWrapper, ticks, labelFormatter);

    // initial state
    updateTrackFill(input);

    // live update
    input.addEventListener('input', () => {
      updateTrackFill(input);
      valueBox.textContent = valueFormatter(input.value);
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
      formatINR      // value box    → "₹15,00,000"
    );

    /* Tenure slider — adjust ticks to your min/max */
    initSlider(
      '.field-loan-tenure-months',
      [6, 12, 24, 36, 48, 60],
      formatMonths,
      v => v + ' months'
    );
  }

  /* kick off after DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }

})();