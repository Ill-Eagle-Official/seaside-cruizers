import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Google Sheets setup
let sheets = null;
let auth = null;
(function initializeGoogleSheets() {
  try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      sheets = google.sheets('v4');
      console.log('Google Sheets integration enabled via key file');
    } else {
      console.log('Google Sheets integration disabled - credentials not set');
    }
  } catch (err) {
    console.log('Google Sheets integration disabled - invalid credentials');
  }
})();

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Helper: format registration email
function formatEmail(data, session) {
  const hat = data.buyHat === 'true' || data.buyHat === true;
  const shirt = data.buyShirt === 'true' || data.buyShirt === true;
  return {
    subject: 'New Seaside Cruizers Car Show Registration',
    text: `Personal Information:
  • Name: ${data.firstName} ${data.lastName}
  • Email: ${data.email}
  • Address: ${data.country ? data.country + ', ' : ''}${data.province ? data.province + ', ' : ''}${data.city ? data.city + ', ' : ''}${data.postalCode ? data.postalCode : ''}

Car Information:
  • Make: ${data.make}
  • Model: ${data.model}
  • Year: ${data.year}
  • Car Club Affiliation: ${data.clubName || 'None'}

Swag Purchases:
  • Hat: ${hat ? 'Yes' : 'No'}${hat ? `\n    – Colour: ${data.hatColour}\n    – Size: ${data.hatSize}` : ''}
  • Shirt: ${shirt ? 'Yes' : 'No'}${shirt ? `\n    – Colour: ${data.shirtColour}\n    – Gender Cut: ${data.shirtGender}\n    – Size: ${data.shirtSize}` : ''}

Payment Details:
  • Base Registration: $30.00
  • Hat: $${hat ? '15.00' : '0.00'}
  • Shirt: $${shirt ? '20.00' : '0.00'}
  • Total Charged: $${(session.amount_total / 100).toFixed(2)}
  • Payment Transaction ID: ${session.payment_intent}

Date/Time of Registration: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} (PST)
`
  };
}

// Helper: Add registration to Google Sheets
async function addToGoogleSheets(data, session) {
  if (!sheets || !auth) {
    console.log('Skipping Google Sheets - not configured');
    return;
  }
  try {
    const hat = data.buyHat === 'true' || data.buyHat === true;
    const shirt = data.buyShirt === 'true' || data.buyShirt === true;
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    
    const row = [
      timestamp,
      `${data.firstName} ${data.lastName}`,
      data.email,
      data.country || '',
      data.province || '',
      data.city || '',
      data.postalCode || '',
      `${data.year} ${data.make} ${data.model}`,
      data.clubName || 'None',
      hat ? 'Yes' : 'No',
      hat ? data.hatColour : '',
      hat ? data.hatSize : '',
      shirt ? 'Yes' : 'No',
      shirt ? data.shirtColour : '',
      shirt ? data.shirtGender : '',
      shirt ? data.shirtSize : '',
      30, // Base fee
      hat ? 15 : 0, // Hat price
      shirt ? 20 : 0, // Shirt price
      (session.amount_total / 100).toFixed(2), // Total paid
      session.payment_intent // Payment ID
    ];

    // Use a more compatible approach for the Google Sheets API
    const authClient = await auth.getClient();
    
    // Use the raw fetch API approach to avoid Headers issues
    const accessToken = await authClient.getAccessToken();
    
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/Sheet1!A:U:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }
    
    console.log('Registration added to Google Sheets for', data.firstName, data.lastName);
  } catch (err) {
    console.error('Failed to add registration to Google Sheets:', err);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const data = session.metadata || {};
    
    // Run both email and Google Sheets operations in parallel
    const promises = [];
    
    // Send email
    try {
      const email = formatEmail(data, session);
      promises.push(
        transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: process.env.GMAIL_USER, // or a different admin/club email
          subject: email.subject,
          text: email.text,
        })
      );
    } catch (err) {
      console.error('Failed to prepare email:', err);
    }
    
    // Add to Google Sheets
    promises.push(addToGoogleSheets(data, session));
    
    // Execute both operations
    try {
      await Promise.allSettled(promises);
      console.log('Registration processed for', data.firstName, data.lastName);
    } catch (err) {
      console.error('Error processing registration:', err);
    }
  }
  
  res.json({ received: true });
}
