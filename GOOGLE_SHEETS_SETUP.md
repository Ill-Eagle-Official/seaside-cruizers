# Google Sheets Setup Instructions

## Column Formatting

To ensure entry numbers and Poker Run numbers display correctly as "001", "002", etc. (instead of being converted to 1, 2, etc.):

### Option 1: Format Columns O and P as Text (Recommended)

1. Open your Google Sheet
2. Select Column O (the Entry Number column)
3. Go to Format → Number → Plain text
4. Select Column P (the Poker Run Number column)
5. Go to Format → Number → Plain text
6. This will preserve the leading zeros (001, 002, etc.)

### Option 2: Use a Formula (Alternative)

If you prefer to keep it as a number but display with leading zeros, you can use this formula in Column O:
```
=TEXT(ROW()-1,"000")
```
This will automatically format the row number with leading zeros.

### Current Column Structure

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
- **Column O**: Entry Number (formatted as 001, 002, etc.) ⚠️ **Format as Text**
- **Column P**: Poker Run Number (formatted as 001, 002, etc., or empty if not purchased) ⚠️ **Format as Text**

## Manual Entry Instructions

If you need to manually enter registrations before the system starts processing them:

1. **Format Column O as Text first** (Format → Number → Plain text)
2. Enter entry numbers exactly as: `001`, `002`, `003` (without quotes)
3. The system will automatically continue from the next number

**Example:**
- You manually enter 3 registrations with entry numbers: 001, 002, 003
- The next automatic registration will get: 004
- The system counts existing rows to determine the next entry number

**Important:** 
- If Column O is not formatted as Text, Google Sheets will convert "001" to "1". Always format the column as Text before manual entry.
- If Column P is not formatted as Text, Poker Run numbers will also lose leading zeros. Format Column P as Text as well.

## Important Notes

- The system sends entry numbers as strings with leading zeros (e.g., "001", "002")
- If Column O is formatted as a number, Google Sheets will convert "001" to "1"
- Formatting the column as Text before the first registration is recommended
- If you've already received registrations, you can:
  1. Format Column O as Text
  2. Manually update existing entries to add leading zeros, OR
  3. Use the formula approach above
