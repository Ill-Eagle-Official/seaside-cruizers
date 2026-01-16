import Stripe from 'stripe';
import { google } from 'googleapis';
import getRawBody from 'raw-body';
import { generateDashSheetPDF, sendDashSheetEmail } from './utils/pdfGenerator.js';
import { normalizeRegistrationData } from './utils/textNormalizer.js';
import { createEmailTransporter, getFromEmail, getFromName, getReplyTo } from './utils/emailTransporter.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
      console.log('Google Sheets integration enabled');
    } else {
      console.log('Google Sheets integration disabled - credentials not set');
    }
  } catch (err) {
    console.error('Google Sheets integration disabled - error:', err.message);
  }
})();

// Email setup (supports both Mailgun and Gmail)
const transporter = createEmailTransporter();

// Log configuration status (without exposing secrets)
console.log('Configuration check:');
if (process.env.BREVO_SMTP_KEY) {
  console.log('- Email Service: ✅ Brevo (Sendinblue)');
} else if (process.env.MAILGUN_API_KEY) {
  console.log('- Email Service: ✅ Mailgun');
} else if (process.env.GMAIL_USER) {
  console.log('- Email Service: ✅ Gmail (fallback)');
} else {
  console.log('- Email Service: ❌ Not configured');
}
console.log('- BREVO_SMTP_KEY:', process.env.BREVO_SMTP_KEY ? '✅ Set' : '❌ Missing');
console.log('- MAILGUN_DOMAIN:', process.env.MAILGUN_DOMAIN ? '✅ Set' : '❌ Missing');
console.log('- GMAIL_USER:', process.env.GMAIL_USER ? '✅ Set (fallback)' : '❌ Missing');
console.log('- STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing');
console.log('- GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ Set' : '❌ Missing');
console.log('- GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
console.log('- GOOGLE_SHEETS_ID:', process.env.GOOGLE_SHEETS_ID ? '✅ Set' : '❌ Missing');

// Helper: format registration email
function formatEmail(data, session) {
  const pokerRun = data.pokerRun === 'true' || data.pokerRun === true;
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

Additional Events:
  • Poker Run: ${pokerRun ? 'Yes' : 'No'}

Payment Details:
  • Base Registration: $30.00
  • Poker Run: $${pokerRun ? '5.00' : '0.00'}
  • Total Charged: $${(session.amount_total / 100).toFixed(2)}
  • Payment Transaction ID: ${session.payment_intent}

Date/Time of Registration: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} (PST)
`
  };
}

// Helper: Get current entry count from Google Sheets (for entry numbers)
async function getEntryCount() {
  if (!sheets || !auth) {
    console.log('Google Sheets not configured, using timestamp-based entry number');
    // Fallback: use timestamp-based numbering
    return Date.now() % 1000;
  }
  
  try {
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();
    
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/Sheet1!A:A`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
      }
    });
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    // Count rows (minus header row)
    // data.values includes the header row, so subtract 1
    // Handle empty array case: if values is [] or null/undefined
    if (!data.values || data.values.length === 0) {
      return 1; // First entry number
    }
    const rowCount = data.values.length - 1; // Subtract header row
    return Math.max(1, rowCount + 1); // Entry numbers start at 1, so add 1 to get next entry number
  } catch (err) {
    console.error('Failed to get entry count from Google Sheets:', err);
    // Fallback
    return Date.now() % 1000;
  }
}

// Helper: Get current Poker Run count from Google Sheets (for Poker Run registration numbers)
async function getPokerRunCount() {
  if (!sheets || !auth) {
    console.log('Google Sheets not configured, using timestamp-based Poker Run number');
    return Date.now() % 1000;
  }
  
  try {
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();
    
    // Get Column J (Poker Run column, index 9)
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
    
    // Count "Yes" values (excluding header row)
    let pokerRunCount = 0;
    if (data.values && data.values.length > 1) {
      for (let i = 1; i < data.values.length; i++) {
        if (data.values[i] && data.values[i][0] === 'Yes') {
          pokerRunCount++;
        }
      }
    }
    
    // Return next Poker Run number (current count + 1)
    return Math.max(1, pokerRunCount + 1);
  } catch (err) {
    console.error('Failed to get Poker Run count from Google Sheets:', err);
    return Date.now() % 1000;
  }
}

// Helper: Add registration to Google Sheets
async function addToGoogleSheets(data, session, entryNumber, pokerRunNumber = null) {
  if (!sheets || !auth) {
    console.log('Skipping Google Sheets - not configured');
    return null;
  }
  try {
    const pokerRun = data.pokerRun === 'true' || data.pokerRun === true;
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
      pokerRun ? 'Yes' : 'No',
      30, // Base fee
      pokerRun ? 5 : 0, // Poker run price
      (session.amount_total / 100).toFixed(2), // Total paid
      session.payment_intent, // Payment ID
      String(entryNumber).padStart(3, '0'), // Entry Number (formatted as 001, 002, etc.) - Column O should be formatted as Text in Google Sheets
      pokerRun && pokerRunNumber ? String(pokerRunNumber).padStart(3, '0') : '' // Poker Run Number (formatted as 001, 002, etc.) - Column P should be formatted as Text in Google Sheets
    ];

    // Use a more compatible approach for the Google Sheets API
    const authClient = await auth.getClient();
    
    // Use the raw fetch API approach to avoid Headers issues
    const accessToken = await authClient.getAccessToken();
    
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/Sheet1!A:P:append?valueInputOption=USER_ENTERED`, {
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
    
    const result = await response.json();
    console.log('Registration added to Google Sheets for', data.firstName, data.lastName);
    
    // Return the actual entry number that was written to the sheet
    // This should match the entryNumber parameter, but we return it for verification
    if (result.updates && result.updates.updatedRange) {
      const match = result.updates.updatedRange.match(/!A(\d+):/);
      if (match) {
        const actualRowNumber = parseInt(match[1], 10);
        const actualEntryNumber = actualRowNumber - 1; // Subtract 1 for header row
        console.log(`Row written to row ${actualRowNumber}, entry number: ${actualEntryNumber}`);
        return actualEntryNumber;
      }
    }
    // If we can't determine the row number, return the entryNumber that was passed in
    console.warn('Could not determine actual row number from Google Sheets response, using provided entry number');
    return entryNumber;
  } catch (err) {
    console.error('Failed to add registration to Google Sheets:', err);
    return null;
  }
}

// Disable body parsing for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('=== WEBHOOK CALLED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  // Handle OPTIONS preflight (though Stripe shouldn't send these)
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }
  
  if (req.method !== 'POST') {
    console.error(`❌ Invalid method received: ${req.method}. Expected POST.`);
    console.error('Request details:', {
      method: req.method,
      url: req.url,
      headers: Object.keys(req.headers || {})
    });
    return res.status(405).json({ 
      error: 'Method not allowed',
      received: req.method,
      expected: 'POST'
    });
  }

  const sig = req.headers['stripe-signature'];
  console.log('Stripe signature present:', !!sig);
  console.log('Webhook secret configured:', !!process.env.STRIPE_WEBHOOK_SECRET);
  
  let event;
  let rawBody;
  
  // Get raw body for signature verification
  try {
    const buffer = await getRawBody(req);
    rawBody = buffer.toString('utf8');
    console.log('Raw body length:', rawBody.length);
    console.log('Raw body preview:', rawBody.substring(0, 100));
  } catch (err) {
    console.error('Error reading request body:', err.message);
    return res.status(400).send('Error reading request body');
  }
  
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('✅ Webhook signature verified successfully');
    console.log('Event type:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const rawData = session.metadata || {};
    
    // Normalize text data (proper capitalization, trimming, etc.)
    const data = normalizeRegistrationData(rawData);
    
    console.log('Processing checkout.session.completed for:', data.firstName, data.lastName);
    console.log('Session ID:', session.id);
    
    // Get the entry number first (before adding to sheets to avoid race conditions)
    // Note: There's still a potential race condition if two webhooks arrive simultaneously,
    // but this minimizes the window. For true atomicity, you'd need database transactions.
    let entryNumber = await getEntryCount();
    console.log('Assigned entry number:', entryNumber);
    
    // Get Poker Run number if they purchased it
    const pokerRun = data.pokerRun === 'true' || data.pokerRun === true;
    let pokerRunNumber = null;
    if (pokerRun) {
      pokerRunNumber = await getPokerRunCount();
      console.log('Assigned Poker Run number:', pokerRunNumber);
    }
    
    // Run email, Google Sheets, and PDF operations
    const promises = [];
    
    // Send admin notification email
    try {
      const email = formatEmail(data, session);
      const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || getFromEmail();
      console.log('Attempting to send admin email to:', adminEmail);
      const fromName = getFromName();
      const fromEmail = getFromEmail();
      const replyTo = getReplyTo();
      const domain = fromEmail.split('@')[1];
      const messageId = `<admin-notification-${Date.now()}@${domain}>`;
      const emailPromise = transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: adminEmail, // admin/club email
        replyTo: replyTo,
        subject: email.subject,
        text: email.text,
        headers: {
          'Message-ID': messageId,
          'X-Mailer': 'Seaside Cruizers Registration System',
        },
      }).then(() => {
        console.log('Admin email sent successfully');
      }).catch((err) => {
        console.error('Admin email failed:', err.message);
        throw err;
      });
      promises.push(emailPromise);
    } catch (err) {
      console.error('Failed to prepare admin email:', err);
    }
    
    // Add to Google Sheets and get the actual entry number that was used
    // The returned rowNumber should match entryNumber, but we use it to verify
    console.log('Attempting to add to Google Sheets with entry number:', entryNumber, 'Poker Run number:', pokerRunNumber);
    const sheetsResult = await addToGoogleSheets(data, session, entryNumber, pokerRunNumber);
    if (sheetsResult !== null && sheetsResult !== undefined && sheetsResult !== entryNumber) {
      // If the actual row number differs from what we calculated, use the actual one
      // This can happen in rare race conditions, but we'll use what was actually written
      console.warn(`Entry number mismatch: calculated ${entryNumber}, actual ${sheetsResult}. Using actual.`);
      entryNumber = sheetsResult;
    } else if (sheetsResult === null || sheetsResult === undefined) {
      console.warn('Google Sheets did not return row number, using calculated entry number:', entryNumber);
    }
    console.log('Final entry number:', entryNumber);
    
    // Wait for email to complete
    await Promise.allSettled(promises);
    
    // Generate and send dash sheet PDF to participant
    try {
      console.log('Generating dash sheet PDF...');
      const pdfBuffer = await generateDashSheetPDF(data, entryNumber, pokerRunNumber);
      
      console.log('Sending dash sheet PDF to participant:', data.email);
      await sendDashSheetEmail(
        transporter,
        pdfBuffer,
        data.email,
        `${data.firstName} ${data.lastName}`,
        entryNumber
      );
      console.log('Dash sheet PDF sent successfully to:', data.email);
    } catch (err) {
      console.error('Failed to generate or send dash sheet PDF:', err);
      // Don't fail the webhook if PDF generation fails
    }
    
    // Log summary
    console.log('Registration fully processed for', data.firstName, data.lastName);
  }
  
  res.json({ received: true });
}
