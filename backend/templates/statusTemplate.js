const statusTemplate = (order, userName, statusUrl) => {
  let statusColor = "#3b82f6"; // Blue default
  let statusMessage = "Your order status has been updated.";
  
  if (order.orderStatus === "Confirmed") {
    statusColor = "#10b981"; // Green
    statusMessage = "Great news! Your order has been confirmed and is being processed.";
  } else if (order.orderStatus === "Shipped") {
    statusColor = "#f59e0b"; // Orange
    statusMessage = "Your order is on the way! It has been shipped and will be with you soon.";
  } else if (order.orderStatus === "Delivered") {
    statusColor = "#10b981"; // Green
    statusMessage = "Your order has been delivered! We hope you love your new electronics.";
  } else if (order.orderStatus === "Cancelled") {
    statusColor = "#ef4444"; // Red
    statusMessage = "We're sorry, but your order has been cancelled.";
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background-color: ${statusColor}; color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
        .status-badge { display: inline-block; padding: 6px 12px; background-color: ${statusColor}; color: white; border-radius: 9999px; font-weight: bold; font-size: 14px; margin: 15px 0; }
        .button-container { text-align: center; margin: 30px 0; }
        .button { background-color: ${statusColor}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Update</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>${statusMessage}</p>
          
          <div style="text-align: center;">
            <span class="status-badge">Status: ${order.orderStatus}</span>
          </div>
          
          <p>Order ID: <strong>#${order._id}</strong></p>

          <div class="button-container">
            <a href="${statusUrl}" class="button">View Order Details</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ElectroMart. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = statusTemplate;
