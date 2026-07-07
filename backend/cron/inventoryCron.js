const Product = require("../models/Product");
const sendEmail = require("../utils/sendEmail");
const lowStockTemplate = require("../templates/lowStockTemplate");
const dailySummaryTemplate = require("../templates/dailySummaryTemplate");
const {
  checkLowStockProducts,
  getCriticalStockProducts,
  markProductsNotified,
  getAdminEmails,
  getInventoryStats,
} = require("../services/inventoryMonitorService");

/**
 * Inventory Cron Job Handler
 *
 * Scans inventory for low-stock products and sends consolidated
 * email notifications to all admin users. Never throws — all
 * errors are caught and logged to prevent server crashes.
 */

// ─── Low Stock Scan ───────────────────────────────────────────────────
const runLowStockScan = async () => {
  const startTime = Date.now();
  console.log("[InventoryCron] ─── Low stock scan started ───");

  try {
    // 1. Get total product count for summary
    const totalProducts = await Product.countDocuments();
    console.log(`[InventoryCron] Total products in database: ${totalProducts}`);

    // 2. Find products needing notification
    const lowStockProducts = await checkLowStockProducts();
    console.log(
      `[InventoryCron] Low stock products found: ${lowStockProducts.length}`
    );

    if (lowStockProducts.length === 0) {
      console.log(
        "[InventoryCron] No low stock products requiring notification."
      );
      console.log(
        `[InventoryCron] ─── Scan completed in ${Date.now() - startTime}ms ───`
      );
      return;
    }

    // 3. Check for critical stock items (stock <= 2)
    const criticalProducts = lowStockProducts.filter((p) => p.stock <= 2);
    console.log(
      `[InventoryCron] Critical stock products (≤2): ${criticalProducts.length}`
    );

    // 4. Get all admin emails
    const admins = await getAdminEmails();
    if (admins.length === 0) {
      console.warn(
        "[InventoryCron] No admin emails found. Skipping notification."
      );
      console.log(
        `[InventoryCron] ─── Scan completed in ${Date.now() - startTime}ms ───`
      );
      return;
    }

    const adminEmails = admins.map((a) => a.email).join(", ");
    console.log(
      `[InventoryCron] Sending notification to ${admins.length} admin(s): ${adminEmails}`
    );

    // 5. Generate consolidated email
    const summary = {
      totalScanned: totalProducts,
      lowStockCount: lowStockProducts.length,
      criticalCount: criticalProducts.length,
      scanDate: new Date(),
    };

    const html = lowStockTemplate(lowStockProducts, summary);
    const subject =
      criticalProducts.length > 0
        ? `🚨 CRITICAL: Low Stock Inventory Alert — ${lowStockProducts.length} product(s) — ElectroMart`
        : `⚠ Low Stock Inventory Alert — ${lowStockProducts.length} product(s) — ElectroMart`;

    // 6. Send ONE consolidated email to all admins
    try {
      await sendEmail({
        email: adminEmails,
        subject,
        html,
      });
      console.log(
        `[InventoryCron] ✅ Email sent successfully to ${admins.length} admin(s)`
      );
    } catch (emailError) {
      console.error(
        "[InventoryCron] ❌ Failed to send email:",
        emailError.message
      );
      // Don't throw — cron must continue running
      console.log(
        `[InventoryCron] ─── Scan completed with email error in ${Date.now() - startTime}ms ───`
      );
      return;
    }

    // 7. Mark products as notified (only after successful email)
    const productIds = lowStockProducts.map((p) => p._id);
    await markProductsNotified(productIds);
    console.log(
      `[InventoryCron] Marked ${productIds.length} products as notified`
    );

    console.log(
      `[InventoryCron] ─── Scan completed successfully in ${Date.now() - startTime}ms ───`
    );
  } catch (error) {
    console.error("[InventoryCron] ❌ Unexpected error during scan:", error);
    console.log(
      `[InventoryCron] ─── Scan completed with error in ${Date.now() - startTime}ms ───`
    );
    // Never throw — server must stay alive
  }
};

// ─── Daily Inventory Summary ──────────────────────────────────────────
const runDailySummary = async () => {
  console.log("[InventoryCron] ─── Daily summary started ───");

  try {
    const stats = await getInventoryStats();
    stats.scanDate = new Date();

    // Only send if there are any products in the system
    if (stats.totalProducts === 0) {
      console.log("[InventoryCron] No products in database. Skipping summary.");
      return;
    }

    const admins = await getAdminEmails();
    if (admins.length === 0) {
      console.warn(
        "[InventoryCron] No admin emails found. Skipping daily summary."
      );
      return;
    }

    const adminEmails = admins.map((a) => a.email).join(", ");
    const html = dailySummaryTemplate(stats);
    const subject = `📊 Daily Inventory Summary — Health: ${stats.inventoryHealth}% — ElectroMart`;

    await sendEmail({
      email: adminEmails,
      subject,
      html,
    });

    console.log(
      `[InventoryCron] ✅ Daily summary sent to ${admins.length} admin(s)`
    );
  } catch (error) {
    console.error(
      "[InventoryCron] ❌ Failed to send daily summary:",
      error.message
    );
    // Never throw
  }
};

module.exports = {
  runLowStockScan,
  runDailySummary,
};
