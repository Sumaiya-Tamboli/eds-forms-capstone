(function () {

  /* === Formatters === */
  function formatINR(val) {
    return '\u20B9' + Number(val).toLocaleString('en-IN');
  }

  function formatLabel_amount(val) {
    val = Number(val);
    if (val >= 100000) return (val / 100000) + 'L';
    if (val >= 1000)   return (val / 1000) + 'K';
    return String(val);
  }

  function formatLabel_tenure(val) {
    return val + 'm';
  }

  /* === Orange fill — sets inline gradient on the input === */
  function updateFill(input) {
    var min = Number(input.min) || 0;
    var max = Number(input.max) || 100;
    var val = Number(input.value) || 0;
    var pct = ((val - min) / (max - min)) * 100;
    input.style.background =
      'linear-gradient(to right,' +
      '#f59e0b 0%,' +
      '#f59e0b ' + pct + '%,' +
      '#e5e7eb ' + pct + '%,' +
      '#e5e7eb 100%)';
  }

  /* === Build label+value box row above slider === */
  function buildLabelRow(fieldEl, input, valueFormatter) {
    /* reuse if already built */
    if (fieldEl.querySelector('.label-row')) return;

    var originalLabel = fieldEl.querySelector('label.field-label');
    if (!originalLabel) return;

    /* create wrapper row */
    var row = document.createElement('div');
    row.className = 'label-row';

    /* move original label into row */
    var labelClone = originalLabel.cloneNode(true);
    originalLabel.style.display = 'none';
    row.appendChild(labelClone);

    /* value display box */
    var box = document.createElement('div');
    box.className = 'loan-value-display';
    box.textContent = valueFormatter(input.value);
    row.appendChild(box);

    /* insert row before the range-widget-wrapper */
    var rangeWrapper = fieldEl.querySelector('.range-widget-wrapper');
    if (rangeWrapper) {
      fieldEl.insertBefore(row, rangeWrapper);
    } else {
      fieldEl.insertBefore(row, fieldEl.firstChild);
    }

    return box;
  }

  /* === Build tick marks below slider === */
  function buildTicks(fieldEl, ticks, formatter) {
    if (fieldEl.querySelector('.loan-ticks-row')) return;

    var rangeWrapper = fieldEl.querySelector('.range-widget-wrapper');
    if (!rangeWrapper) return;

    var row = document.createElement('div');
    row.className = 'loan-ticks-row';

    ticks.forEach(function (t) {
      var span = document.createElement('span');
      var em = document.createElement('em');
      em.textContent = formatter(t);
      span.appendChild(em);
      row.appendChild(span);
    });

    rangeWrapper.appendChild(row);
  }

  /* === Wire up one slider field === */
  function initSlider(fieldEl, config) {
    var input = fieldEl.querySelector('input[type="range"]');
    if (!input) return;
    if (fieldEl.dataset.sliderInited) return;
    fieldEl.dataset.sliderInited = 'true';

    /* set max value by default to match Image 2 */
    if (config.defaultMax) {
      input.value = input.max;
    }

    /* build UI */
    var valueBox = buildLabelRow(fieldEl, input, config.valueFormatter);
    buildTicks(fieldEl, config.ticks, config.tickFormatter);

    /* initial fill */
    updateFill(input);

    /* live update */
    input.addEventListener('input', function () {
      updateFill(input);
      if (valueBox) valueBox.textContent = config.valueFormatter(input.value);
    });
  }

  /* === Configs for each slider === */
  var sliderConfigs = {
    '.field-loan-amount-inr': {
      ticks: [50000, 200000, 400000, 600000, 800000, 1000000, 1500000],
      tickFormatter: formatLabel_amount,
      valueFormatter: formatINR,
      defaultMax: true
    },
    '.field-loan-tenure-months': {
      ticks: [12, 24, 36, 48, 60, 72, 84],
      tickFormatter: formatLabel_tenure,
      valueFormatter: function (v) { return v + ' months'; },
      defaultMax: true
    }
  };

  /* === Init all sliders found right now === */
  function initAll() {
    Object.keys(sliderConfigs).forEach(function (selector) {
      var el = document.querySelector(selector);
      if (el) initSlider(el, sliderConfigs[selector]);
    });
  }

  /* === MutationObserver — watches DOM for slider appearance === */
  function watchAndInit() {
    initAll(); /* try immediately */

    var observer = new MutationObserver(function () {
      initAll();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });

    /* stop watching after 15s (form should be loaded by then) */
    setTimeout(function () { observer.disconnect(); }, 15000);
  }

  /* === Boot === */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchAndInit);
  } else {
    watchAndInit();
  }

})();