import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert logo to base64 for embedding
function getLogoBase64() {
  try {
    const logoPath = path.join(__dirname, '../../seaside-cruizers.jpg');
    const logoBuffer = fs.readFileSync(logoPath);
    return `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;
  } catch (err) {
    console.error('Error reading logo:', err);
    return '';
  }
}

// Read and populate the dash sheet HTML template
function populateDashSheetTemplate(data) {
  try {
    const templatePath = path.join(__dirname, '../../dashsheet.html');
    let html = fs.readFileSync(templatePath, 'utf8');
    
    // Replace placeholders with actual data
    html = html.replace(/\{\{entryNumber\}\}/g, data.entryNumber || '000');
    html = html.replace(/\{\{year\}\}/g, data.year || '');
    html = html.replace(/\{\{make\}\}/g, data.make || '');
    html = html.replace(/\{\{model\}\}/g, data.model || '');
    html = html.replace(/\{\{ownerName\}\}/g, data.ownerName || '');
    html = html.replace(/\{\{city\}\}/g, data.city || '');
    html = html.replace(/\{\{province\}\}/g, data.province || '');
    
    // Replace the logo src with base64 data
    const logoBase64 = getLogoBase64();
    html = html.replace(/src="seaside-cruizers\.jpg"/, `src="${logoBase64}"`);
    
    return html;
  } catch (err) {
    console.error('Error reading template:', err);
    throw err;
  }
}

/**
 * Generate a PDF from the dash sheet template
 * @param {Object} registrationData - Registration data from the form
 * @param {string} registrationData.firstName - Participant's first name
 * @param {string} registrationData.lastName - Participant's last name
 * @param {string} registrationData.year - Car year
 * @param {string} registrationData.make - Car make
 * @param {string} registrationData.model - Car model
 * @param {string} registrationData.city - City
 * @param {string} registrationData.province - Province/State
 * @param {number} entryNumber - Entry number for the show
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateDashSheetPDF(registrationData, entryNumber) {
  try {
    console.log('Generating dash sheet PDF for', registrationData.firstName, registrationData.lastName);
    
    // Prepare data for template
    const templateData = {
      entryNumber: String(entryNumber).padStart(3, '0'),
      year: registrationData.year,
      make: registrationData.make,
      model: registrationData.model,
      ownerName: `${registrationData.firstName} ${registrationData.lastName}`,
      city: registrationData.city,
      province: registrationData.province
    };
    
    // Populate HTML template
    const html = populateDashSheetTemplate(templateData);
    
    // Generate PDF using PDFShift API
    console.log('Converting HTML to PDF with PDFShift...');
    
    if (!process.env.PDFSHIFT_API_KEY) {
      throw new Error('PDFSHIFT_API_KEY environment variable is not set');
    }
    
    const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${process.env.PDFSHIFT_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: html,
        format: 'Letter',
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0'
        },
        landscape: true,
        use_print: true
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('PDFShift API error:', response.status, errorText);
      throw new Error(`PDFShift API error: ${response.status} - ${errorText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);
    
    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');
    
    return pdfBuffer;
  } catch (err) {
    console.error('Error generating PDF:', err);
    throw err;
  }
}

/**
 * Send dash sheet PDF via email
 * @param {Object} transporter - Nodemailer transporter
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {string} recipientEmail - Recipient email address
 * @param {string} recipientName - Recipient name
 * @param {number} entryNumber - Entry number
 */
export async function sendDashSheetEmail(transporter, pdfBuffer, recipientEmail, recipientName, entryNumber) {
  try {
    console.log('Sending dash sheet email to:', recipientEmail);
    
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: recipientEmail,
      subject: 'Your Seaside Cruizers Car Show Dash Sheet',
      text: `Hi ${recipientName},

Thank you for registering for the Seaside Cruizers Father's Day Show and Shine!

Your entry number is: ${String(entryNumber).padStart(3, '0')}

Please find attached your personalized dash sheet. Print this out and display it on your vehicle's dashboard during the event.

Event Details:
📅 June 19-21, 2026
📍 Parksville – Qualicum Beach

We look forward to seeing you and your vehicle at the show!

Best regards,
Seaside Cruizers Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2c3e50;">Thank You for Registering!</h2>
  <p>Hi ${recipientName},</p>
  <p>Thank you for registering for the <strong>Seaside Cruizers Father's Day Show and Shine</strong>!</p>
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #2c3e50;">Your Entry Number</h3>
    <p style="font-size: 36px; font-weight: bold; color: #e74c3c; margin: 10px 0;">${String(entryNumber).padStart(3, '0')}</p>
  </div>
  <p>Please find attached your personalized <strong>dash sheet</strong>. Print this out and display it on your vehicle's dashboard during the event.</p>
  <div style="background-color: #e8f4f8; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #2c3e50;">Event Details</h3>
    <p style="margin: 5px 0;">📅 <strong>Date:</strong> June 19-21, 2026</p>
    <p style="margin: 5px 0;">📍 <strong>Location:</strong> Parksville – Qualicum Beach</p>
  </div>
  <p>We look forward to seeing you and your vehicle at the show!</p>
  <p style="margin-top: 30px;">Best regards,<br><strong>Seaside Cruizers Team</strong></p>
</div>`,
      attachments: [
        {
          filename: `Dashsheet-${String(entryNumber).padStart(3, '0')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
    
    console.log('Dash sheet email sent successfully to:', recipientEmail);
  } catch (err) {
    console.error('Error sending dash sheet email:', err);
    throw err;
  }
}

