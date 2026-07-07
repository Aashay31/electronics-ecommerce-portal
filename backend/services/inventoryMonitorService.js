const Product = require("../models/Product");
const User = require("../models/User");

/**
 * Inventory Monitor Service
 *
 * Core business logic for inventory monitoring.
 * Separated from cron triggers for testability and reusability.
 */

// ─── Check Low Stock Products ─────────────────────────────────────────
// Finds products where stock <= lowStockThreshold AND notification not yet sent.
// Uses $expr for cross-field comparison and lean() for performance.
const checkLowStockProducts = async () => {
  const products = await Product.find({
    $expr: { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 5] }] },
    lowStockNotificationSent: { $ne: true },
  })
    .select("productName category stock lowStockThreshold imageUrl price")
    .lean();

  return products;
};

// ─── Get Critical Stock Products ──────────────────────────────────────
// Products with stock <= 2 — used for HIGH PRIORITY email alerts.
const getCriticalStockProducts = async () => {
  const products = await Product.find({
    stock: { $lte: 2 },
  })
    .select("productName category stock lowStockThreshold imageUrl price")
    .lean();

  return products;
};

// ─── Mark Products as Notified ────────────────────────────────────────
// Bulk update to prevent duplicate notifications.
const markProductsNotified = async (productIds) => {
  if (!productIds || productIds.length === 0) return;

  await Product.updateMany(
    { _id: { $in: productIds } },
    {
      $set: {
        lowStockNotificationSent: true,
        lastLowStockNotificationAt: new Date(),
      },
    }
  );
};

// ─── Reset Notification Flag ──────────────────────────────────────────
// Called when admin restocks a product above its threshold.
const resetNotificationFlag = async (productId, newStock, threshold) => {
  if (newStock > threshold) {
    await Product.findByIdAndUpdate(productId, {
      lowStockNotificationSent: false,
      lastLowStockNotificationAt: null,
    });
    return true;
  }
  return false;
};

// ─── Get All Admin Emails ─────────────────────────────────────────────
// Dynamically fetches all admin users — future admins auto-included.
const getAdminEmails = async () => {
  const admins = await User.find({ role: "admin" })
    .select("email fullName")
    .lean();

  // Also include ADMIN_EMAIL from .env as fallback
  const envEmail = process.env.ADMIN_EMAIL;
  if (envEmail && !admins.some((a) => a.email === envEmail)) {
    admins.push({ email: envEmail, fullName: "Admin" });
  }

  return admins;
};

// ─── Get Inventory Stats (for Dashboard API) ──────────────────────────
const getInventoryStats = async () => {
  const defaultThreshold =
    Number(process.env.LOW_STOCK_DEFAULT_THRESHOLD) || 5;

  const [
    totalProducts,
    outOfStockCount,
    lowStockProducts,
    criticalStockCount,
    nearThresholdProducts,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ stock: { $lte: 0 } }),
    Product.find({
      $expr: { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 5] }] },
      stock: { $gt: 0 },
    })
      .select(
        "productName category stock lowStockThreshold imageUrl price lowStockNotificationSent lastLowStockNotificationAt"
      )
      .sort({ stock: 1 })
      .lean(),
    Product.countDocuments({ stock: { $lte: 2, $gt: 0 } }),
    // Near threshold: stock is within 2 units above the threshold
    Product.find({
      $expr: {
        $and: [
          { $gt: ["$stock", { $ifNull: ["$lowStockThreshold", 5] }] },
          {
            $lte: ["$stock", { $add: [{ $ifNull: ["$lowStockThreshold", 5] }, 2] }],
          },
        ],
      },
    })
      .select("productName category stock lowStockThreshold imageUrl price")
      .sort({ stock: 1 })
      .limit(10)
      .lean(),
  ]);

  const outOfStockProducts = await Product.find({ stock: { $lte: 0 } })
    .select("productName category stock lowStockThreshold imageUrl price")
    .sort({ stock: 1 })
    .lean();

  const wellStockedCount =
    totalProducts - outOfStockCount - lowStockProducts.length;
  const inventoryHealth =
    totalProducts > 0
      ? Math.round((wellStockedCount / totalProducts) * 100)
      : 100;

  // Most frequently low stock: products that have been notified most recently
  const frequentlyLowStock = await Product.find({
    lastLowStockNotificationAt: { $ne: null },
  })
    .select("productName category stock lowStockThreshold lastLowStockNotificationAt")
    .sort({ lastLowStockNotificationAt: -1 })
    .limit(5)
    .lean();

  return {
    totalProducts,
    outOfStockCount,
    lowStockCount: lowStockProducts.length,
    criticalStockCount,
    inventoryHealth,
    lowStockProducts,
    outOfStockProducts,
    nearThresholdProducts,
    frequentlyLowStock,
  };
};

module.exports = {
  checkLowStockProducts,
  getCriticalStockProducts,
  markProductsNotified,
  resetNotificationFlag,
  getAdminEmails,
  getInventoryStats,
};
