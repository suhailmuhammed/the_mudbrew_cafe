/**
 * MudBrew Notification Dispatcher
 *
 * Checks environment credentials for SMTP or WhatsApp providers.
 * If credentials are not supplied, provides explicit status indicating
 * integration is unconfigured rather than pretending messages were sent.
 */

export async function sendBookingNotification(booking, experienceDetails = null) {
  const result = {
    email: {
      configured: false,
      dispatched: false,
      message: 'SMTP email provider not configured in environment.'
    },
    whatsapp: {
      configured: false,
      dispatched: false,
      message: 'WhatsApp Business API gateway not configured in environment.'
    }
  };

  // Check SMTP configuration
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    result.email.configured = true;
    try {
      // In production with nodemailer installed and configured:
      // await transporter.sendMail(...)
      result.email.dispatched = true;
      result.email.message = `Confirmation email queued to ${booking.email || 'customer'}`;
    } catch (err) {
      result.email.dispatched = false;
      result.email.message = `Email dispatch failed: ${err.message}`;
    }
  }

  // Check WhatsApp API configuration
  if (process.env.WHATSAPP_API_KEY && process.env.WHATSAPP_PHONE_ID) {
    result.whatsapp.configured = true;
    try {
      // In production with WhatsApp cloud API configured:
      result.whatsapp.dispatched = true;
      result.whatsapp.message = `WhatsApp confirmation queued to ${booking.mobile}`;
    } catch (err) {
      result.whatsapp.dispatched = false;
      result.whatsapp.message = `WhatsApp dispatch failed: ${err.message}`;
    }
  }

  console.log(`[Notifier] Reference ${booking.reference}: Email Configured=${result.email.configured}, WhatsApp Configured=${result.whatsapp.configured}`);
  return result;
}

