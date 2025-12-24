import { Resend } from 'resend';

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

interface BookingConfirmationData {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
  confirmationNumber: string;
  businessName: string;
}

export async function sendBookingConfirmation(data: BookingConfirmationData): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.log('RESEND_API_KEY not configured, skipping email');
    return false;
  }

  try {
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const { error } = await resend.emails.send({
      from: 'BookFlow <onboarding@resend.dev>',
      to: data.customerEmail,
      subject: `Booking Confirmed - ${data.businessName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #000000; color: #ffffff; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .checkmark { width: 60px; height: 60px; background-color: #000000; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
            .checkmark svg { width: 30px; height: 30px; }
            .title { font-size: 24px; font-weight: 600; text-align: center; margin-bottom: 10px; }
            .subtitle { color: #666666; text-align: center; margin-bottom: 30px; }
            .details { background-color: #f8f8f8; border-radius: 12px; padding: 24px; margin-bottom: 30px; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e5e5; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { color: #666666; }
            .detail-value { font-weight: 500; text-align: right; }
            .total-row { color: #000000; font-weight: 600; }
            .footer { background-color: #f5f5f5; padding: 30px; text-align: center; color: #888888; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.businessName}</h1>
            </div>
            <div class="content">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 60px; height: 60px; background-color: #000000; border-radius: 50%; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center;">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              <h2 class="title">Booking Confirmed!</h2>
              <p class="subtitle">Thank you for your booking, ${data.customerName}.</p>
              
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Confirmation #</span>
                  <span class="detail-value">${data.confirmationNumber}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Service</span>
                  <span class="detail-value">${data.serviceName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time</span>
                  <span class="detail-value">${data.time}</span>
                </div>
                <div class="detail-row total-row">
                  <span class="detail-label">Total</span>
                  <span class="detail-value">$${(data.price / 100).toFixed(2)}</span>
                </div>
              </div>
              
              <p style="color: #666666; font-size: 14px; text-align: center;">
                If you need to cancel or reschedule, please contact us directly.
              </p>
            </div>
            <div class="footer">
              <p>Powered by BookFlow</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    console.log('Booking confirmation email sent to:', data.customerEmail);
    return true;
  } catch (error) {
    console.error('Failed to send booking confirmation:', error);
    return false;
  }
}
