import { generateDashSheetPDF, sendDashSheetEmail } from './utils/pdfGenerator.js';
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

export default async function handler(req, res) {
  // Only allow POST requests for testing
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST to test.' });
  }

  try {
    console.log('Testing dash sheet PDF generation...');
    
    // Test data
    const testData = {
      firstName: 'John',
      lastName: 'Doe',
      email: req.body.email || process.env.GMAIL_USER, // Send to your own email for testing
      year: '1969',
      make: 'Chevrolet',
      model: 'Camaro SS',
      city: 'Parksville',
      province: 'BC'
    };
    
    const testEntryNumber = 42;
    
    console.log('Generating PDF for test data:', testData);
    
    // Generate PDF
    const pdfBuffer = await generateDashSheetPDF(testData, testEntryNumber);
    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');
    
    // Send email
    await sendDashSheetEmail(
      transporter,
      pdfBuffer,
      testData.email,
      `${testData.firstName} ${testData.lastName}`,
      testEntryNumber
    );
    
    console.log('Test email sent successfully to:', testData.email);
    
    res.status(200).json({
      success: true,
      message: `Test dash sheet PDF generated and sent to ${testData.email}`,
      pdfSize: pdfBuffer.length,
      entryNumber: testEntryNumber
    });
  } catch (err) {
    console.error('Test failed:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}

