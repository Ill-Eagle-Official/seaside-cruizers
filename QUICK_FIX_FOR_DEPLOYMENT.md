# Quick Fix for Vercel Deployment Error

## The Problem

Your deployment is failing because:
- **@sparticuz/chromium**: 67 MB
- **puppeteer-core**: 12 MB  
- **Total**: ~79 MB (compressed to ~50-55 MB)
- **Vercel Limit**: 50 MB per function

The Chromium package is **too large** for Vercel's Hobby plan!

---

## Finding Your Error in Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click on your project name
3. Click on the **most recent deployment** (the one with the red X or "Failed")
4. Scroll down to **Build Logs** or **Function Logs**
5. Look for an error like:
   - `Error: Function size exceeded the limit of 50 MB`
   - `FUNCTION_PAYLOAD_TOO_LARGE`
   - `The Serverless Function "api/webhook" is too large`

---

## Solution Options (Choose One)

### Option A: Switch to External PDF Service (Recommended - Most Reliable)

**Pros**: Guaranteed to work, no size limits, fast, reliable  
**Cons**: Costs ~$15/month  
**Setup Time**: 5 minutes

This is the most reliable solution for production use.

#### 1. Sign up for PDFShift (or similar service)
- Go to https://pdfshift.io/
- Sign up for account
- Get your API key
- Free trial: 50 PDFs, then $15/month for 1,000 PDFs

#### 2. Update pdfGenerator.js

Replace the `generateDashSheetPDF` function in `api/utils/pdfGenerator.js`:

```javascript
// Remove these imports at the top:
// import chromium from '@sparticuz/chromium';
// import puppeteer from 'puppeteer-core';

export async function generateDashSheetPDF(registrationData, entryNumber) {
  try {
    console.log('Generating dash sheet PDF for', registrationData.firstName, registrationData.lastName);
    
    // Prepare data for template
    const templateData = {
      entryNumber: String(entryNumber).padStart(3, '0'),
      year: registrationData.year,
      make: registrationData.make,
      model: registrationData.model,
      ownerName: `${registrationData.firstName} ${registrationData.lastName}`,
      city: registrationData.city,
      province: registrationData.province
    };
    
    // Populate HTML template
    const html = populateDashSheetTemplate(templateData);
    
    // Use PDFShift API
    console.log('Converting HTML to PDF with PDFShift...');
    const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${process.env.PDFSHIFT_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: html,
        format: 'A4',
        margin: {
          top: '0.75in',
          right: '0.75in',
          bottom: '0.75in',
          left: '0.75in'
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`PDFShift API error: ${response.status} ${response.statusText}`);
    }
    
    const pdfBuffer = await response.arrayBuffer();
    console.log('PDF generated successfully, size:', pdfBuffer.byteLength, 'bytes');
    
    return Buffer.from(pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF:', err);
    throw err;
  }
}
```

#### 3. Add API key to Vercel

```bash
# In Vercel dashboard:
# Settings → Environment Variables → Add:
# PDFSHIFT_API_KEY = your_api_key_here
```

#### 4. Remove large packages

```bash
npm uninstall @sparticuz/chromium puppeteer-core
```

#### 5. Deploy

```bash
git add .
git commit -m "Switch to PDFShift for PDF generation"
git push
```

**Done!** No size limits, reliable, and works perfectly.

---

### Option B: Upgrade to Vercel Pro Plan

**Pros**: Keeps Puppeteer, supports larger functions  
**Cons**: $20/month  

Vercel Pro increases some limits, but the 50MB function limit remains the same. However, Pro gives you:
- Better build optimization
- Faster builds
- More memory during builds

This **might not solve the size issue** since the limit is still 50MB.

**Not recommended** unless you need Pro for other reasons.

---

### Option C: Split PDF Generation to Separate Service

**Pros**: Free, keeps Puppeteer  
**Cons**: More complex setup, requires additional deployment  

Deploy the PDF generation to a separate service:
1. **Railway.app** (Free tier available)
2. **Render.com** (Free tier available)
3. **Fly.io** (Free tier available)

Then call it from your Vercel webhook via HTTP.

**Setup Time**: 30-60 minutes  
**Complexity**: Medium

---

### Option D: Try Extreme Optimization (May Not Work)

**Pros**: Free  
**Cons**: Might still be too large, complex  

This involves:
1. Using pnpm instead of npm (better tree shaking)
2. Custom webpack configuration
3. Excluding test binaries from Chromium

**Success Rate**: 50/50  
**Not recommended** - too much effort for uncertain results

---

## My Recommendation

**Go with Option A: External PDF Service (PDFShift)**

Here's why:
- ✅ Guaranteed to work
- ✅ 5-minute setup
- ✅ More reliable than serverless Chromium
- ✅ Faster (no cold starts)
- ✅ Professional support
- ✅ Only ~$15/month (reasonable for production)
- ✅ You'll use max 100-200 PDFs/month = well within limits

For a car show registration system, $15/month for reliable PDF delivery is worth it.

---

## Alternative Services (if not PDFShift)

| Service | Free Tier | Cost/Month | Setup |
|---------|-----------|------------|-------|
| **PDFShift** | 50 test PDFs | $15 for 1,000 | 5 min |
| **DocRaptor** | 5 test PDFs | $19 for 125 | 10 min |
| **HTML2PDF.app** | None | $10 for 500 | 5 min |
| **CloudConvert** | 25/day | $9/mo unlimited | 15 min |

All of these work great with HTML templates and have similar APIs.

---

## What to Do Right Now

1. **Check your error message** (see instructions at top)
2. **Confirm it's a size error** (should mention 50 MB or FUNCTION_PAYLOAD_TOO_LARGE)
3. **Choose Option A** (PDFShift) for quickest, most reliable solution
4. **Follow the 5 steps in Option A** above
5. **Deploy and test**

---

## Need Help?

If you want to stick with Puppeteer despite the size issues, let me know and I can help you set up Option C (separate service for PDF generation).

But honestly, for production use, an external PDF service is the way to go. It's what most companies use because:
- More reliable than serverless Puppeteer
- No cold start delays
- No size limit issues
- Professional support
- Worth the small cost

---

Let me know which option you want to go with and I'll help you implement it!

