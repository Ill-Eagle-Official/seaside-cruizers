# Quick Start: Dash Sheet PDF Feature

## What's New?

Your site now automatically sends personalized dash sheet PDFs to participants after they register and pay!

## Quick Deploy

```bash
# 1. Deploy to Vercel
vercel --prod

# 2. Test it (replace with your email)
curl -X POST https://your-domain.vercel.app/api/test-dashsheet \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 3. Check your email for the PDF!
```

## What Happens Now?

**Before**: Participant registers → Gets confirmation → Manual work required

**After**: Participant registers → Gets confirmation + **Personalized PDF Dash Sheet automatically!**

## The PDF Includes:
- ✅ Entry number (auto-assigned)
- ✅ Car details (year, make, model)
- ✅ Owner name
- ✅ Location (city, province)
- ✅ Event details
- ✅ Seaside Cruizers logo

## Testing

### Option 1: Quick Test (Recommended)
```bash
# Send test PDF to yourself
curl -X POST https://your-domain.vercel.app/api/test-dashsheet \
  -H "Content-Type: application/json" \
  -d '{"email": "YOUR_EMAIL_HERE"}'
```

### Option 2: Full Test
1. Complete a registration on your site
2. Check the participant's email
3. Verify they received the PDF

## Important Notes

### ⚠️ Vercel Plan Requirements
- **Hobby Plan**: May timeout on cold starts (first request after ~5 min idle)
- **Pro Plan** ($20/mo): Recommended for production use
  - Longer timeout (60s vs 10s)
  - More memory (3GB vs 1GB)
  - More reliable

### 📧 Email Limits
- Gmail Free: 500 emails/day (plenty for most events)
- Emails go to participant's email address from registration form

### 🎯 Entry Numbers
- Automatically assigned based on Google Sheets row number
- Sequential: 1, 2, 3, etc.
- Formatted as 3-digit: 001, 002, 042, etc.

## What Was Changed?

### New Dependencies
- `@sparticuz/chromium` - Serverless-friendly Chromium for PDF generation
- `puppeteer-core` - Headless browser for HTML→PDF conversion

### Modified Files
- `api/webhook.js` - Added PDF generation after successful registration
- `vercel.json` - Increased memory and timeout for webhook
- `api/utils/pdfGenerator.js` - NEW: Core PDF generation logic

### No New Environment Variables Needed! ✅
Your existing Gmail and Google Sheets credentials work as-is.

## Customization

Want to change the dash sheet design?

1. Edit `dashsheet.html`
2. Modify the CSS styles
3. Deploy: `vercel --prod`
4. Test: Use the test endpoint above

**No code changes required!** The template is automatically used.

## Troubleshooting

### "Function timeout" error
→ Upgrade to Vercel Pro plan

### "PDF not received" 
→ Check spam folder
→ Verify `GMAIL_USER` and `GMAIL_PASS` in Vercel environment variables

### "Wrong entry number"
→ Check Google Sheets is connected
→ Verify `GOOGLE_SHEETS_ID` environment variable

## Need Help?

Check the detailed documentation: `DASHSHEET_SETUP.md`

---

**You're all set! 🎉**

Deploy and test to see the magic happen!

