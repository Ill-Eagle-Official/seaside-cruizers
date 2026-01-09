#!/bin/bash
# Script to check Vercel logs for webhook method

echo "Checking Vercel logs for webhook calls..."
echo "Look for lines containing '=== WEBHOOK CALLED ===' and 'Method:'"
echo ""
echo "If you have Vercel CLI installed, run:"
echo "  vercel logs --follow"
echo ""
echo "Or check the Vercel Dashboard:"
echo "  1. Go to https://vercel.com/dashboard"
echo "  2. Select your project"
echo "  3. Click on the latest deployment"
echo "  4. Click 'Functions' tab"
echo "  5. Click on 'api/webhook'"
echo "  6. View the 'Logs' section"
echo ""
echo "You can also check Stripe Dashboard:"
echo "  1. Go to https://dashboard.stripe.com/webhooks"
echo "  2. Click on your webhook endpoint"
echo "  3. View 'Recent deliveries'"
echo "  4. Click on a failed delivery to see the response"

