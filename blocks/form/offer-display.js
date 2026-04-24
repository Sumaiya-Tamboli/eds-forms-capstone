const range = document.querySelector('.loan-range');

range.addEventListener('input', () => {
  const value = (range.value - range.min) / (range.max - range.min) * 100;
  range.style.background = `linear-gradient(to right, #f59e0b ${value}%, #ddd ${value}%)`;
});