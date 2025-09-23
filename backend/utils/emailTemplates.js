export const emailTemplates = {
  bookingConfirmation: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmed</title>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563EB, #3B82F6); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-label { font-weight: 600; color: #64748b; }
            .detail-value { font-weight: 500; color: #1e293b; }
            .amount { font-size: 24px; font-weight: bold; color: #2563EB; text-align: center; margin: 20px 0; }
            .button { display: inline-block; background: #2563EB; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
            .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎵 Booking Confirmed!</h1>
                <p>Your studio session is all set</p>
            </div>
            <div class="content">
                <p>Hello ${data.userName},</p>
                <p>Great news! Your booking has been confirmed. Here are your session details:</p>
                
                <div class="booking-card">
                    <div class="detail-row">
                        <span class="detail-label">Booking ID:</span>
                        <span class="detail-value">${data.bookingId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Studio:</span>
                        <span class="detail-value">${data.studioName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">${data.date}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Time:</span>
                        <span class="detail-value">${data.startTime} - ${data.endTime}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Session Type:</span>
                        <span class="detail-value">${data.sessionType}</span>
                    </div>
                </div>
                
                <div class="amount">Total: ₹${data.totalAmount}</div>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/booking/${data.bookingId}" class="button">View Booking Details</a>
                </div>
                
                <p><strong>Important Notes:</strong></p>
                <ul>
                    <li>Please arrive 15 minutes before your session</li>
                    <li>Bring a valid ID for verification</li>
                    <li>Cancellations must be made 24 hours in advance</li>
                    <li>Contact us at +91-XXXXXXXXX for any queries</li>
                </ul>
                
                <div class="footer">
                    <p>Resonance Studio - Sinhgad Road<br>
                    📧 info@resonancestudio.com | 📞 +91-XXXXXXXXX<br>
                    <a href="${process.env.FRONTEND_URL}">Visit our website</a></p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `,

  bookingReminder: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Reminder</title>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F59E0B, #FBBF24); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .reminder-card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0; border-left: 4px solid #F59E0B; }
            .time-highlight { font-size: 20px; font-weight: bold; color: #F59E0B; text-align: center; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⏰ Booking Reminder</h1>
                <p>Your session is coming up!</p>
            </div>
            <div class="content">
                <p>Hello ${data.userName},</p>
                <p>This is a friendly reminder that your studio session is in <strong>${data.timeUntil}</strong>.</p>
                
                <div class="reminder-card">
                    <div class="time-highlight">${data.date} at ${data.startTime}</div>
                    <p><strong>Studio:</strong> ${data.studioName}</p>
                    <p><strong>Booking ID:</strong> ${data.bookingId}</p>
                </div>
                
                <p><strong>Quick Reminders:</strong></p>
                <ul>
                    <li>Arrive 15 minutes early</li>
                    <li>Bring your ID and confirmation</li>
                    <li>Check traffic conditions</li>
                </ul>
                
                <p>Looking forward to seeing you soon!</p>
            </div>
        </div>
    </body>
    </html>
  `,

  bookingCancellation: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Booking Cancelled</title>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #EF4444, #F87171); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .cancellation-card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0; border-left: 4px solid #EF4444; }
            .refund-info { background: #FEF3C7; padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid #F59E0B; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>❌ Booking Cancelled</h1>
                <p>Your session has been cancelled</p>
            </div>
            <div class="content">
                <p>Hello ${data.userName},</p>
                <p>Your booking has been successfully cancelled.</p>
                
                <div class="cancellation-card">
                    <p><strong>Booking ID:</strong> ${data.bookingId}</p>
                    <p><strong>Studio:</strong> ${data.studioName}</p>
                    <p><strong>Date:</strong> ${data.date} at ${data.startTime}</p>
                </div>
                
                ${data.refundAmount > 0 ? `
                <div class="refund-info">
                    <p><strong>💰 Refund Information</strong></p>
                    <p>Refund Amount: <strong>₹${data.refundAmount}</strong></p>
                    <p>Your refund will be processed within 5-7 business days to your original payment method.</p>
                </div>
                ` : ''}
                
                <p>We're sorry to see you go! Feel free to book another session anytime.</p>
            </div>
        </div>
    </body>
    </html>
  `,

  adminNotification: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Admin Notification</title>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1E293B; color: white; text-align: center; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 25px; border-radius: 0 0 8px 8px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .info-item { background: white; padding: 15px; border-radius: 6px; border-left: 3px solid #2563EB; }
            .label { font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; }
            .value { font-weight: 500; color: #1e293b; margin-top: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>🎵 Resonance Studio - Admin Alert</h2>
            </div>
            <div class="content">
                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">Booking ID</div>
                        <div class="value">${data.bookingId}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Customer</div>
                        <div class="value">${data.userName}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Phone</div>
                        <div class="value">${data.userPhone}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Studio</div>
                        <div class="value">${data.studioName}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Date & Time</div>
                        <div class="value">${data.date} (${data.startTime} - ${data.endTime})</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Session Type</div>
                        <div class="value">${data.sessionType}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Amount</div>
                        <div class="value">₹${data.totalAmount}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Status</div>
                        <div class="value">${data.status}</div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `
};