#!/bin/bash
# Example script for manually regenerating a dash sheet
# 
# Usage: ./regenerate-dashsheet-example.sh
# 
# Edit the variables below with the correct information

DOMAIN="${1:-seaside-cruizers.vercel.app}"
ADMIN_KEY="${2:-}"  # Optional: pass as second argument or set ADMIN_KEY env var

# Registration data - EDIT THESE VALUES
FIRST_NAME="John"
LAST_NAME="Doe"
EMAIL="john.doe@example.com"
YEAR="1965"
MAKE="Chevrolet"
MODEL="Impala"
CITY="Parksville"
PROVINCE="BC"
ENTRY_NUMBER=42

echo "Regenerating dash sheet for: $FIRST_NAME $LAST_NAME"
echo "Email: $EMAIL"
echo "Entry Number: $ENTRY_NUMBER"
echo ""

# Build JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
  "firstName": "$FIRST_NAME",
  "lastName": "$LAST_NAME",
  "email": "$EMAIL",
  "year": "$YEAR",
  "make": "$MAKE",
  "model": "$MODEL",
  "city": "$CITY",
  "province": "$PROVINCE",
  "entryNumber": $ENTRY_NUMBER
EOF
)

# Add admin key if provided
if [ -n "$ADMIN_KEY" ] || [ -n "${ADMIN_KEY:-}" ]; then
  ADMIN_KEY_VALUE="${ADMIN_KEY:-${ADMIN_KEY}}"
  JSON_PAYLOAD="${JSON_PAYLOAD%?},\"adminKey\": \"$ADMIN_KEY_VALUE\"}"
else
  JSON_PAYLOAD="${JSON_PAYLOAD}}"
fi

# Send request
curl -X POST "https://${DOMAIN}/api/regenerate-dashsheet" \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD" \
  -w "\n\nHTTP Status: %{http_code}\n"

echo ""
echo "Done! Check the email inbox for the regenerated dash sheet."

