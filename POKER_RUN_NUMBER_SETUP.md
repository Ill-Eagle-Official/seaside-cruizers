# Poker Run Registration Number Setup

## Overview

The system now automatically assigns Poker Run registration numbers to customers who purchase the Poker Run add-on. These numbers are:
- Assigned sequentially (001, 002, 003, etc.)
- Only assigned to customers who purchase the Poker Run
- Displayed on the dash sheet PDF (smaller, below the main entry number)
- Stored in Google Sheets Column P

## What You Need to Do

### 1. Format Column P as Text

**Important:** Before any registrations are processed, format Column P as Text to preserve leading zeros.

1. Open your Google Sheet
2. Select Column P (the Poker Run Number column)
3. Go to **Format → Number → Plain text**
4. This ensures numbers display as "001", "002", etc. instead of "1", "2"

### 2. Add Column Header (Optional but Recommended)

1. In Row 1, Column P, add the header: **"Poker Run #"** or **"Poker Run Number"**
2. This makes it clear what the column contains

### 3. Manual Entry (If Needed)

If you need to manually enter Poker Run registrations before the system starts:

1. **Format Column P as Text first** (Format → Number → Plain text)
2. Enter Poker Run numbers exactly as: `001`, `002`, `003` (without quotes)
3. Only enter numbers for rows where Column J (Poker Run) = "Yes"
4. Leave Column P empty for rows where Poker Run = "No"

**Example:**
- Row 2: Entry #001, Poker Run = "Yes", Poker Run # = `001`
- Row 3: Entry #002, Poker Run = "No", Poker Run # = (empty)
- Row 4: Entry #003, Poker Run = "Yes", Poker Run # = `002`

## How It Works

### Automatic Assignment

1. When a customer purchases the Poker Run:
   - System counts existing "Yes" values in Column J
   - Assigns the next sequential number (e.g., if 5 people already have Poker Run, assigns #006)
   - Stores it in Column P
   - Displays it on their dash sheet PDF

2. When a customer does NOT purchase the Poker Run:
   - Column P remains empty
   - Dash sheet shows only the main entry number

### Dash Sheet Display

- **With Poker Run:** Shows main entry number (large) and Poker Run number (smaller, below)
- **Without Poker Run:** Shows only the main entry number

## Column Structure

Your Google Sheet now has these columns:

- **Column A**: Timestamp
- **Column B**: Name
- **Column C**: Email
- **Column D**: Country
- **Column E**: Province
- **Column F**: City
- **Column G**: Postal Code
- **Column H**: Vehicle (Year Make Model)
- **Column I**: Club Name
- **Column J**: Poker Run (Yes/No)
- **Column K**: Base Fee ($30)
- **Column L**: Poker Run Fee ($5 or $0)
- **Column M**: Total Paid
- **Column N**: Payment Intent ID
- **Column O**: Entry Number (001, 002, etc.) ⚠️ **Format as Text**
- **Column P**: Poker Run Number (001, 002, etc., or empty) ⚠️ **Format as Text**

## Tracking Poker Run Numbers

### Formula to Count Poker Run Registrations

In any cell (e.g., Q1), you can use this formula to count how many Poker Run registrations you have:

```
=COUNTIF(J:J, "Yes")
```

### Formula to Get Next Available Poker Run Number

In any cell (e.g., Q2), you can use this formula to see what the next Poker Run number will be:

```
=COUNTIF(J:J, "Yes") + 1
```

## Troubleshooting

### Poker Run numbers showing as "1" instead of "001"

**Solution:** Format Column P as Text (Format → Number → Plain text)

### Missing Poker Run numbers for existing registrations

If you have existing registrations with Poker Run = "Yes" but no numbers in Column P:

1. Format Column P as Text
2. Manually enter the Poker Run numbers (001, 002, etc.) in sequential order
3. The system will continue from the highest number

### Regenerating Dash Sheets with Poker Run Numbers

When using `/api/regenerate-dashsheet`, include the `pokerRunNumber` field:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "year": "1965",
  "make": "Chevrolet",
  "model": "Impala",
  "city": "Parksville",
  "province": "BC",
  "entryNumber": 42,
  "pokerRunNumber": 15
}
```

## Notes

- Poker Run numbers are independent of entry numbers
- If 10 people register but only 3 buy Poker Run, they get Poker Run #001, #002, #003
- Poker Run numbers only increment when someone purchases the add-on
- The system automatically handles this - no manual intervention needed for new registrations
