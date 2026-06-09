/**
 * Email verification template
 * @param {string} firstName - User's first name
 * @param {string} verificationToken - Email verification token
 * @param {string} backendUrl - Base URL for email verification
 * @returns {string} HTML email template
 */
export const registerEmailTemplate = (firstName, verificationToken, backendUrl) => {
    const verificationLink = `${backendUrl}/api/auth/verify/${verificationToken}`;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Verify Your Email - Safari Books</title>
        <!--[if mso]>
        <style type="text/css">
          body, table, td {font-family: Arial, sans-serif !important;}
        </style>
        <![endif]-->
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.7;
            color: #222;
            background-color: #f6f8fa;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .email-wrapper {
            background-color: #f6f8fa;
            padding: 40px 0;
          }
          .email-container {
            max-width: 480px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
          }
          .header {
            padding: 32px;
            text-align: center;
            background-color: #ffffff;
            border-bottom: 1px solid #e2e8f0;
          }
          .logo-container {
            margin-bottom: 16px;
          }
          .logo-container img {
            width: 60px;
            height: auto;
            display: block;
            margin: 0 auto;
            border-radius: 8px;
          }
          .header-title {
            color: #4A4DFF;
            font-size: 24px;
            font-weight: 600;
            margin: 16px 0 0 0;
            font-family: sans-serif;
          }
          .content {
            padding: 32px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 500;
            color: #222;
            margin-bottom: 8px;
            font-family: sans-serif;
          }
          .message-text {
            font-size: 16px;
            color: #444;
            margin-bottom: 16px;
            line-height: 1.6;
            font-family: sans-serif;
          }
          .highlight-box {
            background-color: #f0f4ff;
            border-left: 4px solid #4A4DFF;
            padding: 20px;
            margin: 30px 0;
            border-radius: 6px;
          }
          .highlight-text {
            font-size: 15px;
            color: #222;
            font-weight: 500;
            line-height: 1.6;
            font-family: sans-serif;
          }
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          .verify-button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #4A4DFF;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 16px;
            letter-spacing: 1px;
            font-family: sans-serif;
            transition: background-color 0.3s ease;
          }
          .verify-button:hover {
            background-color: #3a3dff;
          }
          .expiry-notice {
            text-align: center;
            margin: 25px 0;
            padding: 15px;
            background-color: #fff8e1;
            border-radius: 6px;
            border: 1px solid #ffc107;
          }
          .expiry-text {
            font-size: 14px;
            color: #f57c00;
            font-weight: 500;
            font-family: sans-serif;
          }
          .alternative-section {
            margin-top: 35px;
            padding-top: 25px;
            border-top: 1px solid #e2e8f0;
          }
          .alternative-title {
            font-size: 14px;
            color: #888;
            font-weight: 500;
            margin-bottom: 12px;
            font-family: sans-serif;
          }
          .link-box {
            background-color: #f6f8fa;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 15px;
            margin-top: 15px;
            word-break: break-all;
          }
          .verification-link {
            color: #4A4DFF;
            font-size: 13px;
            font-family: 'Courier New', monospace;
            text-decoration: none;
            line-height: 1.6;
          }
          .footer {
            background-color: #f6f8fa;
            padding: 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer-text {
            font-size: 12px;
            color: #bbb;
            line-height: 1.6;
            margin-bottom: 10px;
            font-family: sans-serif;
          }
          .footer-brand {
            font-size: 14px;
            color: #4A4DFF;
            font-weight: 600;
            margin-top: 15px;
            font-family: sans-serif;
          }
          @media only screen and (max-width: 600px) {
            .email-wrapper {
              padding: 20px 10px;
            }
            .header {
              padding: 24px 20px;
            }
            .content {
              padding: 24px 20px;
            }
            .verify-button {
              padding: 12px 28px;
              font-size: 14px;
            }
            .header-title {
              font-size: 20px;
            }
            .greeting {
              font-size: 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <!-- Header -->
            <div class="header">
              <div class="logo-container">
                <img src="https://safari-books-mobile.s3.ap-south-1.amazonaws.com/Assets/sbLogo.png" 
                     alt="Safari Books Logo" />
              </div>
              <h2 class="header-title">Safari Books</h2>
            </div>
            
            <!-- Content -->
            <div class="content">
              <p class="greeting">Hi ${firstName},</p>
              
              <p class="message-text">You're almost there!<br>Please verify your email address to activate your Safari Books account.</p>
              
              <div class="highlight-box">
                <p class="highlight-text">
                  <strong>🔒 Security Note:</strong> This verification link is unique to your account and will help protect your personal information.
                </p>
              </div>
              
              <div class="button-container">
                <a href="${verificationLink}" class="verify-button">VERIFY YOUR EMAIL</a>
              </div>
              
              <div class="expiry-notice">
                <p class="expiry-text">⏰ This verification link will expire in <strong>48 hours</strong> for security purposes.</p>
              </div>
              
              <div class="alternative-section">
                <p class="alternative-title">Having trouble with the button?</p>
                <p class="message-text" style="font-size: 14px; margin-bottom: 10px;">
                  If the button above doesn't work, copy and paste this link into your browser:
                </p>
                <div class="link-box">
                  <a href="${verificationLink}" class="verification-link">${verificationLink}</a>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p class="footer-text">
                This is an automated message from Safari Books. 
                Please do not reply to this email.
              </p>
              <p class="footer-text">
                If you did not create an account with us, please ignore this email or contact our support team.
              </p>
              <p class="footer-brand">&copy; ${new Date().getFullYear()} Safari Books. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

/**
 * Password reset email template
 * @param {string} name - User's name
 * @param {string} resetCode - 6-digit password reset code
 * @returns {string} HTML email template
 */
export const forgotPasswordEmailTemplate = (name, resetCode) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Safari Books</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.7;
            color: #222;
            background-color: #f6f8fa;
            margin: 0;
            padding: 0;
          }
          .email-wrapper {
            background-color: #f6f8fa;
            padding: 40px 0;
          }
          .email-container {
            max-width: 480px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
          }
          .header {
            background: linear-gradient(135deg, #4A4DFF 0%, #6366F1 100%);
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            font-size: 24px;
            margin: 0;
          }
          .content {
            padding: 32px 24px;
          }
          .content p {
            margin: 0 0 16px 0;
            color: #444;
          }
          .code-box {
            background: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            font-family: monospace;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 6px;
            margin: 24px 0;
            color: #222;
          }
          .footer {
            padding: 24px;
            text-align: center;
            color: #888;
            font-size: 13px;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>We received a request to reset your Safari Books password. This is your reset code:</p>
              <div class="code-box">${resetCode}</div>
              <p>Open the Safari Books app, go to the reset password screen, paste this code, and enter your new password.</p>
              <p>This code expires in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Safari Books. All rights reserved.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
};

/**
 * Welcome email template
 * @param {string} name - User's name
 * @returns {string} HTML email template
 */
export const sendWelcomeEmailTemplate = (name) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Welcome to Safari Books</title>
        <!--[if mso]>
        <style type="text/css">
          body, table, td {font-family: Arial, sans-serif !important;}
        </style>
        <![endif]-->
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.7;
            color: #222;
            background-color: #f6f8fa;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .email-wrapper {
            background-color: #f6f8fa;
            padding: 40px 0;
          }
          .email-container {
            max-width: 480px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
          }
          .header {
            padding: 32px;
            text-align: center;
            background-color: #ffffff;
            border-bottom: 1px solid #e2e8f0;
          }
          .logo-container {
            margin-bottom: 16px;
          }
          .logo-container img {
            width: 60px;
            height: auto;
            display: block;
            margin: 0 auto;
            border-radius: 8px;
          }
          .header-title {
            color: #4A4DFF;
            font-size: 24px;
            font-weight: 600;
            margin: 16px 0 0 0;
            font-family: sans-serif;
          }
          .content {
            padding: 32px;
          }
          .greeting {
            font-size: 20px;
            font-weight: 500;
            color: #222;
            margin-bottom: 16px;
            font-family: sans-serif;
          }
          .message-text {
            font-size: 16px;
            color: #444;
            margin-bottom: 16px;
            line-height: 1.6;
            font-family: sans-serif;
          }
          .features-box {
            background-color: #f0f4ff;
            border-left: 4px solid #4A4DFF;
            padding: 20px;
            margin: 30px 0;
            border-radius: 6px;
          }
          .features-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .features-list li {
            font-size: 15px;
            color: #222;
            font-weight: 500;
            line-height: 1.8;
            font-family: sans-serif;
            padding-left: 24px;
            position: relative;
            margin-bottom: 8px;
          }
          .features-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #4A4DFF;
            font-weight: bold;
            font-size: 18px;
          }
          .footer {
            background-color: #f6f8fa;
            padding: 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer-text {
            font-size: 12px;
            color: #bbb;
            line-height: 1.6;
            margin-bottom: 10px;
            font-family: sans-serif;
          }
          .footer-brand {
            font-size: 14px;
            color: #4A4DFF;
            font-weight: 600;
            margin-top: 15px;
            font-family: sans-serif;
          }
          @media only screen and (max-width: 600px) {
            .email-wrapper {
              padding: 20px 10px;
            }
            .header {
              padding: 24px 20px;
            }
            .content {
              padding: 24px 20px;
            }
            .greeting {
              font-size: 18px;
            }
            .header-title {
              font-size: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <!-- Header -->
            <div class="header">
              <div class="logo-container">
                <img src="https://safari-books-mobile.s3.ap-south-1.amazonaws.com/Assets/sbLogo.png" 
                     alt="Safari Books Logo" />
              </div>
              <h2 class="header-title">Safari Books</h2>
            </div>
            
            <!-- Content -->
            <div class="content">
              <p class="greeting">Welcome, ${name}!</p>
              
              <p class="message-text">
                We're excited to have you join Safari Books.<br>
                With your account, you can sign in, discover audiobooks, and enjoy a world of knowledge and stories.
              </p>
              
              <div class="features-box">
                <ul class="features-list">
                  <li>Access thousands of audiobooks</li>
                  <li>Discover new stories and knowledge</li>
                  <li>Create your personal library</li>
                  <li>Enjoy seamless listening experience</li>
                </ul>
              </div>
              
              <p class="message-text">
                Start exploring and let the adventure begin! 🎧📚
              </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p class="footer-text">
                &copy; ${new Date().getFullYear()} Safari Books. All rights reserved.
              </p>
              <p class="footer-text">
                We use cookies to help provide and enhance our service. By continuing you agree to the use of cookies.
              </p>
              <p class="footer-brand">Safari Books</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

/**
 * Publisher registration / submission confirmation email
 * @param {string} name - Publisher or contact display name
 * @returns {string} HTML email template
 */
export const publisherConfirmationEmailTemplate = () => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>We received your publisher details — Safari Books</title>
        <!--[if mso]>
        <style type="text/css">
          body, table, td {font-family: Arial, sans-serif !important;}
        </style>
        <![endif]-->
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.7;
            color: #222;
            background-color: #f6f8fa;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .email-wrapper {
            background-color: #f6f8fa;
            padding: 40px 0;
          }
          .email-container {
            max-width: 520px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(74, 77, 255, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06);
          }
          .header {
            padding: 36px 32px 28px;
            text-align: center;
            background: linear-gradient(180deg, #f4f5ff 0%, #ffffff 55%);
            border-bottom: 1px solid #e8e9ff;
          }
          .logo-container { margin-bottom: 12px; }
          .logo-container img {
            width: 64px;
            height: auto;
            display: block;
            margin: 0 auto;
            border-radius: 10px;
          }
          .status-row {
            display: inline-block;
            margin-top: 8px;
            margin-bottom: 4px;
          }
          .status-pill {
            display: inline-block;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #047857;
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
            padding: 6px 14px;
            border-radius: 999px;
            font-family: sans-serif;
          }
          .header-title {
            color: #1e1b4b;
            font-size: 22px;
            font-weight: 700;
            margin: 14px 0 0 0;
            font-family: sans-serif;
            letter-spacing: -0.02em;
          }
          .header-sub {
            font-size: 15px;
            color: #64748b;
            margin-top: 8px;
            font-family: sans-serif;
          }
          .content { padding: 32px; }
          .greeting {
            font-size: 19px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 14px;
            font-family: sans-serif;
          }
          .message-text {
            font-size: 16px;
            color: #475569;
            margin-bottom: 16px;
            line-height: 1.65;
            font-family: sans-serif;
          }
          .info-card {
            background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
            border: 1px solid #e0e7ff;
            border-radius: 10px;
            padding: 22px 20px;
            margin: 26px 0;
          }
          .info-card-title {
            font-size: 14px;
            font-weight: 700;
            color: #4A4DFF;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            margin-bottom: 14px;
            font-family: sans-serif;
          }
          .steps-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .steps-list li {
            font-size: 15px;
            color: #334155;
            line-height: 1.65;
            font-family: sans-serif;
            padding-left: 28px;
            position: relative;
            margin-bottom: 12px;
          }
          .steps-list li:last-child { margin-bottom: 0; }
          .steps-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            top: 0.1em;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #4A4DFF;
            color: #ffffff;
            font-size: 11px;
            font-weight: bold;
            line-height: 20px;
            text-align: center;
            font-family: sans-serif;
          }
          .note-box {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 16px 18px;
            border-radius: 0 8px 8px 0;
            margin-top: 24px;
          }
          .note-text {
            font-size: 14px;
            color: #92400e;
            line-height: 1.55;
            font-family: sans-serif;
          }
          .footer {
            background-color: #f8fafc;
            padding: 28px 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer-text {
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.65;
            margin-bottom: 10px;
            font-family: sans-serif;
          }
          .footer-brand {
            font-size: 14px;
            color: #4A4DFF;
            font-weight: 600;
            margin-top: 12px;
            font-family: sans-serif;
          }
          @media only screen and (max-width: 600px) {
            .email-wrapper { padding: 20px 12px; }
            .header { padding: 28px 20px 22px; }
            .content { padding: 24px 20px; }
            .header-title { font-size: 19px; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="header">
              <div class="logo-container">
                <img src="https://safari-books-mobile.s3.ap-south-1.amazonaws.com/Assets/sbLogo.png"
                     alt="Safari Books" width="64" height="64" />
              </div>
              <div class="status-row">
                <span class="status-pill">Received</span>
              </div>
              <h1 class="header-title">Publisher details submitted</h1>
              <p class="header-sub">Thank you for partnering with Safari Books</p>
            </div>

            <div class="content">
              <p class="greeting">Hello</p>
              <p class="message-text">
                We've successfully received your publisher information. Our team will review your submission
                and follow up if anything else is needed.
              </p>
              <p class="message-text">
                You can keep using the app to manage your listings and uploads. If you submitted files or metadata,
                they are attached to your publisher profile.
              </p>

              <div class="info-card">
                <p class="info-card-title">What happens next</p>
                <ul class="steps-list">
                  <li>We review your publisher profile and materials for completeness.</li>
                  <li>You may receive an email if we need clarifications or documents.</li>
                  <li>Once everything looks good, your catalogue can go live according to our process.</li>
                </ul>
              </div>

              <div class="note-box">
                <p class="note-text">
                  <strong>Didn&rsquo;t submit this?</strong> If you received this message by mistake, you can ignore it
                  or contact support so we can help secure your account.
                </p>
              </div>
            </div>

            <div class="footer">
              <p class="footer-text">
                This is an automated message from Safari Books. Please do not reply directly to this email.
              </p>
              <p class="footer-text">
                &copy; ${new Date().getFullYear()} Safari Books. All rights reserved.
              </p>
              <p class="footer-brand">Safari Books</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
};

/**
 * Notify publisher that admin-generated sample audio is ready
 * @param {string} name - User display name
 * @param {string} bookTitle - Book / listing title shown in the app
 * @returns {string} HTML email template
 */
export const sampleAudioReadyEmailTemplate = (name, bookTitle) => {
  const safeTitle =
    typeof bookTitle === 'string' && bookTitle.trim()
      ? bookTitle.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')
      : 'your listing';
  const greetingName =
    typeof name === 'string' && name.trim() && name.trim().toLowerCase() !== 'null'
      ? name.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')
      : 'there';

  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Sample audio ready — Safari Books</title>
        <!--[if mso]>
        <style type="text/css">
          body, table, td {font-family: Arial, sans-serif !important;}
        </style>
        <![endif]-->
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.65;
            color: #222;
            background-color: #f6f8fa;
            -webkit-font-smoothing: antialiased;
          }
          .email-wrapper { background-color: #f6f8fa; padding: 40px 0; }
          .email-container {
            max-width: 520px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(74, 77, 255, 0.1);
          }
          .header {
            padding: 32px;
            text-align: center;
            background: linear-gradient(180deg, #eef0ff 0%, #ffffff 60%);
            border-bottom: 1px solid #e2e8f0;
          }
          .logo-container img {
            width: 60px;
            height: auto;
            display: block;
            margin: 0 auto 12px;
            border-radius: 8px;
          }
          .header-title {
            color: #1e1b4b;
            font-size: 22px;
            font-weight: 700;
            font-family: sans-serif;
          }
          .content { padding: 32px; }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 14px;
            font-family: sans-serif;
          }
          .message-text {
            font-size: 16px;
            color: #475569;
            margin-bottom: 14px;
            font-family: sans-serif;
          }
          .highlight {
            background: #f0f4ff;
            border-left: 4px solid #4A4DFF;
            padding: 16px 18px;
            border-radius: 0 8px 8px 0;
            margin: 22px 0;
            font-size: 15px;
            color: #334155;
            font-family: sans-serif;
          }
          .footer {
            background-color: #f8fafc;
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer-text {
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 8px;
            font-family: sans-serif;
          }
          .footer-brand {
            font-size: 14px;
            color: #4A4DFF;
            font-weight: 600;
            margin-top: 8px;
            font-family: sans-serif;
          }
          @media only screen and (max-width: 600px) {
            .email-wrapper { padding: 20px 12px; }
            .content, .header { padding: 24px 20px; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="header">
              <div class="logo-container">
                <img src="https://safari-books-mobile.s3.ap-south-1.amazonaws.com/Assets/sbLogo.png"
                     alt="Safari Books" width="60" height="60" />
              </div>
              <h1 class="header-title">Your sample audio is ready</h1>
            </div>
            <div class="content">
              <p class="greeting">Hi ${greetingName},</p>
              <p class="message-text">
                The sample narration for <strong>${safeTitle}</strong> has been generated and is available in your
                Safari Books publisher dashboard.
              </p>
              <p class="message-text">
                Open the Safari Books app, go to your publisher home, and open this listing to preview the sample audio.
              </p>
              <div class="highlight">
                If you don&rsquo;t see the update right away, pull to refresh on your publisher screen.
              </div>
              <p class="message-text" style="margin-bottom:0;">
                Thank you for publishing with Safari Books.
              </p>
            </div>
            <div class="footer">
              <p class="footer-text">This is an automated message. Please do not reply to this email.</p>
              <p class="footer-text">&copy; ${new Date().getFullYear()} Safari Books. All rights reserved.</p>
              <p class="footer-brand">Safari Books</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
};

/**
 * Publisher listing approved after admin verification.
 * @param {string} name - Recipient display name
 * @param {string} bookTitle - Book / listing title
 * @returns {string} HTML email template
 */
export const publisherVerificationApprovedEmailTemplate = (name, bookTitle) => {
  const greetingName =
    typeof name === 'string' && name.trim() && name.trim().toLowerCase() !== 'null'
      ? name.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')
      : 'there';
  const rawTitle = typeof bookTitle === 'string' ? bookTitle.trim() : '';
  const safeTitle = rawTitle
    ? rawTitle
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    : 'your listing';

  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your listing is approved — Safari Books</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #0f172a; background: #f1f5f9; margin: 0; padding: 24px 12px; }
          .wrap { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(15,23,42,0.08); }
          .bar { height: 4px; background: linear-gradient(90deg, #059669, #10b981); }
          .inner { padding: 28px 24px; }
          h1 { font-size: 22px; margin: 0 0 12px; color: #0f172a; }
          p { margin: 0 0 14px; color: #334155; font-size: 15px; }
          .title { font-weight: 700; color: #047857; }
          .footer { padding: 16px 24px; background: #f8fafc; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="bar"></div>
          <div class="inner">
            <h1>Great news — you&rsquo;re approved</h1>
            <p>Hi ${greetingName},</p>
            <p>Your publisher application has been verified. <span class="title">${safeTitle}</span> is now live in the Safari Books catalog.</p>
            <p>Open the Safari Books app to see your book on the store and manage your publisher account.</p>
            <p>Thank you for publishing with Safari Books.</p>
          </div>
          <div class="footer">This is an automated message. Please do not reply directly to this email.</div>
        </div>
      </body>
      </html>
    `;
};

/**
 * Publisher verification rejection — admin message is the main body (HTML-escaped).
 * @param {string} name - Recipient display name
 * @param {string} bookTitle - Book / listing title
 * @param {string} messagePlain - Admin explanation (plain text)
 * @returns {string} HTML email template
 */
export const publisherRejectionEmailTemplate = (name, bookTitle, messagePlain) => {
  const greetingName =
    typeof name === 'string' && name.trim() && name.trim().toLowerCase() !== 'null'
      ? name.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')
      : 'there';
  const rawTitle = typeof bookTitle === 'string' ? bookTitle.trim() : '';
  const safeTitle = rawTitle
    ? rawTitle
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    : '';
  const bodyHtml = String(messagePlain || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\r\n|\r|\n/g, '<br/>');

  const supportEmail = 'support@safbooks.com';
  const supportMailto = `mailto:${supportEmail}?subject=${encodeURIComponent('Publisher application — follow-up')}`;
  const appStoreUrl = 'https://apps.apple.com/us/app/safari-books/id6741313582';
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.rise.safaribooks&hl=en';

  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Publisher application update — Safari Books</title>
        <!--[if mso]>
        <style type="text/css">
          body, table, td {font-family: Arial, sans-serif !important;}
        </style>
        <![endif]-->
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.65;
            color: #1e293b;
            background-color: #f1f5f9;
            -webkit-font-smoothing: antialiased;
          }
          .email-wrapper { background-color: #f1f5f9; padding: 36px 16px; }
          .email-container {
            max-width: 540px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0,0,0,0.06);
          }
          .accent-bar {
            height: 4px;
            background: linear-gradient(90deg, #f43f5e 0%, #fb7185 40%, #fda4af 100%);
          }
          .header {
            text-align: center;
            padding: 28px 24px 20px;
            background: linear-gradient(180deg, #fff1f2 0%, #ffffff 72%);
            border-bottom: 1px solid #fecdd3;
          }
          .logo-container img {
            width: 56px;
            height: auto;
            display: block;
            margin: 0 auto 10px;
            border-radius: 10px;
          }
          .badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #be123c;
            background: #ffe4e6;
            border: 1px solid #fda4af;
            padding: 5px 12px;
            border-radius: 999px;
            margin-bottom: 10px;
            font-family: sans-serif;
          }
          .header-title {
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.02em;
            font-family: sans-serif;
          }
          .header-sub {
            font-size: 14px;
            color: #64748b;
            margin-top: 8px;
            font-family: sans-serif;
          }
          .content { padding: 28px 28px 8px; }
          .greeting {
            font-size: 17px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 12px;
            font-family: sans-serif;
          }
          .lead {
            font-size: 15px;
            color: #475569;
            margin-bottom: 20px;
            line-height: 1.6;
            font-family: sans-serif;
          }
          .book-title-box {
            background: #f0f4ff;
            border: 1px solid #c7d2fe;
            border-radius: 10px;
            padding: 14px 16px;
            margin-bottom: 22px;
            font-size: 16px;
            font-weight: 600;
            color: #1e1b4b;
            font-family: sans-serif;
            line-height: 1.45;
          }
          .book-title-box .book-title-muted {
            display: block;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #4A4DFF;
            margin-bottom: 6px;
            font-family: sans-serif;
          }
          .section-label {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #64748b;
            margin-bottom: 10px;
            font-family: sans-serif;
          }
          .message-box {
            background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-left: 4px solid #4A4DFF;
            border-radius: 10px;
            padding: 20px 18px;
            font-size: 15px;
            color: #334155;
            line-height: 1.65;
            font-family: sans-serif;
          }
          .contact-section {
            margin: 28px 0 8px;
            padding: 22px 20px;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }
          .contact-title {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 6px;
            font-family: sans-serif;
          }
          .contact-lead {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 18px;
            line-height: 1.5;
            font-family: sans-serif;
          }
          .contact-row {
            margin-bottom: 18px;
            padding-bottom: 18px;
            border-bottom: 1px solid #e2e8f0;
          }
          .contact-row:last-of-type {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }
          .contact-label {
            font-size: 12px;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            margin-bottom: 6px;
            font-family: sans-serif;
          }
          .contact-value {
            font-size: 15px;
            font-weight: 600;
            font-family: sans-serif;
          }
          a.contact-link {
            color: #4A4DFF;
            text-decoration: none;
            font-weight: 600;
          }
          a.contact-link:hover { text-decoration: underline; }
          .store-links {
            margin-top: 6px;
            font-size: 14px;
            color: #475569;
            line-height: 1.7;
            font-family: sans-serif;
          }
          .store-links a {
            color: #4A4DFF;
            font-weight: 600;
            text-decoration: none;
          }
          .store-links a:hover { text-decoration: underline; }
          .closing {
            font-size: 15px;
            color: #475569;
            margin: 24px 0 4px;
            line-height: 1.6;
            font-family: sans-serif;
          }
          .footer {
            background: #f8fafc;
            padding: 22px 28px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer-text {
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.65;
            margin-bottom: 8px;
            font-family: sans-serif;
          }
          .footer-brand {
            font-size: 14px;
            color: #4A4DFF;
            font-weight: 600;
            margin-top: 4px;
            font-family: sans-serif;
          }
          @media only screen and (max-width: 600px) {
            .email-wrapper { padding: 20px 12px; }
            .content { padding: 22px 18px 6px; }
            .header { padding: 22px 18px 16px; }
            .footer { padding: 18px 16px; }
            .header-title { font-size: 19px; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="accent-bar"></div>
            <div class="header">
              <div class="logo-container">
                <img src="https://safari-books-mobile.s3.ap-south-1.amazonaws.com/Assets/sbLogo.png"
                     alt="Safari Books" width="56" height="56" />
              </div>
              <div class="badge">Application update</div>
              <h1 class="header-title">We couldn&rsquo;t approve this application</h1>
              <p class="header-sub">Publisher verification — Safari Books</p>
            </div>

            <div class="content">
              <p class="greeting">Hi ${greetingName},</p>
              <div class="book-title-box">
                <span class="book-title-muted">Book / listing title</span>
                ${safeTitle || '—'}
              </div>
              <p class="lead">
                Thank you for your interest in Safari Books. After review, we&rsquo;re not able to move forward with your
                publisher application for this listing right now. Please read the note from our team below.
              </p>

              <p class="section-label">Message from our team</p>
              <div class="message-box">${bodyHtml}</div>

              <div class="contact-section">
                <p class="contact-title">How to reach us</p>
                <p class="contact-lead">
                  If anything is unclear or you believe this was sent in error, we&rsquo;re happy to help — use any of the options below.
                </p>

                <div class="contact-row">
                    <p class="contact-label">✉️ Email support</p>
                    <p class="contact-value">
                      <a class="contact-link" href="${supportMailto}">${supportEmail}</a>
                    </p>
                    <p class="contact-lead" style="margin-bottom:0;margin-top:6px;font-size:13px;">
                      We typically reply within a few business days. Please include your account email and publisher name.
                    </p>
                </div>

                <div class="contact-row">
                    <p class="contact-label">📱 Safari Books app</p>
                    <p class="contact-value">In-app help</p>
                    <p class="store-links">
                      Open the app and use <strong>Profile → Support</strong> (or your publisher support screen) to send a message.
                      Don&rsquo;t have the app installed?
                      <a href="${appStoreUrl}">Download on the App&nbsp;Store</a>
                      &nbsp;·&nbsp;
                      <a href="${playStoreUrl}">Get it on Google&nbsp;Play</a>.
                    </p>
                </div>
              </div>

              <p class="closing">
                We appreciate the time you took to apply and wish you the best with your publishing plans.
              </p>
            </div>

            <div class="footer">
              <p class="footer-text">This is an automated message from Safari Books. Replies to this address may not be monitored.</p>
              <p class="footer-text">&copy; ${new Date().getFullYear()} Safari Books. All rights reserved.</p>
              <p class="footer-brand">Safari Books</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
};