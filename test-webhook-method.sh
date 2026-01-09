#!/bin/bash
# Test script to see what method the webhook endpoint receives
# Replace YOUR_DOMAIN with your actual Vercel domain

DOMAIN="${1:-your-domain.vercel.app}"

echo "Testing webhook endpoint at https://${DOMAIN}/api/webhook"
echo ""
echo "Testing with GET (should show 405):"
curl -X GET "https://${DOMAIN}/api/webhook" -v
echo ""
echo ""
echo "Testing with POST (should show different response):"
curl -X POST "https://${DOMAIN}/api/webhook" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -v

