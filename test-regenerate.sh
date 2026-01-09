#!/bin/bash
# Quick test script for regenerate-dashsheet endpoint
# Usage: ./test-regenerate.sh [your-email@example.com]

DOMAIN="seaside-cruizers.vercel.app"
EMAIL="${1:-test@example.com}"

echo "🧪 Testing Dash Sheet Regeneration"
echo "=================================="
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Test data
JSON_PAYLOAD=$(cat <<EOF
{
  "firstName": "Test",
  "lastName": "User",
  "email": "$EMAIL",
  "year": "1969",
  "make": "Chevrolet",
  "model": "Camaro",
  "city": "Parksville",
  "province": "BC",
  "entryNumber": 999
}
EOF
)

echo "Sending request..."
echo ""

RESPONSE=$(curl -s -X POST "https://${DOMAIN}/api/regenerate-dashsheet" \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD" \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

echo "Response:"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""
echo "HTTP Status: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Success! Check your email ($EMAIL) for the dash sheet PDF."
else
  echo "❌ Error occurred. Check the response above for details."
fi

