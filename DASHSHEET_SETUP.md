# Dash Sheet PDF Generation Setup

## Overview

This implementation automatically generates and emails personalized dash sheet PDFs to participants when they complete registration and payment through Stripe.

## How It Works

1. **Participant registers** → Completes Stripe checkout
2. **Webhook triggered** → `api/webhook.js` receives the `checkout.session.completed` event
3. **Entry number assigned** → Based on Google Sheets row count (or fallback numbering)
4. **PDF generated** → `dashsheet.html` template is populated with participant data
5. **Email sent** → PDF is emailed to the participant's email address

## Technologies Used

### PDF Generation
- **@sparticuz/chromium** - Serverless-optimized Chromium binary (~45MB)
- **puppeteer-core** - Headless browser automation for HTML→PDF conversion

These packages are specifically designed for serverless environments like Vercel and stay within deployment size limits.

### Email Delivery
- **nodemailer** - Already configured in your project

## Files Modified/Created

### New Files
- `api/utils/pdfGenerator.js` - Core PDF generation and email logic
- `api/test-dashsheet.js` - Test endpoint for manual testing
- `DASHSHEET_SETUP.md` - This documentation

### Modified Files
- `api/webhook.js` - Integrated PDF generation into registration flow
- `vercel.json` - Increased memory and timeout for webhook function
- `package.json` - Added new dependencies

## Configuration

### Environment Variables (Already Set)
- `GMAIL_USER` - Gmail address for sending emails
- `GMAIL_PASS` - Gmail app password
- `GOOGLE_SHEETS_ID` - For entry number tracking
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - For Google Sheets API
- `GOOGLE_PRIVATE_KEY` - For Google Sheets API

No new environment variables are required!

## Vercel Configuration

Updated `vercel.json` to allocate more resources for PDF generation:

```json
{
  "functions": {
    "api/webhook.js": {
      "memory": 3008,  // Maximum memory (3GB)
      "maxDuration": 60 // 60 seconds timeout
    }
  }
}
```

This is necessary because:
- PDF generation with Puppeteer is memory-intensive
- First cold start can take 5-10 seconds to initialize Chromium
- Subsequent requests are faster (2-3 seconds)

## Testing

### Option 1: Test Endpoint (Recommended for Development)

```bash
# Deploy to Vercel first
vercel --prod

# Test the endpoint
curl -X POST https://your-domain.vercel.app/api/test-dashsheet \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@example.com"}'
```

This will:
- Generate a test dash sheet with sample data
- Send it to the specified email address
- Return JSON with success status and PDF size

### Option 2: Full Integration Test

1. Complete a real registration on your site
2. Check the participant's email inbox
3. Verify the PDF attachment is received and properly formatted

## Entry Number Logic

Entry numbers are assigned using this priority:

1. **Google Sheets row number** (preferred)
   - If Google Sheets is configured, uses the row number after insertion
   - Ensures sequential numbering: 1, 2, 3, etc.

2. **Fallback numbering** (if Sheets unavailable)
   - Uses timestamp-based numbering
   - Less predictable but ensures unique numbers

## Dash Sheet Template

The `dashsheet.html` template uses these placeholders:

| Placeholder | Data Source | Example |
|------------|-------------|---------|
| `{{entryNumber}}` | Google Sheets row or fallback | `042` |
| `{{year}}` | Registration form | `1969` |
| `{{make}}` | Registration form | `Chevrolet` |
| `{{model}}` | Registration form | `Camaro SS` |
| `{{ownerName}}` | First + Last name | `John Doe` |
| `{{city}}` | Registration form | `Parksville` |
| `{{province}}` | Registration form | `BC` |

The logo (`seaside-cruizers.jpg`) is automatically converted to base64 and embedded in the PDF.

## Email Template

Participants receive:
- **Subject**: "Your Seaside Cruizers Car Show Dash Sheet"
- **Body**: Formatted HTML email with event details and instructions
- **Attachment**: `Dashsheet-XXX.pdf` (where XXX is their entry number)

## Performance Considerations

### Cold Starts
- First PDF generation after deployment: **5-10 seconds**
- Subsequent generations: **2-3 seconds**
- Vercel keeps functions "warm" for ~5 minutes after last use

### Memory Usage
- Chromium binary: ~45MB
- Runtime memory: 100-300MB during PDF generation
- Total function size: ~50-60MB (within Vercel's 50MB limit for Pro)

### Timeout
- Default Vercel timeout: 10 seconds (Hobby), 60 seconds (Pro)
- This implementation requires Pro plan or Hobby with request buffering

## Troubleshooting

### Issue: PDF Generation Timeout
**Solution**: 
- Ensure you're on Vercel Pro plan, or
- Increase `maxDuration` in `vercel.json`, or
- Use an external PDF service (DocRaptor, PDFShift)

### Issue: Function Size Too Large
**Solution**:
- Already using minimal packages (@sparticuz/chromium)
- If still too large, consider external PDF service

### Issue: PDF Not Sent
**Check**:
1. Vercel function logs: `vercel logs`
2. Email credentials are valid
3. Recipient email is correct in metadata
4. Gmail hasn't blocked the email (check spam)

### Issue: Entry Numbers Not Sequential
**Check**:
1. Google Sheets integration is working
2. Environment variables are set correctly
3. Check `addToGoogleSheets` function logs

## Cost Considerations

### Vercel
- Hobby plan: Might timeout on first cold start
- **Pro plan recommended**: $20/month
  - 100GB bandwidth
  - 60-second function timeout
  - More memory allocation

### Email
- Gmail free tier: 500 emails/day
- For higher volume, consider:
  - Gmail workspace ($6/user/month)
  - SendGrid (free: 100/day, paid plans available)
  - AWS SES (very cheap: $0.10 per 1,000 emails)

## Alternative Solutions

If you encounter issues with Puppeteer on Vercel:

### 1. External PDF Service
```javascript
// Example with PDFShift
const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${Buffer.from('api:your-api-key').toString('base64')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ source: html })
});
```

Cost: ~$15/month for 1,000 conversions

### 2. @react-pdf/renderer
Programmatic PDF creation (no Chromium needed):
- Pros: Lightweight (~5MB), fast, serverless-friendly
- Cons: Would need to recreate template in React-PDF format (no HTML)

## Deployment

```bash
# Install dependencies (already done)
npm install

# Test locally if possible
npm start

# Deploy to Vercel
vercel --prod

# Test the deployment
curl -X POST https://your-domain.vercel.app/api/test-dashsheet \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

## Support

If you need to modify the dash sheet design:
1. Edit `dashsheet.html` directly
2. Changes are automatically picked up (no code changes needed)
3. Test using the `/api/test-dashsheet` endpoint

---

**Created**: November 2025  
**Last Updated**: November 2025

