/**
 * Low Stock Email Template
 *
 * Professional HTML email matching ElectroMart's existing email design language.
 * Generates a consolidated alert for all low-stock products.
 */

const lowStockTemplate = (products, summary = {}) => {
  const {
    totalScanned = 0,
    lowStockCount = 0,
    criticalCount = 0,
    scanDate = new Date(),
  } = summary;

  const formattedDate = new Date(scanDate).toLocaleString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  const getStatusBadge = (stock, threshold) => {
    if (stock <= 0) {
      return `<span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; background-color: #7F1D1D; color: #FEE2E2; text-transform: uppercase;">Out of Stock</span>`;
    }
    if (stock <= 2) {
      return `<span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; background-color: #DC2626; color: #ffffff; text-transform: uppercase;">⚠ Critical</span>`;
    }
    return `<span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; background-color: #F59E0B; color: #ffffff; text-transform: uppercase;">Low Stock</span>`;
  };

  const productRows = products
    .map(
      (product) => `
    <tr>
      <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #111827;">
        ${product.productName}
      </td>
      <td class="hide-mobile" style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; text-align: center;">
        ${product.category || "—"}
      </td>
      <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 700; color: ${product.stock <= 0 ? "#7F1D1D" : product.stock <= 2 ? "#DC2626" : "#D97706"};">
        ${product.stock}
      </td>
      <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
        ${product.lowStockThreshold}
      </td>
      <td class="hide-mobile" style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${getStatusBadge(product.stock, product.lowStockThreshold)}
      </td>
    </tr>
  `
    )
    .join("");

  const hasCritical = criticalCount > 0;
  const headerBg = hasCritical
    ? "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)"
    : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)";
  const headerTitle = hasCritical
    ? "🚨 Critical Stock Alert"
    : "⚠ Low Stock Alert";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
        .container { max-width: 680px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); }
        .header { background: ${headerBg}; color: #ffffff; padding: 36px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 36px 28px; color: #374151; line-height: 1.6; }
        .summary-grid { display: flex; gap: 12px; margin: 20px 0 28px; }
        .summary-card { flex: 1; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
        .summary-card .label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; margin-bottom: 4px; }
        .summary-card .value { font-size: 24px; font-weight: 800; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { text-align: left; padding: 12px; border-bottom: 2px solid #e5e7eb; color: #111827; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
        th:not(:first-child) { text-align: center; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; line-height: 1.8; }
        @media only screen and (max-width: 600px) {
          .container { margin: 0; border-radius: 0; }
          .content { padding: 24px 16px; }
          table { font-size: 13px; }
          td, th { padding: 10px 6px !important; }
          .stat-col { display: block !important; width: 100% !important; box-sizing: border-box !important; padding-bottom: 12px !important; }
          .hide-mobile { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${headerTitle}</h1>
          <p>Automated Inventory Monitoring — ElectroMart</p>
        </div>
        <div class="content">
          <p style="margin-top: 0; color: #6b7280; font-size: 13px;">
            📅 ${formattedDate}
          </p>

          <!--[if mso]>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="33%" valign="top"><![endif]-->
          <div style="margin: 20px 0 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td class="stat-col" style="padding: 4px;">
                  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center;">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; margin-bottom: 4px;">Products Scanned</div>
                    <div style="font-size: 24px; font-weight: 800; color: #2563EB;">${totalScanned}</div>
                  </div>
                </td>
                <td class="stat-col" style="padding: 4px;">
                  <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 16px; text-align: center;">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #92400E; margin-bottom: 4px;">Low Stock</div>
                    <div style="font-size: 24px; font-weight: 800; color: #D97706;">${lowStockCount}</div>
                  </div>
                </td>
                <td class="stat-col" style="padding: 4px;">
                  <div style="background-color: ${criticalCount > 0 ? "#FEF2F2" : "#f9fafb"}; border: 1px solid ${criticalCount > 0 ? "#FECACA" : "#e5e7eb"}; border-radius: 8px; padding: 16px; text-align: center;">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${criticalCount > 0 ? "#991B1B" : "#9ca3af"}; margin-bottom: 4px;">Critical</div>
                    <div style="font-size: 24px; font-weight: 800; color: ${criticalCount > 0 ? "#DC2626" : "#374151"};">${criticalCount}</div>
                  </div>
                </td>
              </tr>
            </table>
          </div>
          <!--[if mso]></td></tr></table><![endif]-->

          <h3 style="margin: 0 0 4px; color: #111827; font-size: 16px;">Products Requiring Attention</h3>
          <p style="margin: 0 0 16px; color: #9ca3af; font-size: 13px;">The following products have fallen below their restocking threshold.</p>

          <div style="overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
            <table>
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th>Product</th>
                  <th class="hide-mobile">Category</th>
                  <th>Stock</th>
                  <th>Threshold</th>
                  <th class="hide-mobile">Status</th>
                </tr>
              </thead>
              <tbody>
                ${productRows}
              </tbody>
            </table>
          </div>

          ${
            hasCritical
              ? `
          <div style="margin-top: 24px; padding: 16px; background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; border-left: 4px solid #DC2626;">
            <p style="margin: 0; font-size: 13px; color: #991B1B; font-weight: 600;">
              🚨 ${criticalCount} product(s) are at CRITICAL stock levels (≤ 2 units). Immediate restocking is recommended.
            </p>
          </div>
          `
              : ""
          }
        </div>
        <div class="footer">
          <p style="margin: 0;">This is an automated inventory monitoring notification.</p>
          <p style="margin: 4px 0 0;">&copy; ${new Date().getFullYear()} ElectroMart. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = lowStockTemplate;
