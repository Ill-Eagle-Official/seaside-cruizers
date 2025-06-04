// Swag and pricing constants
const BASE_FEE = 30;
const HAT_PRICE = 15;
const SHIRT_PRICE = 20;

// DOM elements
const buyHat = document.getElementById('buyHat');
const buyShirt = document.getElementById('buyShirt');
const hatOptions = document.getElementById('hatOptions');
const shirtOptions = document.getElementById('shirtOptions');
const hatFee = document.getElementById('hatFee');
const shirtFee = document.getElementById('shirtFee');
const totalFee = document.getElementById('totalFee');

// Show/hide swag options
buyHat.addEventListener('change', () => {
  hatOptions.style.display = buyHat.checked ? 'block' : 'none';
  updatePricing();
});
buyShirt.addEventListener('change', () => {
  shirtOptions.style.display = buyShirt.checked ? 'block' : 'none';
  updatePricing();
});

// Update pricing summary
function updatePricing() {
  let hat = buyHat.checked ? HAT_PRICE : 0;
  let shirt = buyShirt.checked ? SHIRT_PRICE : 0;
  hatFee.textContent = `$${hat}`;
  shirtFee.textContent = `$${shirt}`;
  totalFee.textContent = `$${BASE_FEE + hat + shirt}`;
}

// Initial pricing update
updatePricing();

// Optionally, update price if swag options are changed (e.g., size/color)
// (Not needed for price, but could be used for validation later)
