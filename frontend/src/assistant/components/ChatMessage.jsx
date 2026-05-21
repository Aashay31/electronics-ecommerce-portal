import QuickActionButtons from "./QuickActionButtons";
import ProductRecommendationCard from "./ProductRecommendationCard";
import OrderSupportCard from "./OrderSupportCard";
import { renderMarkdown } from "../utils/markdown.jsx";

function formatTime(value) {
  return new Date(value || Date.now()).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function ComparisonCard({ comparison }) {
  if (!comparison) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
      <p className="text-sm font-semibold text-white">{comparison.title}</p>
      {comparison.points?.length ? (
        <div className="mt-3 space-y-2">
          {comparison.points.map((point) => (
            <div key={point.label} className="rounded-xl bg-black/20 p-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{point.label}</p>
              <p className="mt-1 text-sm text-slate-200">{point.value}</p>
            </div>
          ))}
        </div>
      ) : null}
      {comparison.timeline?.length ? (
        <div className="mt-3 space-y-2">
          {comparison.timeline.map((step) => (
            <div key={step.status} className="flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  step.state === "completed"
                    ? "bg-emerald-300"
                    : step.state === "current"
                      ? "bg-cyan-300"
                      : "bg-slate-600"
                }`}
              />
              <p className="text-sm text-slate-200">{step.status}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
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

  return additionalCount > 0
    ? `${firstItemName} + ${additionalCount} more`
    : firstItemName;
}

function ChatMessage({ message, onQuickAction, onExploreProduct, activeOrderActionId = "" }) {
  const isUser = message.role === "user";
  const rich = message.richContent || {};
  const orderLabelById = new Map(
    (rich.orders || []).map((order) => [String(order.orderId || ""), getOrderPrimaryLabel(order)])
  );
  const quickActions = (rich.quickActions || []).map((action) =>
    action.action === "select_order" && action.value
      ? {
          ...action,
          label: orderLabelById.get(String(action.value)) || action.label,
        }
      : action
  );

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        {!isUser ? (
          <div className="rounded-[1.75rem] rounded-bl-md border border-white/10 bg-white/[0.07] px-4 py-3 shadow-xl shadow-black/20">
            <div className="space-y-3">{renderMarkdown(message.content)}</div>
            {rich.products?.length ? (
              <div className="mt-4 space-y-3">
                {rich.products.map((product) => (
                  <ProductRecommendationCard
                    key={product.productId || product.productName}
                    product={product}
                    onExplore={onExploreProduct}
                  />
                ))}
              </div>
            ) : null}
            {rich.orders?.length ? (
              <div className="mt-4 space-y-3">
                {rich.orders.map((order) => (
                  <OrderSupportCard
                    key={order.orderId || order.orderNumber}
                    order={order}
                    onAction={onQuickAction}
                    activeOrderActionId={activeOrderActionId}
                  />
                ))}
              </div>
            ) : null}
            {rich.comparison ? (
              <div className="mt-4">
                <ComparisonCard comparison={rich.comparison} />
              </div>
            ) : null}
            <QuickActionButtons actions={quickActions} onAction={onQuickAction} />
          </div>
        ) : (
          <div className="rounded-[1.75rem] rounded-br-md bg-cyan-400 px-4 py-3 text-sm font-medium text-slate-950 shadow-lg shadow-cyan-900/20">
            {message.content}
          </div>
        )}
        <span className="px-1 text-[11px] text-slate-500">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}

export default ChatMessage;
