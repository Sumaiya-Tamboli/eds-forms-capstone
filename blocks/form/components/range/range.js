function updateBubble(input, element) {
  const step = input.step || 1;
  const max = input.max || 0;
  const min = input.min || 1;
  const value = input.value || 1;

  const current = Math.ceil((value - min) / step);
  const total = Math.ceil((max - min) / step);

  const bubble = element.querySelector('.range-bubble');

  // Format ₹ value
  bubble.innerText = `₹${Number(value).toLocaleString('en-IN')}`;

  // Update gradient steps
  const steps = {
    '--total-steps': total,
    '--current-steps': current,
  };

  const style = Object.entries(steps)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');

  element.setAttribute('style', style);
}

export default async function decorate(fieldDiv, fieldJson) {
  const input = fieldDiv.querySelector('input');

  input.type = 'range';
  input.min = input.min || 50000;
  input.max = input.max || 1500000;
  input.step = fieldJson?.properties?.stepValue || 50000;

  const wrapper = document.createElement('div');
  wrapper.className = 'range-widget-wrapper decorated';

  input.after(wrapper);

  const bubble = document.createElement('span');
  bubble.className = 'range-bubble';

  const stepsContainer = document.createElement('div');
  stepsContainer.className = 'range-steps';

  // Step labels like UI
  const labels = ['50K', '2L', '4L', '6L', '8L', '10L', '15L'];

  labels.forEach(label => {
    const span = document.createElement('span');
    span.innerText = label;
    stepsContainer.appendChild(span);
  });

  const rangeMin = document.createElement('span');
  rangeMin.className = 'range-min';
  rangeMin.innerText = input.min;

  const rangeMax = document.createElement('span');
  rangeMax.className = 'range-max';
  rangeMax.innerText = input.max;

  wrapper.appendChild(bubble);
  wrapper.appendChild(input);
  wrapper.appendChild(stepsContainer);
  wrapper.appendChild(rangeMin);
  wrapper.appendChild(rangeMax);

  input.addEventListener('input', (e) => {
    updateBubble(e.target, wrapper);
  });

  updateBubble(input, wrapper);

  return fieldDiv;
}