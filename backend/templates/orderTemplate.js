const orderTemplate = (order, userName, orderUrl) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.product.productName}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price.toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background-color: #10b981; color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
        .order-summary { background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { text-align: left; padding: 12px; border-bottom: 2px solid #e5e7eb; color: #111827; }
        .total-row td { font-weight: 700; border-top: 2px solid #e5e7eb; padding-top: 15px; }
        .button-container { text-align: center; margin: 30px 0; }
        .button { background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>Thank you for your purchase! We've received your order <strong>#${order._id}</strong> and are getting it ready for shipment.</p>
          
          <div class="order-summary">
            <h3 style="margin-top: 0; color: #111827;">Order Summary</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="2" style="text-align: right; padding-right: 15px;">Total Amount:</td>
                  <td style="text-align: right;">₹${order.totalAmount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h4 style="margin-bottom: 5px;">Shipping Address:</h4>
            <p style="margin-top: 0; color: #4b5563;">
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}<br>
              ${order.shippingAddress.country}
            </p>
          </div>

          <div class="button-container">
            <a href="${orderUrl}" class="button">Track Your Order</a>
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

module.exports = orderTemplate;
