import Stripe from 'stripe';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Google Sheets setup for checking Poker Run availability
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
    // Google Sheets not configured - will skip validation
  }
})();

// Helper: Check if Poker Run is available
async function isPokerRunAvailable() {
  const maxLimit = parseInt(process.env.POKER_RUN_MAX_LIMIT || '100', 10);
  
  if (!sheets || !auth) {
    // If Google Sheets not configured, assume available
    return true;
  }

  try {
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();

    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/Sheet1!J:J`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
      }
    });

    if (!response.ok) {
      // On error, assume available to avoid blocking
      return true;
    }

    const data = await response.json();
    let currentCount = 0;
    
    if (data.values && data.values.length > 1) {
      for (let i = 1; i < data.values.length; i++) {
        if (data.values[i] && data.values[i][0] === 'Yes') {
          currentCount++;
        }
      }
    }

    return currentCount < maxLimit;
  } catch (err) {
    console.error('Error checking Poker Run availability:', err);
    // On error, assume available to avoid blocking
    return true;
  }
}

// Helper: calculate total amount
function calculateAmount(data) {
  let total = 30; // base fee
  if (data.pokerRun) total += 5; // poker run additional fee
  return total * 100; // Stripe expects cents
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    
    // Validate Poker Run availability if requested
    if (data.pokerRun) {
      const available = await isPokerRunAvailable();
      if (!available) {
        return res.status(400).json({ 
          error: 'Poker Run is full. All spots have been taken.',
          pokerRunFull: true
        });
      }
    }
    
    const amount = calculateAmount(data);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'Seaside Cruizers Car Show Registration',
              description: 'Car show registration' + (data.pokerRun ? ' + Poker Run' : ''),
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${data.origin}/success.html?firstName=${encodeURIComponent(data.firstName)}`,
      cancel_url: `${data.origin}/registration.html?canceled=true`,
      metadata: data, // Store all registration data for later use
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create Stripe session' });
  }
}
