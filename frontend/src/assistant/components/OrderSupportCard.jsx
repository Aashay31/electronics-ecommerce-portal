function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusTone(status) {
  switch (status) {
    case "Delivered":
      return "bg-emerald-400/15 text-emerald-100";
    case "Cancelled":
      return "bg-rose-400/15 text-rose-100";
    case "Shipped":
      return "bg-sky-400/15 text-sky-100";
    default:
      return "bg-amber-400/15 text-amber-100";
  }
}

function getProductNameFromItem(item) {
  return (
    item?.name ||
    item?.productName ||
    item?.title ||
    item?.product?.name ||
    item?.product?.productName ||
    ""
  );
}

function getOrderPrimaryLabel(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const firstItemName = getProductNameFromItem(items[0]);

  if (!firstItemName) {
    return order?.orderNumber || "Order";
  }

  const additionalCount =
    items.length > 1
      ? items.length - 1
      : Number(order?.itemCount) > 1
        ? Number(order.itemCount) - 1
        : 0;

  return additionalCount > 0 ? `${firstItemName} + ${additionalCount} more` : firstItemName;
}

function getActionClasses(variant) {
  switch (variant) {
    case "primary":
      return "border-cyan-400/40 bg-cyan-400/15 text-cyan-100 hover:bg-cyan-400/25";
    case "danger":
      return "border-rose-400/40 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20";
    default:
      return "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10";
  }
}

function OrderSupportCard({ order, onAction, activeOrderActionId = "" }) {
  const primaryLabel = getOrderPrimaryLabel(order);
  const cancellation = order.cancellation || null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm transition duration-300 hover:bg-white/[0.08]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{primaryLabel}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">{order.orderNumber}</p>
          <p className="mt-1 text-xs text-slate-300">
            {order.itemCount} item{order.itemCount === 1 ? "" : "s"} | Rs. {order.totalAmount}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusTone(order.orderStatus)}`}>
          {order.orderStatus}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
        <div className="rounded-xl bg-black/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Payment</p>
          <p className="mt-1 font-medium text-white">{order.paymentMethod}</p>
          <p className="mt-1 text-[11px] text-slate-400">{order.paymentStatus}</p>
        </div>
        <div className="rounded-xl bg-black/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">ETA</p>
          <p className="mt-1 font-medium text-white">{formatDate(order.estimatedDelivery)}</p>
        </div>
      </div>

      {cancellation?.detailMessage ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Cancellation</p>
          <p className="mt-1 text-xs leading-5 text-slate-200">{cancellation.detailMessage}</p>
        </div>
      ) : null}

      {order.actions?.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {order.actions.map((action) => {
            const actionKey = `${action.action}-${action.value || action.label}`;
            const isBusy = activeOrderActionId === actionKey;

            return (
              <button
                key={actionKey}
                type="button"
                onClick={() => onAction(action)}
                disabled={Boolean(activeOrderActionId)}
                className={`rounded-full border px-3 py-2 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${getActionClasses(action.variant)}`}
              >
                {isBusy ? "Working..." : action.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default OrderSupportCard;
