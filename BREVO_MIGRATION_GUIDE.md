# Brevo (Sendinblue) Migration Guide

## Why Brevo?

- ✅ **300 emails/day free FOREVER** (no expiration, no trial)
- ✅ **Perfect for your needs**: ~25 registrations/day × 2 emails = 50 emails/day
- ✅ **6x your current usage** - Plenty of headroom
- ✅ **Excellent deliverability** - Designed for transactional emails
- ✅ **Easy setup** - Works with existing code (no major changes needed)
- ✅ **No DNS records required** for basic setup

## Your Usage vs Brevo Limits

- **Current rate**: ~25 registrations/day (50 emails/day with 2 emails per registration)
- **Brevo free limit**: 300 emails/day
- **Safety margin**: 6x your current usage ✅
- **Monthly limit**: ~9,000 emails/month (if you use full daily quota)

## Step 1: Create Brevo Account

1. Go to https://www.brevo.com (formerly sendinblue.com)
2. Click "Sign Up Free"
3. Fill out the signup form
4. Verify your email address
5. Complete account setup

## Step 2: Get Your SMTP Credentials

1. Go to **Settings** → **SMTP & API** (or **Senders & IP** → **SMTP**)
2. Click on **SMTP** tab
3. You'll see your SMTP credentials:
   - **SMTP Server**: `smtp-relay.brevo.com`
   - **Port**: `587` (TLS) or `465` (SSL)
   - **Login**: Your Brevo account email (or create a dedicated sender)
   - **Password**: Click "Generate SMTP key" to create a password

**Important**: 
- The password is NOT your account password
- You need to generate a dedicated SMTP key
- Save this password - you'll only see it once!

## Step 3: Verify Your Sender Email (Optional but Recommended)

1. Go to **Senders** → **Add a sender**
2. Enter your email address (the one you want to send from)
3. Verify the email address (check your inbox for verification link)
4. Once verified, you can use this email as your "From" address

**Note**: You can send from your Brevo account email without verification, but verifying a sender improves deliverability.

## Step 4: Update Environment Variables

Add to Vercel Dashboard → Settings → Environment Variables:

```bash
# Brevo Configuration (Required)
BREVO_SMTP_KEY=your-smtp-key-here  # Generated from Brevo dashboard
BREVO_SMTP_USER=your-email@example.com  # Your Brevo account email or verified sender
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587

# Email Settings
EMAIL_FROM_ADDRESS=your-verified-email@example.com  # Must be verified sender
EMAIL_FROM_NAME=Seaside Cruizers Car Show
EMAIL_REPLY_TO=your-email@example.com  # or your actual email

# Optional: Admin email (where admin notifications go)
ADMIN_EMAIL=your-admin-email@gmail.com

# Keep Gmail variables for fallback (optional)
# GMAIL_USER=...
# GMAIL_PASS=...
```

## Step 5: Code Changes

The code has been updated to automatically detect and use Brevo when `BREVO_SMTP_KEY` is set. It will fall back to Gmail if Brevo is not configured.

## Step 6: Test

1. Deploy the updated code
2. Send a test registration
3. Check Brevo dashboard → **Statistics** → **Email activity** to see delivery status
4. Verify email arrives in inbox (not spam)

## Step 7: Monitor Usage

- Go to Brevo Dashboard → **Statistics** → **Email activity**
- Check daily email count
- Monitor bounce/complaint rates
- Set up alerts if approaching 300/day limit (unlikely with your usage)

## Troubleshooting

### Emails Not Sending
- Check Brevo dashboard → Email activity for errors
- Verify `BREVO_SMTP_KEY` and `BREVO_SMTP_USER` are correct
- Ensure sender email is verified
- Check SMTP port (587 for TLS, 465 for SSL)

### Emails Going to Spam
- Verify your sender email in Brevo dashboard
- Use a professional "From" name and address
- Check SPF/DKIM records (Brevo handles this automatically)

### Hitting 300/day Limit
- Monitor usage in Brevo dashboard
- Consider upgrading to paid plan ($25/month for 20,000 emails)
- Or implement email queuing for non-critical emails

## Cost Comparison

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| **Brevo** | 300/day (forever) | 50/day | **$0/month** ✅ |
| Mailgun | 100/day (30 days) | 50/day | $35/month after trial |
| SendGrid | 100/day (3 months) | 50/day | $19.95/month after trial |
| Gmail | 500/day | 50/day | $0/month (but spam issues) |

## Migration Checklist

- [ ] Create Brevo account
- [ ] Generate SMTP key
- [ ] Verify sender email (optional but recommended)
- [ ] Add environment variables to Vercel
- [ ] Deploy updated code
- [ ] Test with one registration
- [ ] Verify email delivery
- [ ] Monitor for 24-48 hours
- [ ] Remove Gmail environment variables (optional)

## Next Steps After Migration

1. **Monitor for a week** - Ensure everything works smoothly
2. **Remove Gmail credentials** - Clean up old environment variables
3. **Set up Brevo alerts** - Get notified if approaching limits
4. **Consider sender verification** - Better deliverability

## Support

- **Brevo Docs**: https://help.brevo.com/
- **Brevo Status**: https://status.brevo.com/
- **Brevo Support**: Available in dashboard

## API Alternative (Optional)

Brevo also offers a REST API if you prefer that over SMTP. The current implementation uses SMTP (simpler), but we can switch to API if needed.
