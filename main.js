// Pricing constants
const BASE_FEE = 30;
const POKER_RUN_PRICE = 5;

// DOM elements
const pokerRun = document.getElementById('pokerRun');
const pokerRunFee = document.getElementById('pokerRunFee');
const totalFee = document.getElementById('totalFee');
const makeSelect = document.getElementById('make');
const customMakeGroup = document.getElementById('customMakeGroup');
const customMakeInput = document.getElementById('customMake');
const provinceSelect = document.getElementById('province');
const customProvinceGroup = document.getElementById('customProvinceGroup');
const customProvinceInput = document.getElementById('customProvince');

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

// Handle "Other" make selection - show/hide custom make input
makeSelect.addEventListener('change', function() {
  if (this.value === 'Other') {
    customMakeGroup.style.display = 'block';
    customMakeInput.required = true;
  } else {
    customMakeGroup.style.display = 'none';
    customMakeInput.required = false;
    customMakeInput.value = ''; // Clear the value when hidden
  }
});

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
  const TESTING_MODE = false; // Set to false to re-enable registrations
  if (TESTING_MODE) {
    e.preventDefault();
    alert('Registration is temporarily disabled for testing. Please contact the administrator.');
    return false;
  }
  
  e.preventDefault();
  
  // Prevent double-submission
  if (payNowBtn.disabled) {
    return;
  }
  
  payNowBtn.disabled = true;
  const payNowText = document.getElementById('payNowText');
  const payNowSpinner = document.getElementById('payNowSpinner');
  if (payNowText) payNowText.textContent = 'Processing...';
  if (payNowSpinner) payNowSpinner.classList.remove('hidden');

  // Collect form data
  // If "Other" is selected, use the custom make value; otherwise use the selected make
  const selectedMake = form.make.value.trim();
  const customMake = form.customMake ? form.customMake.value.trim() : '';
  const finalMake = (selectedMake === 'Other' && customMake) ? customMake : selectedMake;
  
  // If "Other" country is selected, use custom province; otherwise use the selected province
  const selectedCountry = form.country.value.trim();
  const customProvince = form.customProvince ? form.customProvince.value.trim() : '';
  const finalProvince = (selectedCountry === 'Other' && customProvince) ? customProvince : form.province.value.trim();
  
  const formData = {
    firstName: form.firstName.value.trim(),
    lastName: form.lastName.value.trim(),
    email: form.email.value.trim(),
    country: selectedCountry,
    province: finalProvince,
    city: form.city.value.trim(),
    postalCode: form.postalCode.value.trim(),
    make: finalMake,
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
    const payNowText = document.getElementById('payNowText');
    const payNowSpinner = document.getElementById('payNowSpinner');
    if (payNowText) payNowText.textContent = 'Pay Now';
    if (payNowSpinner) payNowSpinner.classList.add('hidden');
    return;
  }
  
  // Additional validation: if "Other" is selected, custom make must be filled
  if (selectedMake === 'Other' && !customMake) {
    alert('Please specify the make of your car.');
    customMakeInput.focus();
    payNowBtn.disabled = false;
    const payNowText1 = document.getElementById('payNowText');
    const payNowSpinner1 = document.getElementById('payNowSpinner');
    if (payNowText1) payNowText1.textContent = 'Pay Now';
    if (payNowSpinner1) payNowSpinner1.classList.add('hidden');
    return;
  }
  
  // Additional validation: if "Other" country is selected, custom province must be filled
  if (selectedCountry === 'Other' && !customProvince) {
    alert('Please specify your province, state, or region.');
    if (customProvinceInput) {
      customProvinceInput.focus();
    }
    payNowBtn.disabled = false;
    const payNowText2 = document.getElementById('payNowText');
    const payNowSpinner2 = document.getElementById('payNowSpinner');
    if (payNowText2) payNowText2.textContent = 'Pay Now';
    if (payNowSpinner2) payNowSpinner2.classList.add('hidden');
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
    console.error('Registration error:', err);
    errorMessage.classList.remove('hidden');
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    payNowBtn.disabled = false;
    const payNowText = document.getElementById('payNowText');
    const payNowSpinner = document.getElementById('payNowSpinner');
    if (payNowText) payNowText.textContent = 'Pay Now';
    if (payNowSpinner) payNowSpinner.classList.add('hidden');
    
    // Show more specific error message if available
    const errorText = errorMessage.querySelector('p');
    if (errorText && err.message) {
      errorText.textContent = `There was a problem processing your payment: ${err.message}. Please try again.`;
    }
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
