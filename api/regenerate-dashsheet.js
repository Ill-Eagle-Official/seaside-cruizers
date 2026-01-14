import { generateDashSheetPDF, sendDashSheetEmail } from './utils/pdfGenerator.js';
import { normalizeRegistrationData } from './utils/textNormalizer.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

/**
 * Manual dash sheet regeneration endpoint
 * 
 * POST /api/regenerate-dashsheet
 * 
 * Body (JSON):
 * {
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "email": "john.doe@example.com",
 *   "year": "1965",
 *   "make": "Chevrolet",
 *   "model": "Impala",
 *   "city": "Parksville",
 *   "province": "BC",
 *   "entryNumber": 42,
 *   "pokerRunNumber": 15,  // Optional - only include if they purchased Poker Run
 *   "adminKey": "optional-admin-key-for-security"
 * }
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST to regenerate dash sheet.' });
  }

  try {
    console.log('=== MANUAL DASH SHEET REGENERATION ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Extract data from request body
    const {
      firstName,
      lastName,
      email,
      year,
      make,
      model,
      city,
      province,
      entryNumber,
      pokerRunNumber,
      adminKey
    } = req.body;

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'year', 'make', 'model', 'city', 'province', 'entryNumber'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields: missingFields
      });
    }

    // Optional: Add basic security check (set ADMIN_KEY in environment variables)
    if (process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_KEY) {
      console.warn('⚠️  Unauthorized regeneration attempt');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Admin key required.'
      });
    }

    // Prepare registration data
    const rawData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      year: String(year).trim(),
      make: make.trim(),
      model: model.trim(),
      city: city.trim(),
      province: province.trim()
    };

    // Normalize the data (same as webhook does)
    const normalizedData = normalizeRegistrationData(rawData);
    
    const entryNum = parseInt(entryNumber, 10);
    if (isNaN(entryNum) || entryNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid entry number. Must be a positive integer.'
      });
    }

    // Parse Poker Run number if provided
    const pokerRunNum = pokerRunNumber ? parseInt(pokerRunNumber, 10) : null;
    if (pokerRunNumber && (isNaN(pokerRunNum) || pokerRunNum < 1)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Poker Run number. Must be a positive integer or omitted.'
      });
    }

    console.log('Original data:', rawData);
    console.log('Normalized data:', normalizedData);
    console.log('Entry number:', entryNum);
    console.log('Poker Run number:', pokerRunNum);

    // Generate PDF
    console.log('Generating dash sheet PDF...');
    const pdfBuffer = await generateDashSheetPDF(normalizedData, entryNum, pokerRunNum);
    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    // Send email
    console.log('Sending dash sheet email to:', normalizedData.email);
    await sendDashSheetEmail(
      transporter,
      pdfBuffer,
      normalizedData.email,
      `${normalizedData.firstName} ${normalizedData.lastName}`,
      entryNum
    );

    console.log('✅ Dash sheet regenerated and sent successfully to:', normalizedData.email);

    res.status(200).json({
      success: true,
      message: `Dash sheet PDF regenerated and sent to ${normalizedData.email}`,
      data: {
        recipient: `${normalizedData.firstName} ${normalizedData.lastName}`,
        email: normalizedData.email,
        entryNumber: String(entryNum).padStart(3, '0'),
        vehicle: `${normalizedData.year} ${normalizedData.make} ${normalizedData.model}`,
        location: `${normalizedData.city}, ${normalizedData.province}`,
        pdfSize: pdfBuffer.length
      }
    });
  } catch (err) {
    console.error('❌ Regeneration failed:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}

