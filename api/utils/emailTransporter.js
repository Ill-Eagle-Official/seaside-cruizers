/**
 * Email transporter factory
 * Supports Brevo, Mailgun, and Gmail
 * Automatically detects which service to use based on environment variables
 * Priority: Brevo > Mailgun > Gmail
 */

import nodemailer from 'nodemailer';

/**
 * Creates and returns an email transporter
 * Priority: Brevo (if configured) > Mailgun > Gmail (fallback)
 */
export function createEmailTransporter() {
  // Check if Brevo is configured (recommended - free forever)
  if (process.env.BREVO_SMTP_KEY && process.env.BREVO_SMTP_USER) {
    console.log('📧 Using Brevo (Sendinblue) for email delivery');
    
    const smtpHost = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
    const smtpPort = parseInt(process.env.BREVO_SMTP_PORT || '587', 10);
    const useSSL = smtpPort === 465;
    
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: useSSL, // true for 465, false for other ports
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });
  }
  
  // Check if Mailgun is configured
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    console.log('📧 Using Mailgun for email delivery');
    
    const region = process.env.MAILGUN_REGION || 'us';
    const smtpHost = region === 'eu' ? 'smtp.eu.mailgun.org' : 'smtp.mailgun.org';
    
    return nodemailer.createTransport({
      host: smtpHost,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAILGUN_SMTP_USER || `postmaster@${process.env.MAILGUN_DOMAIN}`,
        pass: process.env.MAILGUN_SMTP_PASSWORD || process.env.MAILGUN_API_KEY,
      },
      // Mailgun-specific options
      tls: {
        rejectUnauthorized: true,
      },
    });
  }
  
  // Fallback to Gmail if no other service configured
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    console.log('📧 Using Gmail for email delivery (fallback)');
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }
  
  // No email service configured
  throw new Error('No email service configured. Please set either BREVO_SMTP_KEY and BREVO_SMTP_USER, MAILGUN_API_KEY and MAILGUN_DOMAIN, or GMAIL_USER and GMAIL_PASS');
}

/**
 * Gets the "from" email address based on configured service
 */
export function getFromEmail() {
  if (process.env.EMAIL_FROM_ADDRESS) {
    return process.env.EMAIL_FROM_ADDRESS;
  }
  
  if (process.env.BREVO_SMTP_USER) {
    // Use Brevo SMTP user as from address if no custom from address
    return process.env.BREVO_SMTP_USER;
  }
  
  if (process.env.MAILGUN_DOMAIN) {
    // Use postmaster@domain for Mailgun if no custom from address
    return `postmaster@${process.env.MAILGUN_DOMAIN}`;
  }
  
  if (process.env.GMAIL_USER) {
    return process.env.GMAIL_USER;
  }
  
  throw new Error('No email from address configured');
}

/**
 * Gets the "from" name
 */
export function getFromName() {
  return process.env.EMAIL_FROM_NAME || 'Seaside Cruizers Car Show';
}

/**
 * Gets the reply-to address
 */
export function getReplyTo() {
  return process.env.EMAIL_REPLY_TO || getFromEmail();
}
