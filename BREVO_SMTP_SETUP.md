# Brevo SMTP Setup - Step by Step

## Critical: Getting the Correct Credentials

The "535 5.7.8 Authentication failed" error almost always means you're using the wrong credentials. Here's exactly how to get the right ones:

## Step 1: Get Your SMTP Login (Username)

1. Go to **Brevo Dashboard** → **Settings** → **SMTP & API**
2. Click on the **SMTP** tab
3. Look for the **"Login"** field - this is your SMTP username
4. **Important**: This might be different from your Brevo account email!
5. Copy this exact value - this is what goes in `BREVO_SMTP_USER`

**Example**: Your SMTP login might look like:
- `your-email@example.com` (if same as account email)
- `smtp12345@relay.brevo.com` (if Brevo generated a unique login)

## Step 2: Generate Your SMTP Key (Password)

1. Still in **Settings** → **SMTP & API** → **SMTP** tab
2. Find the **"Password"** section
3. Click **"Generate SMTP key"** (or **"Reset SMTP key"** if you already have one)
4. **Copy the key immediately** - you'll only see it once!
5. This is what goes in `BREVO_SMTP_KEY`

**Important Notes**:
- This is NOT your Brevo account password
- This is NOT an API key (those are different)
- This is a special SMTP key generated just for SMTP authentication
- SMTP keys are typically 20+ characters long

## Step 3: Verify Your Sender Email

1. Go to **Brevo Dashboard** → **Senders**
2. Check if your sender email is listed and verified (green checkmark)
3. If not verified:
   - Click **"Add a sender"**
   - Enter your email address
   - Check your email inbox for verification link
   - Click the verification link
4. Once verified, use this email for `EMAIL_FROM_ADDRESS`

## Step 4: Set Environment Variables in Vercel

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Add these **exact** values:

```bash
BREVO_SMTP_USER=<the-login-from-step-1>
BREVO_SMTP_KEY=<the-key-from-step-2>
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
EMAIL_FROM_ADDRESS=<your-verified-sender-email>
EMAIL_FROM_NAME=Seaside Cruizers Car Show
```

**Critical Checks**:
- ✅ No extra spaces before/after values
- ✅ No quotes around values (Vercel adds those automatically)
- ✅ `BREVO_SMTP_USER` matches the "Login" from Brevo dashboard exactly
- ✅ `BREVO_SMTP_KEY` is the SMTP key (not API key, not account password)
- ✅ `EMAIL_FROM_ADDRESS` is a verified sender in Brevo

## Step 5: Redeploy

1. After setting environment variables, Vercel should auto-redeploy
2. Or manually trigger a redeploy: **Deployments** → **Redeploy**

## Step 6: Test Again

1. Try the regenerate endpoint
2. Check Vercel logs for the debugging output
3. Look for lines starting with `📧` to see what credentials are being used

## Common Mistakes

❌ **Using account email** instead of SMTP login  
❌ **Using account password** instead of SMTP key  
❌ **Using API key** instead of SMTP key  
❌ **Using unverified sender** for EMAIL_FROM_ADDRESS  
❌ **Extra spaces** in environment variables  
❌ **Not redeploying** after updating env vars  

✅ **Use SMTP login** from Brevo dashboard  
✅ **Use SMTP key** (generated from dashboard)  
✅ **Use verified sender** email  
✅ **No spaces** in env var values  
✅ **Redeploy** after changes  

## Still Not Working?

1. **Double-check in Brevo dashboard**:
   - Settings → SMTP & API → SMTP tab
   - Verify the "Login" matches `BREVO_SMTP_USER`
   - Generate a fresh SMTP key and update `BREVO_SMTP_KEY`

2. **Try port 2525** (alternative Brevo port):
   ```bash
   BREVO_SMTP_PORT=2525
   ```

3. **Check account status**:
   - Make sure your Brevo account is fully activated
   - Check for any account restrictions or suspensions

4. **Contact Brevo support**:
   - They can verify your account setup
   - They can check if SMTP is properly enabled for your account

## Verification

After setting everything up, check Vercel logs. You should see:
```
📧 Using Brevo (Sendinblue) for email delivery
📧 Brevo SMTP Host: smtp-relay.brevo.com
📧 Brevo SMTP Port: 587
📧 Brevo SMTP User: <your-smtp-login>
📧 Brevo SMTP Key length: XX chars
```

If you see these logs but still get authentication errors, the credentials themselves are wrong.
