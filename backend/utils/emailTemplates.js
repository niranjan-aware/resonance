export const emailTemplates = {
  bookingCreated: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Created</title>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F59E0B, #FBBF24); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-label { font-weight: 600; color: #64748b; }
            .detail-value { font-weight: 500; color: #1e293b; }
            .amount { font-size: 24px; font-weight: bold; color: #F59E0B; text-align: center; margin: 20px 0; }
            .warning { background: #FEF3C7; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #F59E0B; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📝 Booking Created!</h1>
                <p>Complete payment to confirm your session</p>
            </div>
            <div class="content">
                <p>Hello ${data.userName},</p>
                <p>Your booking has been created successfully. Please complete the payment to confirm your session.</p>
                
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
                        <span class="detail-label">Status:</span>
                        <span class="detail-value" style="color: #F59E0B; font-weight: bold;">PENDING PAYMENT</span>
                    </div>
                </div>
                
                <div class="amount">Total: ₹${data.totalAmount}</div>
                
                <div class="warning">
                    <p><strong>⚠️ Important:</strong></p>
                    <p>This booking is not confirmed yet. Please complete the payment within 24 hours to confirm your session.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `,

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
                
                <p><strong>Important Notes:</strong></p>
                <ul>
                    <li>Please arrive 15 minutes before your session</li>
                    <li>Bring a valid ID for verification</li>
                    <li>Cancellations must be made 24 hours in advance</li>
                    <li>Contact us at +91-98765 43210 for any queries</li>
                </ul>
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
                        <div class="label">Email</div>
                        <div class="value">${data.userEmail}</div>
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
  `,

  hourlyDigest: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Hourly Booking Digest</title>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B5CF6, #A78BFA); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .summary-item { text-align: center; padding: 15px; background: #f1f5f9; border-radius: 6px; }
            .summary-value { font-size: 32px; font-weight: bold; color: #8B5CF6; }
            .summary-label { font-size: 14px; color: #64748b; margin-top: 5px; }
            .booking-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .booking-item { padding: 15px; border-left: 4px solid #8B5CF6; background: #f8fafc; margin: 10px 0; border-radius: 4px; }
            .booking-header { font-weight: 600; color: #1e293b; margin-bottom: 8px; }
            .booking-details { font-size: 14px; color: #64748b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Hourly Booking Digest</h1>
                <p>${data.period}</p>
            </div>
            <div class="content">
                <div class="summary">
                    <div class="summary-item">
                        <div class="summary-value">${data.count}</div>
                        <div class="summary-label">New Bookings</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">₹${data.totalRevenue}</div>
                        <div class="summary-label">Total Revenue</div>
                    </div>
                </div>

                <div class="booking-list">
                    <h3 style="margin-top: 0;">Booking Details</h3>
                    ${data.bookings.map(booking => `
                        <div class="booking-item">
                            <div class="booking-header">
                                ${booking.bookingId} - ${booking.userName}
                            </div>
                            <div class="booking-details">
                                <p><strong>Studio:</strong> ${booking.studioName} | <strong>Date:</strong> ${booking.date} at ${booking.startTime} - ${booking.endTime}</p>
                                <p><strong>Contact:</strong> ${booking.userEmail} | ${booking.userPhone}</p>
                                <p><strong>Session:</strong> ${booking.sessionType} | <strong>Amount:</strong> ₹${booking.totalAmount} | <strong>Status:</strong> ${booking.status}</p>
                                <p><strong>Created:</strong> ${booking.createdAt}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </body>
    </html>
  `,

  tomorrowBookings: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Tomorrow's Bookings</title>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981, #34D399); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .summary-item { text-align: center; padding: 15px; background: #f1f5f9; border-radius: 6px; }
            .summary-value { font-size: 32px; font-weight: bold; color: #10B981; }
            .summary-label { font-size: 14px; color: #64748b; margin-top: 5px; }
            .booking-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .booking-item { padding: 15px; border-left: 4px solid #10B981; background: #f8fafc; margin: 10px 0; border-radius: 4px; }
            .booking-header { font-weight: 600; color: #1e293b; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
            .booking-time { background: #10B981; color: white; padding: 4px 12px; border-radius: 4px; font-size: 14px; }
            .booking-details { font-size: 14px; color: #64748b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📅 Tomorrow's Schedule</h1>
                <p>${data.date}</p>
            </div>
            <div class="content">
                <div class="summary">
                    <div class="summary-item">
                        <div class="summary-value">${data.count}</div>
                        <div class="summary-label">Total Sessions</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">₹${data.totalRevenue}</div>
                        <div class="summary-label">Expected Revenue</div>
                    </div>
                </div>

                <div class="booking-list">
                    <h3 style="margin-top: 0;">Session Schedule</h3>
                    ${data.bookings.map(booking => `
                        <div class="booking-item">
                            <div class="booking-header">
                                <span>${booking.bookingId} - ${booking.userName}</span>
                                <span class="booking-time">${booking.startTime} - ${booking.endTime}</span>
                            </div>
                            <div class="booking-details">
                                <p><strong>Studio:</strong> ${booking.studioName} | <strong>Session:</strong> ${booking.sessionType}</p>
                                <p><strong>Contact:</strong> ${booking.userEmail} | ${booking.userPhone}</p>
                                <p><strong>Participants:</strong> ${booking.participants} | <strong>Amount:</strong> ₹${booking.totalAmount} | <strong>Status:</strong> ${booking.status}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="background: #FEF3C7; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #F59E0B;">
                    <p style="margin: 0;"><strong>⚠️ Preparation Checklist:</strong></p>
                    <ul style="margin: 10px 0;">
                        <li>Ensure all studios are cleaned and ready</li>
                        <li>Verify equipment is functional</li>
                        <li>Confirm staff availability for all sessions</li>
                        <li>Review special requirements from customers</li>
                    </ul>
                </div>
            </div>
        </div>
    </body>
    </html>
  `,

  contactFormAdmin: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1E293B, #334155); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .info-box { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2563EB; }
            .label { font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; display: block; }
            .value { color: #1e293b; font-size: 14px; margin-top: 5px; }
            .message-box { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #e2e8f0; }
            .action-button { display: inline-block; background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎵 New Contact Form Submission</h1>
                <p>Resonance Studio</p>
            </div>
            <div class="content">
                <div class="info-box">
                    <span class="label">From</span>
                    <div class="value">${data.userName}</div>
                </div>

                <div class="info-box">
                    <span class="label">Email</span>
                    <div class="value"><a href="mailto:${data.userEmail}" style="color: #2563EB; text-decoration: none;">${data.userEmail}</a></div>
                </div>

                <div class="info-box">
                    <span class="label">Phone</span>
                    <div class="value"><a href="tel:${data.userPhone}" style="color: #2563EB; text-decoration: none;">${data.userPhone}</a></div>
                </div>

                <div class="info-box">
                    <span class="label">Subject</span>
                    <div class="value">${data.subject}</div>
                </div>

                <div class="info-box">
                    <span class="label">Preferred Contact</span>
                    <div class="value" style="text-transform: capitalize;">${data.preferredContact}</div>
                </div>

                <div class="info-box">
                    <span class="label">Received At</span>
                    <div class="value">${data.timestamp}</div>
                </div>

                <div class="message-box">
                    <span class="label">Message</span>
                    <div class="value" style="white-space: pre-wrap; margin-top: 10px; line-height: 1.6;">${data.message}</div>
                </div>

                <center>
                    <a href="mailto:${data.userEmail}?subject=Re: ${encodeURIComponent(data.subject)}" class="action-button">
                        📧 Reply to ${data.userName}
                    </a>
                </center>
            </div>
        </div>
    </body>
    </html>
  `,

  contactFormUser: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Contacting Us</title>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563EB, #3B82F6); color: white; text-align: center; padding: 40px 30px; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .highlight-box { background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563EB; }
            .message-copy { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; white-space: pre-wrap; line-height: 1.6; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Message Received!</h1>
                <p style="margin: 0; font-size: 16px;">We'll get back to you soon</p>
            </div>
            <div class="content">
                <p>Hello <strong>${data.userName}</strong>,</p>
                
                <p>Thank you for reaching out to <strong>Resonance Studio</strong>! We've successfully received your inquiry about <strong>"${data.subject}"</strong>.</p>

                <div class="highlight-box">
                    <h3 style="margin-top: 0; color: #2563EB;">⏱️ What Happens Next?</h3>
                    <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                        <li>Our team will review your message within <strong>2-4 business hours</strong></li>
                        <li>We'll respond via your preferred method: <strong style="text-transform: capitalize;">${data.preferredContact}</strong></li>
                        <li>For urgent inquiries, call us at <a href="tel:+919876543210" style="color: #2563EB;">+91 98765 43210</a></li>
                    </ul>
                </div>

                <div style="margin: 25px 0;">
                    <p style="margin-bottom: 10px;"><strong>📝 Your Message:</strong></p>
                    <div class="message-copy">${data.message}</div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `
};