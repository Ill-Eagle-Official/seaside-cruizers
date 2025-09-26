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

// Handle form submission and Stripe Checkout
const form = document.getElementById('registrationForm');
const payNowBtn = document.getElementById('payNow');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const userFirstName = document.getElementById('userFirstName');

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  payNowBtn.disabled = true;
  payNowBtn.textContent = 'Processing...';

  // Collect form data
  const formData = {
    firstName: form.firstName.value.trim(),
    lastName: form.lastName.value.trim(),
    email: form.email.value.trim(),
    country: form.country.value.trim(),
    province: form.province.value.trim(),
    city: form.city.value.trim(),
    postalCode: form.postalCode.value.trim(),
    make: form.make.value.trim(),
    model: form.model.value.trim(),
    year: form.year.value.trim(),
    clubName: form.clubName.value.trim(),
    buyHat: buyHat.checked,
    hatColour: buyHat.checked ? form.hatColour.value : '',
    hatSize: buyHat.checked ? form.hatSize.value : '',
    buyShirt: buyShirt.checked,
    shirtColour: buyShirt.checked ? form.shirtColour.value : '',
    shirtGender: buyShirt.checked ? form.shirtGender.value : '',
    shirtSize: buyShirt.checked ? form.shirtSize.value : '',
    origin: window.location.origin
  };

  // Basic client-side validation (in addition to HTML5)
  if (!form.checkValidity()) {
    form.reportValidity();
    payNowBtn.disabled = false;
    payNowBtn.textContent = 'Pay Now';
    return;
  }

  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('No Stripe URL returned');
    }
  } catch (err) {
    errorMessage.classList.remove('hidden');
    payNowBtn.disabled = false;
    payNowBtn.textContent = 'Pay Now';
  }
});

// Show success or error message after redirect
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === 'true') {
    userFirstName.textContent = params.get('firstName') || '';
    successMessage.classList.remove('hidden');
    setTimeout(() => {
      window.location.href = '/';
    }, 4000);
  } else if (params.get('canceled') === 'true') {
    errorMessage.classList.remove('hidden');
  }
});
