# Brevo SMTP Authentication Troubleshooting

## Error: "535 5.7.8 Authentication failed"

This error means Brevo is rejecting your SMTP credentials. Here's how to fix it:

## Common Causes & Solutions

### 1. Wrong SMTP Key (Most Common)

**Problem**: Using your Brevo account password instead of the SMTP key.

**Solution**:
1. Go to Brevo Dashboard → **Settings** → **SMTP & API**
2. Click on **SMTP** tab
3. Click **"Generate SMTP key"** (or **"Reset SMTP key"** if you already have one)
4. **Copy the key immediately** - you'll only see it once!
5. Update `BREVO_SMTP_KEY` in Vercel with this new key
6. **Important**: This is NOT your account password - it's a special SMTP key

### 2. Wrong SMTP User

**Problem**: Using an email that's not your Brevo account email or verified sender.

**Solution**:
1. Check your Brevo account email (the one you signed up with)
2. Or verify a sender email:
   - Go to **Senders** → **Add a sender**
   - Enter your email and verify it
3. Use that exact email address for `BREVO_SMTP_USER`
4. Update `BREVO_SMTP_USER` in Vercel

### 3. Sender Email Not Verified

**Problem**: Trying to send from an email that hasn't been verified in Brevo.

**Solution**:
1. Go to Brevo Dashboard → **Senders**
2. Check if your sender email is verified (green checkmark)
3. If not verified:
   - Click **"Add a sender"**
   - Enter your email address
   - Check your email inbox for verification link
   - Click the verification link
4. Once verified, use that email for `BREVO_SMTP_USER` and `EMAIL_FROM_ADDRESS`

### 4. Wrong SMTP Port

**Problem**: Using wrong port or SSL/TLS settings.

**Solution**:
- Port `587` with TLS (recommended): `BREVO_SMTP_PORT=587`
- Port `465` with SSL: `BREVO_SMTP_PORT=465` (requires `secure: true`)

**Current code uses port 587 by default** - make sure your Vercel env var matches.

### 5. Environment Variables Not Set Correctly

**Problem**: Environment variables not properly set in Vercel.

**Solution**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these are set:
   - `BREVO_SMTP_KEY` - Your SMTP key (NOT account password)
   - `BREVO_SMTP_USER` - Your Brevo account email or verified sender
   - `BREVO_SMTP_HOST` - `smtp-relay.brevo.com` (optional, defaults to this)
   - `BREVO_SMTP_PORT` - `587` (optional, defaults to this)
3. **Redeploy** after adding/changing environment variables
4. Check Vercel logs to see which service is being used

### 6. Account Not Fully Activated

**Problem**: Brevo account might not be fully set up.

**Solution**:
1. Log into Brevo dashboard
2. Complete any pending verification steps
3. Check if your account is active (not suspended)
4. Verify your email address used to sign up

## Step-by-Step Fix

1. **Get Fresh SMTP Credentials**:
   ```
   Brevo Dashboard → Settings → SMTP & API → SMTP tab
   → Generate SMTP key (copy it immediately!)
   ```

2. **Verify Your Sender Email**:
   ```
   Brevo Dashboard → Senders → Add a sender
   → Enter email → Verify via email link
   ```

3. **Update Vercel Environment Variables**:
   ```bash
   BREVO_SMTP_KEY=<your-new-smtp-key>
   BREVO_SMTP_USER=<your-brevo-account-email-or-verified-sender>
   BREVO_SMTP_HOST=smtp-relay.brevo.com
   BREVO_SMTP_PORT=587
   EMAIL_FROM_ADDRESS=<your-verified-sender-email>
   ```

4. **Redeploy**:
   - Vercel will automatically redeploy when you update env vars
   - Or manually trigger a redeploy

5. **Test Again**:
   - Try the regenerate endpoint again
   - Check Vercel logs for detailed error messages

## Verification Checklist

- [ ] `BREVO_SMTP_KEY` is the SMTP key (not account password)
- [ ] `BREVO_SMTP_USER` matches your Brevo account email or verified sender
- [ ] Sender email is verified in Brevo dashboard
- [ ] Environment variables are set in Vercel
- [ ] Project has been redeployed after setting env vars
- [ ] SMTP port is 587 (or 465 if using SSL)

## Testing SMTP Connection

You can test the SMTP connection by checking Vercel logs:
1. Go to Vercel Dashboard → Your Project → Logs
2. Look for lines starting with `📧 Using Brevo`
3. Check for any authentication errors

## Still Not Working?

1. **Double-check credentials in Brevo dashboard**:
   - Settings → SMTP & API → SMTP tab
   - Make sure you're copying the SMTP key, not the API key

2. **Try generating a new SMTP key**:
   - Sometimes keys expire or get corrupted
   - Generate a fresh one and update Vercel

3. **Check Brevo account status**:
   - Make sure your account is active
   - Check for any account restrictions

4. **Contact Brevo support**:
   - If everything looks correct but still failing
   - They can check your account status

## Common Mistakes

❌ **Using account password** instead of SMTP key  
❌ **Using unverified sender email**  
❌ **Not redeploying** after updating env vars  
❌ **Copying API key** instead of SMTP key  
❌ **Using wrong email** for SMTP_USER  

✅ **Use SMTP key** (generated from dashboard)  
✅ **Use verified sender email**  
✅ **Redeploy after changes**  
✅ **Double-check all credentials**  
