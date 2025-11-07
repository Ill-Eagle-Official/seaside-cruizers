// Pricing constants
const BASE_FEE = 30;
const POKER_RUN_PRICE = 5;

// DOM elements
const pokerRun = document.getElementById('pokerRun');
const pokerRunFee = document.getElementById('pokerRunFee');
const totalFee = document.getElementById('totalFee');

// Update pricing when poker run checkbox changes
pokerRun.addEventListener('change', () => {
  updatePricing();
});

// Update pricing summary
function updatePricing() {
  let pokerRunCost = pokerRun.checked ? POKER_RUN_PRICE : 0;
  pokerRunFee.textContent = `$${pokerRunCost}`;
  totalFee.textContent = `$${BASE_FEE + pokerRunCost}`;
}

// Initial pricing update
updatePricing();

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
    pokerRun: pokerRun.checked,
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
