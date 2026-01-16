# Brevo Quick Start Guide

## Why Brevo?

- ✅ **300 emails/day free FOREVER** (no expiration, no trial)
- ✅ **Perfect for your needs**: ~25 registrations/day × 2 emails = 50 emails/day
- ✅ **6x your current usage** - Plenty of headroom
- ✅ **Excellent deliverability** - No spam filtering issues
- ✅ **Easy setup** - Works with existing code

## Quick Setup (5 Minutes)

### Step 1: Create Brevo Account
1. Go to https://www.brevo.com
2. Click "Sign Up Free"
3. Fill out the form and verify your email

### Step 2: Get SMTP Credentials

1. Go to **Settings** → **SMTP & API**
2. Click on **SMTP** tab
3. You'll see:
   - **SMTP Server**: `smtp-relay.brevo.com`
   - **Port**: `587` (TLS) or `465` (SSL)
4. Under "Login", you'll see your email
5. Click **"Generate SMTP key"** to create a password
6. **Copy the password immediately** - you'll only see it once!

### Step 3: Verify Your Sender Email (Recommended)

1. Go to **Senders** → **Add a sender**
2. Enter the email you want to send from
3. Check your email and click the verification link
4. Once verified, you can use this as your "From" address

**Note**: You can use your Brevo account email without verification, but verifying improves deliverability.

### Step 4: Add Environment Variables to Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

```bash
# Brevo Configuration (Required)
BREVO_SMTP_KEY=your-smtp-key-here  # Generated from Brevo dashboard
BREVO_SMTP_USER=your-email@example.com  # Your Brevo account email or verified sender
BREVO_SMTP_HOST=smtp-relay.brevo.com  # Optional, defaults to this
BREVO_SMTP_PORT=587  # Optional, defaults to 587

# Email Settings
EMAIL_FROM_ADDRESS=your-verified-email@example.com  # Must be verified sender
EMAIL_FROM_NAME=Seaside Cruizers Car Show
EMAIL_REPLY_TO=your-email@example.com  # or your actual email

# Optional: Admin email (where admin notifications go)
ADMIN_EMAIL=your-admin-email@gmail.com
```

**Important Notes:**
- `BREVO_SMTP_KEY` is the password you generated (NOT your account password)
- `BREVO_SMTP_USER` is your Brevo account email or verified sender
- `EMAIL_FROM_ADDRESS` should be a verified sender for best deliverability

### Step 5: Deploy

The code is already updated! Just:
1. Push your changes (or the code will auto-detect Brevo when env vars are set)
2. Vercel will auto-deploy
3. Test with one registration

### Step 6: Test

1. Make a test registration
2. Check Brevo dashboard → **Statistics** → **Email activity**
3. Verify email arrives in inbox (not spam!)

## Monitoring

- **Brevo Dashboard**: Check Statistics → Email activity for delivery status
- **Usage**: Monitor daily email count (you have 300/day limit)
- **Bounces**: Check for any bounced emails

## Troubleshooting

### "No email service configured" error
- Check that `BREVO_SMTP_KEY` and `BREVO_SMTP_USER` are set in Vercel
- Redeploy after adding environment variables

### Emails not sending
- Check Brevo dashboard → Email activity for errors
- Verify `BREVO_SMTP_KEY` and `BREVO_SMTP_USER` are correct
- Ensure sender email is verified
- Check SMTP port (587 for TLS, 465 for SSL)

### Emails going to spam
- Verify your sender email in Brevo dashboard
- Use professional "From" name
- Check that sender is verified

## Cost

- **Free tier**: 300 emails/day = 9,000/month
- **Your usage**: ~50 emails/day = 1,500/month
- **Cost**: **$0/month** ✅ **FOREVER**

## Next Steps

1. ✅ Set up Brevo account
2. ✅ Generate SMTP key
3. ✅ Verify sender email
4. ✅ Add environment variables
5. ✅ Deploy
6. ✅ Test
7. ✅ Monitor for a few days

See `BREVO_MIGRATION_GUIDE.md` for detailed instructions.
