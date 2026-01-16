# Testing Mode - Registration Disabled

## Current Status

**Registration is currently DISABLED for testing purposes.**

## How to Re-enable Registrations

### Option 1: Remove Testing Mode (Recommended)

1. **In `index.html`** (around line 85):
   - Find `const TESTING_MODE = true;`
   - Change to `const TESTING_MODE = false;`
   - Or remove the entire testing block

2. **In `main.js`** (around line 77):
   - Find `const TESTING_MODE = true;`
   - Change to `const TESTING_MODE = false;`
   - Or remove the entire testing block

### Option 2: Use Date-Based Disabling

The original date-based disabling (January 15, 2026) will automatically work once `TESTING_MODE` is set to `false`.

## Testing Without Disabling

If you want to test but keep registrations open:

1. Set `TESTING_MODE = false` in both files
2. Use Stripe test mode (test card: `4242 4242 4242 4242`)
3. Monitor the Brevo dashboard for email delivery

## After Testing

Once you've verified everything works:
1. Set `TESTING_MODE = false` in both files
2. Commit and push changes
3. Verify the button works on the live site
