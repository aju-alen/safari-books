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