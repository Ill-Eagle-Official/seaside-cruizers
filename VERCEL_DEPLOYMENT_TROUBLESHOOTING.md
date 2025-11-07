# Vercel Deployment Troubleshooting

## How to Find the Specific Error

### Method 1: Vercel Dashboard (Easiest)

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your project (`seaside-cruizers`)
3. Click on the failed deployment (red X or "Failed" status)
4. Look at the **Build Logs** section - scroll to the bottom for errors
5. The error will show which limit was exceeded

### Method 2: GitHub Actions/Checks

1. Go to your GitHub repository
2. Click on the **Actions** tab (or the red X on the commit)
3. Click on the failed Vercel deployment
4. Look for the error message in the logs

### Method 3: Vercel CLI (if installed)

```bash
# Install Vercel CLI if not installed
npm install -g vercel

# Check logs
vercel logs

# Or try deploying directly to see the error
vercel --prod
```

---

## Most Common Error with Chromium: Function Size Limit

### The Problem

**Vercel Function Size Limits:**
- **Hobby Plan**: 50 MB compressed
- **Pro Plan**: 50 MB compressed (per function)
- **Enterprise**: 250 MB compressed

**Our package sizes:**
- `@sparticuz/chromium`: ~45-50 MB
- `puppeteer-core`: ~2-3 MB
- Other dependencies: ~5-10 MB
- **Total**: ~55-65 MB (might exceed limit!)

### What the Error Looks Like

```
Error: Function size exceeded the limit of 50 MB
The Serverless Function "api/webhook" is too large
```

Or:

```
Error: Code: FUNCTION_PAYLOAD_TOO_LARGE
```

---

## Solutions (Try in Order)

### Solution 1: Exclude Unnecessary Files (Quick Fix)

Create/update `.vercelignore`:

```
# .vercelignore
node_modules/@sparticuz/chromium/bin/*
!node_modules/@sparticuz/chromium/bin/chromium-*.br
server.js
verify-setup.js
*.md
DASHSHEET_SETUP.md
IMPLEMENTATION_SUMMARY.md
PDF_SOLUTIONS_COMPARISON.md
QUICK_START.md
VERCEL_DEPLOYMENT_TROUBLESHOOTING.md
readme.txt
README.md
.git
.github
```

This excludes documentation and unnecessary Chromium binaries.

### Solution 2: Use External Layers (Recommended)

Update `vercel.json` to use external Chromium layer:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ],
  "functions": {
    "api/webhook.js": {
      "memory": 3008,
      "maxDuration": 60,
      "includeFiles": "dashsheet.html"
    }
  }
}
```

### Solution 3: Optimize Dependencies

Update `package.json` to use production dependencies only:

```json
{
  "scripts": {
    "postinstall": "node -e \"console.log('Build complete')\""
  },
  "dependencies": {
    "@sparticuz/chromium": "^141.0.0",
    "body-parser": "^2.2.0",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "googleapis": "^160.0.0",
    "nodemailer": "^7.0.3",
    "puppeteer-core": "^24.29.1",
    "raw-body": "^3.0.0",
    "stripe": "^18.2.1"
  }
}
```

### Solution 4: Split Functions (Best for Hobby Plan)

Create a separate function just for PDF generation:

**Create `api/generate-pdf.js`:**

```javascript
import { generateDashSheetPDF } from './utils/pdfGenerator.js';

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, entryNumber } = req.body;
    const pdfBuffer = await generateDashSheetPDF(data, entryNumber);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation failed:', err);
    res.status(500).json({ error: err.message });
  }
}
```

**Update `vercel.json`:**

```json
{
  "functions": {
    "api/webhook.js": {
      "memory": 1024,
      "maxDuration": 30,
      "excludeFiles": "{node_modules/@sparticuz/**,node_modules/puppeteer-core/**}"
    },
    "api/generate-pdf.js": {
      "memory": 3008,
      "maxDuration": 60
    }
  }
}
```

Then call the PDF function from webhook via HTTP.

### Solution 5: Use Vercel Edge Functions (Advanced)

Edge Functions have different limits. This requires refactoring but can work.

### Solution 6: Switch to External PDF Service

If all else fails, use a service like PDFShift or DocRaptor:

**Update `api/utils/pdfGenerator.js`:**

```javascript
export async function generateDashSheetPDF(registrationData, entryNumber) {
  const templateData = {
    entryNumber: String(entryNumber).padStart(3, '0'),
    year: registrationData.year,
    make: registrationData.make,
    model: registrationData.model,
    ownerName: `${registrationData.firstName} ${registrationData.lastName}`,
    city: registrationData.city,
    province: registrationData.province
  };
  
  const html = populateDashSheetTemplate(templateData);
  
  // Use PDFShift
  const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`api:${process.env.PDFSHIFT_API_KEY}`).toString('base64')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source: html,
      format: 'A4',
      margin: '0.75in'
    })
  });
  
  return await response.buffer();
}
```

Cost: ~$15/month for 1,000 conversions.

---

## Immediate Action Plan

### Step 1: Create .vercelignore (Do This Now)

```bash
# Create the file
cat > .vercelignore << 'EOF'
# Exclude unnecessary files
server.js
verify-setup.js
*.md
!README.md
readme.txt
.git
.github
test-*.js
EOF
```

### Step 2: Check Your Vercel Plan

1. Go to https://vercel.com/dashboard/settings
2. Check if you're on Hobby or Pro
3. **If Hobby**: You need to optimize (see solutions above)
4. **If Pro**: The .vercelignore should be enough

### Step 3: Redeploy

```bash
git add .vercelignore
git commit -m "Add vercelignore to reduce deployment size"
git push
```

Vercel will auto-deploy on push.

---

## Checking Function Size Locally

To see how large your function would be:

```bash
# Install vercel CLI
npm install -g vercel

# Build locally
vercel build

# Check .vercel/output directory size
du -sh .vercel/output
```

---

## Alternative: Lazy-Load Chromium

Modify `api/utils/pdfGenerator.js` to lazy-load:

```javascript
let chromium = null;
let puppeteer = null;

async function loadPuppeteer() {
  if (!chromium) {
    chromium = await import('@sparticuz/chromium');
    puppeteer = await import('puppeteer-core');
  }
  return { chromium: chromium.default, puppeteer: puppeteer.default };
}

export async function generateDashSheetPDF(registrationData, entryNumber) {
  const { chromium, puppeteer } = await loadPuppeteer();
  
  // ... rest of code
}
```

This doesn't reduce size but can help with cold starts.

---

## If Nothing Works: External Service Comparison

| Service | Free Tier | Paid Plan | Setup Time |
|---------|-----------|-----------|------------|
| **PDFShift** | 50 PDFs | $15/1000 | 5 min |
| **DocRaptor** | 5 test PDFs | $19/125 | 10 min |
| **HTML2PDF.app** | None | $10/500 | 5 min |
| **CloudConvert** | 25/day | $9/mo | 15 min |

All support HTML input and work great with Vercel.

---

## Vercel Support

If you're on a paid plan and still hitting issues:

1. Contact Vercel support: https://vercel.com/support
2. They can increase limits for specific functions
3. They can help diagnose the exact issue

---

## Summary

**Most Likely Issue**: Function size exceeds 50MB

**Quick Fix**: 
1. Create `.vercelignore` (see above)
2. Push to GitHub
3. Wait for auto-deploy

**If Still Fails**:
1. Split into separate function for PDF generation
2. Consider external PDF service ($15/mo)
3. Upgrade to Vercel Pro (if on Hobby)

**Check Your Error**:
- Vercel Dashboard → Project → Failed Deployment → Build Logs (bottom)

---

Let me know what error you see in the build logs and I can provide a more specific solution!

