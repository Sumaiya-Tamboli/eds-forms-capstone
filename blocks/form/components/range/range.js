function updateSlider(input, wrapper) {
  const step = input.step || 1;
  const max = input.max;
  const min = input.min;
  const value = input.value;

  const current = Math.ceil((value - min) / step);
  const total = Math.ceil((max - min) / step);

  const bubble = wrapper.querySelector('.range-bubble');

  // ₹ format
  bubble.innerText = `₹${Number(value).toLocaleString('en-IN')}`;

  // Update gradient
  wrapper.style.setProperty('--current-steps', current);
  wrapper.style.setProperty('--total-steps', total);
}

export default async function decorate(fieldDiv, fieldJson) {
  const input = fieldDiv.querySelector('input');

  input.type = 'range';
  input.min = 50000;
  input.max = 1500000;
  input.step = 50000;

  const wrapper = document.createElement('div');
  wrapper.className = 'range-widget-wrapper decorated';

  input.after(wrapper);

  const bubble = document.createElement('div');
  bubble.className = 'range-bubble';

  const stepsContainer = document.createElement('div');
  stepsContainer.className = 'range-steps';

  const labels = ['50K', '2L', '4L', '6L', '8L', '10L', '15L'];

  labels.forEach(label => {
    const span = document.createElement('span');
    span.innerText = label;
    stepsContainer.appendChild(span);
  });

  wrapper.appendChild(bubble);
  wrapper.appendChild(input);
  wrapper.appendChild(stepsContainer);

  input.addEventListener('input', () => {
    updateSlider(input, wrapper);
  });

  updateSlider(input, wrapper);

  return fieldDiv;
}