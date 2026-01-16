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

// Check Poker Run availability on page load
async function checkPokerRunAvailability() {
  try {
    const response = await fetch('/api/check-poker-run-availability');
    const data = await response.json();
    
    if (!data.available) {
      // Disable the checkbox and show message
      pokerRun.disabled = true;
      pokerRun.checked = false;
      updatePricing();
      
      // Update the label to show it's full
      const label = document.querySelector('label[for="pokerRun"]');
      if (label) {
        label.style.color = '#999';
        label.style.cursor = 'not-allowed';
        label.innerHTML = 'Join the Poker Run (+$5) <span style="color: #e74c3c; font-weight: bold;">(FULL)</span>';
      }
      
      // Update the description (find the p tag after the checkbox)
      const pokerRunFieldset = pokerRun.closest('fieldset');
      const description = pokerRunFieldset ? pokerRunFieldset.querySelector('p') : null;
      if (description) {
        description.textContent = 'The Poker Run is currently full. All spots have been taken.';
        description.style.color = '#e74c3c';
        description.style.fontWeight = 'bold';
      }
    } else if (data.remaining !== undefined && data.remaining < 10) {
      // Show warning if less than 10 spots remaining
      const pokerRunFieldset = pokerRun.closest('fieldset');
      const description = pokerRunFieldset ? pokerRunFieldset.querySelector('p') : null;
      if (description) {
        description.innerHTML = `The Poker Run is a fun driving event where participants collect cards at various checkpoints to make the best poker hand! <strong style="color: #f39c12;">Only ${data.remaining} spot${data.remaining === 1 ? '' : 's'} remaining!</strong>`;
      }
    }
  } catch (err) {
    console.error('Error checking Poker Run availability:', err);
    // On error, allow registration to continue (fail open)
  }
}

// Check availability when page loads
checkPokerRunAvailability();

// Handle form submission and Stripe Checkout
const form = document.getElementById('registrationForm');
const payNowBtn = document.getElementById('payNow');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const userFirstName = document.getElementById('userFirstName');

form.addEventListener('submit', async function (e) {
  // TEMPORARILY DISABLED FOR TESTING - Remove this block to re-enable
  const TESTING_MODE = true; // Set to false to re-enable registrations
  if (TESTING_MODE) {
    e.preventDefault();
    alert('Registration is temporarily disabled for testing. Please contact the administrator.');
    return false;
  }
  
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
    
    if (!response.ok) {
      // Handle Poker Run full error
      if (data.pokerRunFull) {
        pokerRun.checked = false;
        updatePricing();
        checkPokerRunAvailability(); // Refresh availability
        alert('Poker Run is full. All spots have been taken. Your registration will continue without the Poker Run add-on.');
        // Retry without Poker Run
        formData.pokerRun = false;
        const retryResponse = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const retryData = await retryResponse.json();
        if (retryData.url) {
          window.location.href = retryData.url;
          return;
        }
      }
      throw new Error(data.error || 'Failed to create checkout session');
    }
    
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
