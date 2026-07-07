const cron = require("node-cron");
const { runLowStockScan, runDailySummary } = require("./inventoryCron");

/**
 * Cron Scheduler
 *
 * Orchestrates all background cron jobs.
 * Schedules are configurable via .env — no code changes needed.
 */
const startCronJobs = () => {
  // ─── Inventory Low Stock Monitor ──────────────────────────────────
  const inventorySchedule =
    process.env.CRON_INVENTORY_SCHEDULE || "*/1 * * * *";

  if (!cron.validate(inventorySchedule)) {
    console.error(
      `[CronScheduler] ❌ Invalid CRON_INVENTORY_SCHEDULE: "${inventorySchedule}". Falling back to every minute.`
    );
  }

  const validInventorySchedule = cron.validate(inventorySchedule)
    ? inventorySchedule
    : "*/1 * * * *";

  cron.schedule(validInventorySchedule, () => {
    runLowStockScan();
  });

  console.log(
    `[CronScheduler] ✅ Inventory monitor scheduled: "${validInventorySchedule}"`
  );

  // ─── Daily Inventory Summary ──────────────────────────────────────
  const dailySummarySchedule =
    process.env.CRON_DAILY_SUMMARY_SCHEDULE || "0 9 * * *";

  if (!cron.validate(dailySummarySchedule)) {
    console.error(
      `[CronScheduler] ❌ Invalid CRON_DAILY_SUMMARY_SCHEDULE: "${dailySummarySchedule}". Falling back to 9 AM daily.`
    );
  }

  const validDailySchedule = cron.validate(dailySummarySchedule)
    ? dailySummarySchedule
    : "0 9 * * *";

  cron.schedule(validDailySchedule, () => {
    runDailySummary();
  });

  console.log(
    `[CronScheduler] ✅ Daily summary scheduled: "${validDailySchedule}"`
  );

  console.log("[CronScheduler] All cron jobs initialized successfully.");
};

module.exports = { startCronJobs };
