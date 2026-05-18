const welcomeTemplate = (userName, loginUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background-color: #2563eb; color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
        .content h2 { color: #111827; font-size: 22px; margin-top: 0; }
        .button-container { text-align: center; margin: 30px 0; }
        .button { background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ElectroMart</h1>
        </div>
        <div class="content">
          <h2>Welcome to ElectroMart, ${userName}!</h2>
          <p>We are thrilled to have you join our community. Get ready to discover the best deals on the latest electronics and gadgets.</p>
          <p>Your account has been successfully created. You can now log in to explore our products, track your orders, and enjoy a seamless shopping experience.</p>
          <div class="button-container">
            <a href="${loginUrl}" class="button">Log In to Your Account</a>
          </div>
          <p>If you have any questions or need assistance, our support team is always here to help.</p>
          <p>Happy Shopping,<br>The ElectroMart Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ElectroMart. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = welcomeTemplate;
