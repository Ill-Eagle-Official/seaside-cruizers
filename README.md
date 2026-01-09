# Seaside Cruizers Car Show Registration System

Web-based registration system for the Seaside Cruizers Father's Day Car Show with automated dash sheet PDF generation and email delivery.

## Features

- ✅ Online registration form with car details
- ✅ Stripe payment integration ($30 base + optional swag)
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
- **Email**: Nodemailer (Gmail)
- **Database**: Google Sheets API
- **Hosting**: Vercel

## Environment Variables

Required environment variables (set in Vercel Dashboard → Settings → Environment Variables):

```bash
# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Gmail (for sending emails)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# PDFShift (for PDF generation)
PDFSHIFT_API_KEY=sk_...

# Google Sheets (optional - for entry numbering and data tracking)
GOOGLE_SHEETS_ID=your-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
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
  "adminKey": "optional-admin-key"
}
```
**Note:** Set `ADMIN_KEY` environment variable for security (optional but recommended).

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

## File Structure

```
seaside-cruizers/
├── api/
│   ├── utils/
│   │   ├── pdfGenerator.js      # PDF generation with PDFShift
│   │   └── textNormalizer.js    # Text capitalization utilities
│   ├── create-checkout-session.js
│   ├── webhook.js               # Main registration handler
│   └── test-dashsheet.js        # Test endpoint
├── index.html                   # Landing page
├── registration.html            # Registration form
├── dashsheet.html              # PDF template
├── main.js                     # Frontend logic
├── styles.css                  # Styling
├── seaside-cruizers.jpg        # Logo
├── vercel.json                 # Vercel configuration
├── package.json                # Dependencies
└── README.md                   # This file
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
Update in `registration.html` and `api/create-checkout-session.js`:
- Base registration fee
- Hat price
- Shirt price

## Costs

- **Vercel Hosting**: Free (Hobby plan)
- **PDFShift**: $9/month for 250 PDFs (Starter plan)
- **Gmail**: Free (500 emails/day)
- **Stripe**: 2.9% + $0.30 per transaction
- **Total**: ~$9/month + transaction fees

## Troubleshooting

### PDF Not Generated
- Verify `PDFSHIFT_API_KEY` is set in Vercel
- Check PDFShift dashboard for errors
- Review Vercel logs: `vercel logs --follow`

### Email Not Sent
- Verify `GMAIL_USER` and `GMAIL_PASS` are correct
- Check spam folder
- Ensure Gmail app password (not regular password)

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

