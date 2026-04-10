# Seaside Cruizers Car Show Registration System

Web-based registration system for the Seaside Cruizers Father's Day Car Show with automated dash sheet PDF generation and email delivery.

## Features

- ✅ Online registration form with car details
- ✅ Stripe payment integration ($30 base + optional Poker Run add-on)
- ✅ Google Sheets integration for data tracking
- ✅ Automated PDF dash sheet generation (PDFShift)
- ✅ Email delivery to participants with dash sheet attachment
- ✅ Sequential entry number assignment
- ✅ Admin email notifications

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express (Vercel Serverless Functions)
- **Payment**: Stripe
- **PDF Generation**: PDFShift API
- **Email**: Nodemailer (Brevo recommended, Mailgun/Gmail fallback) - *Supports multiple services automatically*
- **Database**: Google Sheets API
- **Hosting**: Vercel

## Environment Variables

Required environment variables (set in Vercel Dashboard → Settings → Environment Variables):

```bash
# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service (choose one: Brevo recommended, Mailgun, or Gmail as fallback)
# Brevo (recommended - 300 emails/day free FOREVER, excellent deliverability)
BREVO_SMTP_KEY=your-smtp-key-here  # Generated from Brevo dashboard
BREVO_SMTP_USER=your-email@example.com  # Your Brevo account email or verified sender
BREVO_SMTP_HOST=smtp-relay.brevo.com  # Optional, defaults to this
BREVO_SMTP_PORT=587  # Optional, defaults to 587
EMAIL_FROM_ADDRESS=your-verified-email@example.com  # Must be verified sender
EMAIL_FROM_NAME=Seaside Cruizers Car Show  # Optional - friendly sender name
EMAIL_REPLY_TO=your-email@example.com  # Optional - reply-to address

# Mailgun (alternative - 100 emails/day, 30-day trial)
MAILGUN_API_KEY=key-your-api-key-here
MAILGUN_DOMAIN=your-domain.mailgun.org
MAILGUN_REGION=us

# Gmail (fallback - only used if Brevo/Mailgun not configured)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# PDFShift (for PDF generation)
PDFSHIFT_API_KEY=sk_...

# Google Sheets (optional - for entry numbering and data tracking)
GOOGLE_SHEETS_ID=your-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Poker Run Limit (optional - defaults to 100 if not set)
POKER_RUN_MAX_LIMIT=50
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Add all required environment variables to Vercel Dashboard.

### 3. Deploy to Vercel
```bash
git push origin master
```
Vercel will auto-deploy from GitHub.

### 4. Test the System
```bash
curl -X POST https://your-domain.vercel.app/api/test-dashsheet \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## How It Works

### Registration Flow
1. User fills out registration form
2. Stripe checkout processes payment
3. Webhook receives successful payment event
4. System assigns sequential entry number
5. Registration added to Google Sheets
6. PDF dash sheet generated with entry number
7. Email sent to participant with PDF attachment
8. Admin notification email sent

### Entry Number System
- Entry numbers are assigned sequentially (1, 2, 3...)
- Based on Google Sheets row count
- Automatically increments with each registration
- Formatted as 3-digit numbers (001, 042, 999)

### Text Normalization
All text input is automatically normalized for professional appearance:
- **Names & Locations**: Title Case (`JOHN DOE` → `John Doe`)
- **Car Details**: Title Case (`CHEVROLET` → `Chevrolet`)
- **Email**: Lowercase (`JOHN@EXAMPLE.COM` → `john@example.com`)
- **Postal Code**: Uppercase (`v9p 2h3` → `V9P 2H3`)
- **Special Cases**: Handles O'Brien, Mary-Jane, etc.

This ensures consistent, professional formatting in Google Sheets, emails, and PDF dash sheets regardless of how users type their information.

## API Endpoints

### `/api/create-checkout-session` (POST)
Creates Stripe checkout session for registration payment.

### `/api/webhook` (POST)
Handles Stripe webhook events (payment success, registration processing).

### `/api/test-dashsheet` (POST)
Test endpoint for PDF generation and email delivery.
```json
{ "email": "test@example.com" }
```

### `/api/regenerate-dashsheet` (POST)
Manually regenerate and send a dash sheet PDF. Useful for correcting errors or resending dash sheets.

**Club admin UI:** After deploy, open `/admin-dashsheet.html` on your live site (bookmark it). It posts to this endpoint; set optional `ADMIN_KEY` in Vercel if you want the form to require a key.

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "year": "1965",
  "make": "Chevrolet",
  "model": "Impala",
  "city": "Parksville",
  "province": "BC",
  "entryNumber": 42,
  "pokerRunNumber": 15,
  "adminKey": "optional-admin-key"
}
```

**Note:** Set `ADMIN_KEY` in Vercel for extra protection (optional but recommended). `pokerRunNumber` is optional (omit if they did not purchase the Poker Run).

**Docs:** Column layout and entry/Poker Run numbering in Google Sheets are described in `GOOGLE_SHEETS_SETUP.md` and `POKER_RUN_NUMBER_SETUP.md`.

## Development

### Local Development
```bash
npm start
```
Runs Express server on `http://localhost:3000`

### Testing
- **Test registration**: Use Stripe test card `4242 4242 4242 4242`
- **Test PDF**: Use `/api/test-dashsheet` endpoint
- **View logs**: `vercel logs --follow`

### Temporarily disable registrations (testing)
- In `index.html` and `main.js`, set `TESTING_MODE` to `true` to block the register button and form submission; set back to `false` when you are done testing.

## File Structure

```
seaside-cruizers/
├── api/
│   ├── utils/
│   │   ├── pdfGenerator.js       # PDF generation with PDFShift
│   │   ├── textNormalizer.js     # Text capitalization utilities
│   │   └── emailTransporter.js   # Brevo / Mailgun / Gmail SMTP
│   ├── create-checkout-session.js
│   ├── webhook.js                # Stripe webhook → Sheets, email, PDF
│   ├── check-poker-run-availability.js
│   ├── regenerate-dashsheet.js   # Manual resend dash sheet
│   └── test-dashsheet.js         # Test PDF + email
├── index.html
├── registration.html
├── admin-dashsheet.html          # Admin form → regenerate-dashsheet
├── admin-dashsheet.css
├── success.html
├── dashsheet.html                # PDF template
├── main.js
├── styles.css
├── robots.txt
├── vercel.json
├── package.json
├── README.md
├── GOOGLE_SHEETS_SETUP.md
└── POKER_RUN_NUMBER_SETUP.md
```

## Customization

### Change Dash Sheet Design
1. Edit `dashsheet.html`
2. Modify CSS styles
3. Deploy: `git push`
4. Test: `/api/test-dashsheet`

Template placeholders:
- `{{entryNumber}}` - Auto-generated entry number
- `{{year}}`, `{{make}}`, `{{model}}` - Car details
- `{{ownerName}}` - Participant name
- `{{city}}`, `{{province}}` - Location

### Change Pricing
Update the base fee and Poker Run add-on in `registration.html`, `main.js`, and `api/create-checkout-session.js` so amounts stay in sync.

## Costs

- **Vercel Hosting**: Free (Hobby plan)
- **PDFShift**: $9/month for 250 PDFs (Starter plan)
- **Brevo**: Free (300 emails/day forever) - *Recommended for transactional emails*
- **Mailgun**: Free (100 emails/day, 30-day trial) - *Alternative option*
- **Gmail**: Free (500 emails/day) - *Fallback option, not recommended for bulk sending*
- **Stripe**: 2.9% + $0.30 per transaction
- **Total**: ~$9/month + transaction fees

## Email Deliverability

**The system now supports Brevo (recommended), Mailgun, and Gmail (fallback).**

### Brevo (recommended)
- **300 emails/day** on the free tier, aimed at transactional mail
- In Brevo, create an **SMTP key** (not your account password) and use it as `BREVO_SMTP_KEY`
- `BREVO_SMTP_USER` must match the SMTP login Brevo shows (often your account email or verified sender)
- Verify the **sender** you use in `EMAIL_FROM_ADDRESS` (or equivalent) in the Brevo dashboard

### Mailgun (alternative)
- Set `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` per the env block above; verify the domain in Mailgun if required

### Gmail (fallback only)
- Not ideal for bulk mail; messages often land in spam. Prefer Brevo or Mailgun for production.

**Order of use:** Brevo if `BREVO_SMTP_KEY` and `BREVO_SMTP_USER` are set, else Mailgun if configured, else Gmail.

## Troubleshooting

### PDF Not Generated
- Verify `PDFSHIFT_API_KEY` is set in Vercel
- Check PDFShift dashboard for errors
- Review Vercel logs: `vercel logs --follow`

### Email Not Sent / Going to Spam
- **Brevo:** Confirm `BREVO_SMTP_KEY` is the **SMTP key** from Brevo (not the account password). Confirm `BREVO_SMTP_USER` matches Brevo’s SMTP login. If you see **535 / authentication failed**, generate a new SMTP key and update both values; ensure the from-address is verified in Brevo.
- **Mailgun:** Check `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, and regional settings; review sending logs in the Mailgun dashboard.
- **Gmail:** Use an **app password** if 2FA is on; expect more spam-folder placement than with Brevo/Mailgun.
- **Recipients:** Ask them to check spam/junk; inbox rules can hide transactional mail even when delivery succeeds.

### Entry Numbers Not Sequential
- Verify Google Sheets is connected
- Check `GOOGLE_SHEETS_ID` environment variable
- Review Google Sheets API credentials

### Deployment Failed
- Check Vercel dashboard for error messages
- Verify `.vercelignore` isn't excluding needed files
- Ensure all dependencies in `package.json`

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **PDFShift Docs**: https://pdfshift.io/docs
- **Vercel Logs**: `vercel logs --follow`

## License

ISC

---

**Event**: Seaside Cruizers Father's Day Show and Shine  
**Date**: June 19-21, 2026  
**Location**: Parksville – Qualicum Beach, BC

