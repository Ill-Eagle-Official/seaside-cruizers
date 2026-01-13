import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Google Sheets setup
let sheets = null;
let auth = null;
(function initializeGoogleSheets() {
  try {
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      sheets = google.sheets('v4');
    }
  } catch (err) {
    console.error('Google Sheets integration disabled - error:', err.message);
  }
})();

/**
 * Check Poker Run availability
 * Returns the current count and whether it's available
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    // Get maximum limit from environment variable (default to 100 if not set)
    const maxLimit = parseInt(process.env.POKER_RUN_MAX_LIMIT || '100', 10);

    if (!sheets || !auth) {
      // If Google Sheets is not configured, assume it's available
      return res.status(200).json({
        available: true,
        currentCount: 0,
        maxLimit: maxLimit,
        remaining: maxLimit,
        message: 'Google Sheets not configured - assuming available'
      });
    }

    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();

    // Get all values from Column J (Poker Run column, index 9)
    // Column J is the 10th column (0-indexed: A=0, B=1, ..., J=9)
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/Sheet1!J:J`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Count how many "Yes" values are in Column J (excluding header row)
    let currentCount = 0;
    if (data.values && data.values.length > 1) {
      // Skip first row (header) and count "Yes" values
      for (let i = 1; i < data.values.length; i++) {
        if (data.values[i] && data.values[i][0] === 'Yes') {
          currentCount++;
        }
      }
    }

    const remaining = Math.max(0, maxLimit - currentCount);
    const available = remaining > 0;

    return res.status(200).json({
      available: available,
      currentCount: currentCount,
      maxLimit: maxLimit,
      remaining: remaining,
      message: available 
        ? `${remaining} Poker Run spots remaining`
        : 'Poker Run is full'
    });

  } catch (err) {
    console.error('Error checking Poker Run availability:', err);
    // On error, assume it's available to avoid blocking registrations
    return res.status(200).json({
      available: true,
      currentCount: 0,
      maxLimit: parseInt(process.env.POKER_RUN_MAX_LIMIT || '100', 10),
      remaining: parseInt(process.env.POKER_RUN_MAX_LIMIT || '100', 10),
      message: 'Unable to check availability - assuming available',
      error: err.message
    });
  }
}
