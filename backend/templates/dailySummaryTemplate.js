/**
 * Daily Inventory Summary Email Template
 *
 * Provides a comprehensive daily inventory health overview to admins.
 */

const dailySummaryTemplate = (stats) => {
  const {
    totalProducts = 0,
    outOfStockCount = 0,
    lowStockCount = 0,
    criticalStockCount = 0,
    inventoryHealth = 100,
    lowStockProducts = [],
    outOfStockProducts = [],
    scanDate = new Date(),
  } = stats;

  const formattedDate = new Date(scanDate).toLocaleString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  const healthColor =
    inventoryHealth >= 80
      ? "#16A34A"
      : inventoryHealth >= 50
        ? "#D97706"
        : "#DC2626";
  const healthBg =
    inventoryHealth >= 80
      ? "#F0FDF4"
      : inventoryHealth >= 50
        ? "#FFFBEB"
        : "#FEF2F2";
  const healthBorder =
    inventoryHealth >= 80
      ? "#BBF7D0"
      : inventoryHealth >= 50
        ? "#FDE68A"
        : "#FECACA";
  const healthLabel =
    inventoryHealth >= 80
      ? "Healthy"
      : inventoryHealth >= 50
        ? "Attention Needed"
        : "Critical";

  const issueRows = [...outOfStockProducts, ...lowStockProducts]
    .slice(0, 15)
    .map(
      (p) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #111827; font-size: 13px;">
        ${p.productName}
      </td>
      <td class="hide-mobile" style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; text-align: center; font-size: 13px;">
        ${p.category || "—"}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 700; font-size: 13px; color: ${p.stock <= 0 ? "#7F1D1D" : p.stock <= 2 ? "#DC2626" : "#D97706"};">
        ${p.stock}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 13px; color: #6b7280;">
        ${p.lowStockThreshold}
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
        .container { max-width: 680px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); }
        .header { background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: #ffffff; padding: 36px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 36px 28px; color: #374151; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 10px 12px; border-bottom: 2px solid #e5e7eb; color: #111827; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
        th:not(:first-child) { text-align: center; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; line-height: 1.8; }
        @media only screen and (max-width: 600px) {
          .container { margin: 0; border-radius: 0; }
          .content { padding: 24px 16px; }
          .stat-col { display: block !important; width: 100% !important; box-sizing: border-box !important; padding-bottom: 12px !important; }
          .hide-mobile { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Daily Inventory Summary</h1>
          <p>${formattedDate}</p>
        </div>
        <div class="content">
          <!-- Health Score -->
          <div style="background-color: ${healthBg}; border: 1px solid ${healthBorder}; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${healthColor}; margin-bottom: 8px;">Inventory Health</div>
            <div style="font-size: 48px; font-weight: 900; color: ${healthColor}; line-height: 1;">${inventoryHealth}%</div>
            <div style="font-size: 13px; font-weight: 600; color: ${healthColor}; margin-top: 4px;">${healthLabel}</div>
            <!-- Progress bar -->
            <div style="margin-top: 16px; background-color: #e5e7eb; border-radius: 8px; height: 8px; overflow: hidden;">
              <div style="width: ${inventoryHealth}%; background-color: ${healthColor}; height: 100%; border-radius: 8px;"></div>
            </div>
          </div>

          <!-- Stats Grid -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
            <tr>
              <td class="stat-col" style="padding: 4px; width: 25%;">
                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; text-align: center;">
                  <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af;">Total</div>
                  <div style="font-size: 22px; font-weight: 800; color: #2563EB; margin-top: 2px;">${totalProducts}</div>
                </div>
              </td>
              <td class="stat-col" style="padding: 4px; width: 25%;">
                <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 14px; text-align: center;">
                  <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #92400E;">Low Stock</div>
                  <div style="font-size: 22px; font-weight: 800; color: #D97706; margin-top: 2px;">${lowStockCount}</div>
                </div>
              </td>
              <td class="stat-col" style="padding: 4px; width: 25%;">
                <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 14px; text-align: center;">
                  <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #991B1B;">Out of Stock</div>
                  <div style="font-size: 22px; font-weight: 800; color: #DC2626; margin-top: 2px;">${outOfStockCount}</div>
                </div>
              </td>
              <td class="stat-col" style="padding: 4px; width: 25%;">
                <div style="background-color: ${criticalStockCount > 0 ? "#FEF2F2" : "#f9fafb"}; border: 1px solid ${criticalStockCount > 0 ? "#FECACA" : "#e5e7eb"}; border-radius: 8px; padding: 14px; text-align: center;">
                  <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${criticalStockCount > 0 ? "#991B1B" : "#9ca3af"};">Critical</div>
                  <div style="font-size: 22px; font-weight: 800; color: ${criticalStockCount > 0 ? "#DC2626" : "#374151"}; margin-top: 2px;">${criticalStockCount}</div>
                </div>
              </td>
            </tr>
          </table>

          ${
            issueRows
              ? `
          <h3 style="margin: 0 0 4px; color: #111827; font-size: 15px;">Products Requiring Attention</h3>
          <p style="margin: 0 0 12px; color: #9ca3af; font-size: 12px;">Showing up to 15 products with stock issues.</p>
          <div style="overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
            <table>
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th>Product</th>
                  <th class="hide-mobile">Category</th>
                  <th>Stock</th>
                  <th>Threshold</th>
                </tr>
              </thead>
              <tbody>
                ${issueRows}
              </tbody>
            </table>
          </div>
          `
              : `
          <div style="text-align: center; padding: 24px; color: #16A34A;">
            <p style="font-size: 32px; margin: 0;">✅</p>
            <p style="font-size: 14px; font-weight: 600; margin: 8px 0 0;">All products are well-stocked!</p>
          </div>
          `
          }
        </div>
        <div class="footer">
          <p style="margin: 0;">This is an automated daily inventory summary.</p>
          <p style="margin: 4px 0 0;">&copy; ${new Date().getFullYear()} ElectroMart. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = dailySummaryTemplate;
