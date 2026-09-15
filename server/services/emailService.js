const nodemailer = require('nodemailer');

/**
 * Create email transporter
 * Supports Gmail, SMTP, and other email services
 */
const createTransporter = () => {
  // For development: Use ethereal email (fake SMTP)
  // For production: Use real SMTP credentials from environment variables
  
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  } else {
    // Development mode - log to console
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER || 'test@example.com',
        pass: process.env.SMTP_PASSWORD || 'test123'
      }
    });
  }
};

/**
 * Send OTP email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.name - Recipient name
 * @param {string} options.otp - OTP code
 * @param {string} options.purpose - Purpose of OTP (signup, login, reset)
 */
exports.sendOTPEmail = async ({ email, name, otp, purpose = 'verification' }) => {
  try {
    const transporter = createTransporter();

    const purposeText = {
      signup: 'complete your signup',
      login: 'login to your account',
      reset: 'reset your password',
      verification: 'verify your account'
    };

    const subject = {
      signup: 'Welcome to Messbee - Verify Your Email',
      login: 'Messbee - Your Login OTP',
      reset: 'Messbee - Password Reset OTP',
      verification: 'Messbee - Email Verification OTP'
    };

    const message = {
      from: `"${process.env.FROM_NAME || 'Messbee'}" <${process.env.FROM_EMAIL || 'noreply@messbee.com'}>`,
      to: email,
      subject: subject[purpose] || subject.verification,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #10B981 0%, #059669 100%);
              border-radius: 10px;
              padding: 30px;
              color: white;
              text-align: center;
            }
            .content {
              background: white;
              border-radius: 10px;
              padding: 30px;
              margin-top: 20px;
              color: #333;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #059669;
              background: #ecfdf5;
              border: 1px solid #a7f3d0;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              display: inline-block;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 14px;
              color: #92400e;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 style="margin: 0;">🔐 Messbee</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Secure Messaging Platform</p>
          </div>
          
          <div class="content">
            <h2>Hello ${name || 'User'}!</h2>
            <p>You requested an OTP to ${purposeText[purpose] || purposeText.verification}.</p>
            
            <p>Your One-Time Password is:</p>
            <div class="otp-code">${otp}</div>
            
            <div class="warning">
              ⚠️ This OTP is valid for <strong>10 minutes</strong> only.
            </div>
            
            <p style="margin-top: 20px;">If you didn't request this OTP, please ignore this email or contact our support team if you have concerns.</p>
            
            <div class="footer">
              <p><strong>Messbee Team</strong></p>
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Messbee. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${name || 'User'}!
        
        Your OTP to ${purposeText[purpose] || purposeText.verification} is: ${otp}
        
        This OTP is valid for 10 minutes only.
        
        If you didn't request this OTP, please ignore this email.
        
        Best regards,
        Messbee Team
      `
    };

    const info = await transporter.sendMail(message);

    // Log preview URL for development (Ethereal)
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 OTP Email sent (Development)');
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      console.log('OTP Code:', otp);
    }

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send OTP email');
  }
};

/**
 * Send welcome email after successful registration
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.name - Recipient name
 */
exports.sendWelcomeEmail = async ({ email, name }) => {
  try {
    const transporter = createTransporter();

    const message = {
      from: `"${process.env.FROM_NAME || 'Messbee'}" <${process.env.FROM_EMAIL || 'noreply@messbee.com'}>`,
      to: email,
      subject: 'Welcome to Messbee! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #10B981 0%, #059669 100%);
              border-radius: 10px;
              padding: 40px;
              color: white;
              text-align: center;
            }
            .content {
              background: white;
              border-radius: 10px;
              padding: 30px;
              margin-top: 20px;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎉 Welcome to Messbee!</h1>
            <p>Your account has been successfully created</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for joining Messbee, your secure messaging platform.</p>
            <p>You can now start using all the features available in your account.</p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>The Messbee Team</strong></p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(message);
    console.log('✅ Welcome email sent to:', email);
  } catch (error) {
    console.error('Welcome email error:', error);
    // Don't throw error for welcome email failure
  }
};

/**
 * Send password reset email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.name - Recipient name
 * @param {string} options.resetUrl - Password reset URL
 */
exports.sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  try {
    const transporter = createTransporter();

    const message = {
      from: `"${process.env.FROM_NAME || 'Messbee'}" <${process.env.FROM_EMAIL || 'noreply@messbee.com'}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold;">Reset Password</a>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Messbee Team</p>
        </body>
        </html>
      `
    };

    await transporter.sendMail(message);
    console.log('✅ Password reset email sent to:', email);
  } catch (error) {
    console.error('Password reset email error:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send team invitation email with login credentials
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.name - Recipient name
 * @param {string} options.password - Generated password
 * @param {string} options.role - Assigned role
 */
exports.sendTeamInviteEmail = async ({ email, name, password, role }) => {
  try {
    const transporter = createTransporter();

    const message = {
      from: `"${process.env.FROM_NAME || 'Messbee'}" <${process.env.FROM_EMAIL || 'noreply@messbee.com'}>`,
      to: email,
      subject: 'You have been invited to join Messbee!',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Messbee, ${name}!</h2>
          <p>You have been invited to join the team as a <strong>${role}</strong>.</p>
          <p>Here are your login credentials:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0 0 0;"><strong>Password:</strong> ${password}</p>
          </div>
          <p>We recommend changing your password after your first login.</p>
          <p>Best regards,<br>Messbee Team</p>
        </body>
        </html>
      `
    };

    await transporter.sendMail(message);
    console.log('✅ Team invite email sent to:', email);
  } catch (error) {
    console.error('Team invite email error:', error);
  }
};

/**
 * Send Sales Inquiry notification email to admin/support and confirmation to customer
 */
exports.sendSalesInquiryEmail = async (inquiry) => {
  try {
    const transporter = createTransporter();
    const fromAddress = `"${process.env.FROM_NAME || 'Messbee Support'}" <${process.env.FROM_EMAIL || 'support@messbee.com'}>`;
    const supportEmail = 'support@messbee.com';
    const notifyEmail = process.env.SMTP_USER || supportEmail;

    // 1. Send lead alert to support / admin
    const adminSubject = `🚀 New Enterprise Sales Inquiry [${inquiry.inquiryId}] - ${inquiry.company || inquiry.fullName}`;
    const featuresList = (inquiry.selectedFeatures || [])
      .map(f => `<li style="margin-bottom: 4px;">✓ ${f}</li>`)
      .join('');

    const adminHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 24px; color: white;">
          <h2 style="margin: 0 0 6px 0; font-size: 22px;">New Enterprise Lead Received</h2>
          <p style="margin: 0; opacity: 0.9; font-size: 13px;">Reference ID: <strong>${inquiry.inquiryId}</strong></p>
        </div>
        <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; color: #64748b; width: 40%;"><strong>Full Name:</strong></td><td style="padding: 8px 0; font-weight: bold;">${inquiry.fullName}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;"><strong>Work Email:</strong></td><td style="padding: 8px 0;"><a href="mailto:${inquiry.email}" style="color: #10B981; font-weight: bold;">${inquiry.email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;"><strong>Phone / WhatsApp:</strong></td><td style="padding: 8px 0; font-weight: bold;">${inquiry.phone}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;"><strong>Company:</strong></td><td style="padding: 8px 0; font-weight: bold;">${inquiry.company}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;"><strong>Company Size:</strong></td><td style="padding: 8px 0;">${inquiry.companySize}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;"><strong>Expected Volume:</strong></td><td style="padding: 8px 0;">${inquiry.messageVolume}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;"><strong>Agents Needed:</strong></td><td style="padding: 8px 0;">${inquiry.agentsNeeded}</td></tr>
          </table>
          ${featuresList ? `
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
              <strong style="color: #0f172a; display: block; margin-bottom: 8px;">Key Capabilities Requested:</strong>
              <ul style="margin: 0; padding-left: 18px; color: #334155;">${featuresList}</ul>
            </div>
          ` : ''}
          ${inquiry.message ? `
            <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              <strong style="color: #0f172a; display: block; margin-bottom: 6px;">Use Case / Notes:</strong>
              <p style="margin: 0; color: #475569;">${inquiry.message}</p>
            </div>
          ` : ''}
        </div>
        <div style="padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          Messbee Enterprise Lead System • Automated Notification
        </div>
      </div>
    `;

    // Attempt sending to support/admin
    try {
      await transporter.sendMail({
        from: fromAddress,
        to: notifyEmail,
        subject: adminSubject,
        html: adminHtml
      });
      console.log(`✅ Sales inquiry email notification sent to ${notifyEmail}`);
    } catch (adminMailErr) {
      console.warn('Could not send admin lead email:', adminMailErr.message);
    }

    // 2. Send polite acknowledgment to customer
    try {
      const userSubject = `We received your Messbee Enterprise inquiry [${inquiry.inquiryId}]`;
      const firstName = inquiry.fullName ? inquiry.fullName.split(' ')[0] : 'there';
      const userHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 24px; color: white;">
            <h2 style="margin: 0 0 6px 0; font-size: 20px;">Thank You for Reaching Out, ${firstName}!</h2>
            <p style="margin: 0; opacity: 0.9; font-size: 13px;">Inquiry Reference: <strong>${inquiry.inquiryId}</strong></p>
          </div>
          <div style="padding: 24px; color: #334155; font-size: 14px; line-height: 1.6;">
            <p>We have successfully received your inquiry for the <strong>Messbee Corporate & Enterprise Plan</strong> for <strong>${inquiry.company}</strong>.</p>
            <p>Our solutions specialist will review your requirements and get in touch with you within <strong>2 to 4 business hours</strong>.</p>
            <div style="margin: 20px 0; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px 0; font-weight: bold; color: #0f172a;">Need immediate assistance?</p>
              <p style="margin: 0; color: #64748b; font-size: 13px;">Reach our enterprise support desk directly at <a href="mailto:support@messbee.com" style="color: #10B981; font-weight: bold;">support@messbee.com</a> or call <strong>+91 876 543 2109</strong>.</p>
            </div>
            <p style="margin: 0; color: #64748b;">Best regards,<br><strong style="color: #0f172a;">The Messbee Enterprise Team</strong></p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: fromAddress,
        to: inquiry.email,
        subject: userSubject,
        html: userHtml
      });
      console.log(`✅ Sales inquiry acknowledgment sent to ${inquiry.email}`);
    } catch (userMailErr) {
      console.warn('Could not send customer ack email:', userMailErr.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendSalesInquiryEmail:', error.message);
    return { success: false, error: error.message };
  }
};

