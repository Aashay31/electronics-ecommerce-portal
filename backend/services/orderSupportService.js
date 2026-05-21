const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const STATUS_EXPLANATIONS = {
  Pending: "Your order has been placed and is awaiting confirmation.",
  Confirmed: "Your order is confirmed and queued for fulfillment.",
  Processing: "Our team is preparing and packing your order.",
  Shipped: "Your package is on the way and should arrive soon.",
  Delivered: "The order has been delivered successfully.",
  Cancelled: "This order has been cancelled and will not be fulfilled.",
};

const PREPAID_METHODS = new Set(["UPI", "Razorpay", "Card", "Netbanking", "Wallet"]);

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function normalizeText(input = "") {
  return String(input)
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeOrderNumber(order) {
  const raw = order?._id?.toString?.() || "000000";
  return `EM-${raw.slice(-6).toUpperCase()}`;
}

function toOrderItemSnapshot(item) {
  return {
    quantity: item?.quantity || 0,
    name: item?.product?.productName || item?.productName || item?.name || "",
    productName: item?.product?.productName || item?.productName || item?.name || "",
    product: item?.product
      ? {
          _id: item.product._id,
          productName: item.product.productName || "",
        }
      : null,
  };
}

function getOrderDisplayLabel(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const firstName =
    items[0]?.product?.productName || items[0]?.productName || items[0]?.name || "";

  if (!firstName) {
    return makeOrderNumber(order);
  }

  const itemCount =
    items.length > 0
      ? items.length
      : (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  const extraCount = Math.max(itemCount - 1, 0);

  return extraCount > 0 ? `${firstName} + ${extraCount} more` : firstName;
}

function assessCancellationEligibility(order) {
  if (!order) {
    return {
      eligible: false,
      code: "order_not_found",
      shortMessage: "I couldn't find that order on your account.",
      detailMessage: "I couldn't find that order on your account. Please choose one of your recent orders.",
      recommendedAction: "track_order",
    };
  }

  if (order.orderStatus === "Cancelled") {
    return {
      eligible: false,
      code: "already_cancelled",
      shortMessage: "This order is already cancelled.",
      detailMessage: "This order is already cancelled, so there is nothing else to cancel.",
      recommendedAction: "view_order_details",
    };
  }

  if (order.orderStatus === "Delivered") {
    return {
      eligible: false,
      code: "delivered_locked",
      shortMessage: "Delivered orders can't be cancelled.",
      detailMessage: "Delivered orders can't be cancelled through the website. If you still need help, please contact support.",
      recommendedAction: "contact_support",
    };
  }

  if (order.orderStatus === "Shipped") {
    return {
      eligible: false,
      code: "shipped_locked",
      shortMessage: "Shipped orders can't be cancelled.",
      detailMessage: "This order has already shipped, so cancellation is no longer available. You can track it or contact support for the next best option.",
      recommendedAction: "contact_support",
    };
  }

  const isCod = order.paymentMethod === "Cash on Delivery";
  const isPrepaid = PREPAID_METHODS.has(order.paymentMethod);

  if (!isCod || isPrepaid) {
    return {
      eligible: false,
      code: "prepaid_not_cancellable",
      shortMessage: "Paid online orders cannot be cancelled directly.",
      detailMessage: "Paid online orders cannot be cancelled through the website. Only Cash on Delivery orders that have not been shipped or delivered can be cancelled.",
      recommendedAction: "contact_support",
    };
  }

  return {
    eligible: true,
    code: "cod_cancellable",
    shortMessage: "This COD order is eligible for cancellation.",
    detailMessage: "This COD order is eligible for cancellation because it has not shipped yet.",
    recommendedAction: "cancel_order",
  };
}

function canCancelOrder(order) {
  return assessCancellationEligibility(order).eligible;
}

function getDeliveryTimeline(order) {
  const currentIndex = Math.max(ORDER_STATUSES.indexOf(order.orderStatus), 0);
  return ORDER_STATUSES.map((status, index) => ({
    status,
    state:
      index < currentIndex
        ? "completed"
        : index === currentIndex
          ? "current"
          : "upcoming",
  }));
}

function buildOrderActions(order) {
  const assessment = assessCancellationEligibility(order);
  const actions = [
    { label: "Track Order", action: "select_order", value: String(order._id), variant: "primary" },
    { label: "View Details", action: "view_order_details", value: String(order._id), variant: "secondary" },
  ];

  if (assessment.eligible) {
    actions.push({
      label: "Cancel Order",
      action: "cancel_order",
      value: String(order._id),
      variant: "danger",
    });
  }

  actions.push({
    label: "Contact Support",
    action: "contact_support",
    value: String(order._id),
    variant: "secondary",
  });

  return actions;
}

function toOrderSnapshot(order) {
  const assessment = assessCancellationEligibility(order);
  return {
    orderId: order._id,
    orderNumber: makeOrderNumber(order),
    displayLabel: getOrderDisplayLabel(order),
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    totalAmount: order.totalAmount,
    estimatedDelivery: order.estimatedDelivery,
    createdAt: order.createdAt,
    itemCount: (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0),
    canCancel: assessment.eligible,
    cancellation: assessment,
    actions: buildOrderActions(order),
    items: (order.items || []).map(toOrderItemSnapshot),
  };
}

function extractOrderReference(message = "") {
  const orderNumberMatch = String(message).match(/\bEM-([A-Z0-9]{4,})\b/i);
  if (orderNumberMatch) {
    return { type: "orderNumber", value: `EM-${orderNumberMatch[1].toUpperCase()}` };
  }

  const objectIdMatch = String(message).match(/\b[a-f0-9]{24}\b/i);
  if (objectIdMatch) {
    return { type: "orderId", value: objectIdMatch[0] };
  }

  return null;
}

function resolveOrderSelection({ message = "", selectedOrderId = "", session, candidateOrders = [] }) {
  if (!candidateOrders.length) {
    return null;
  }

  if (selectedOrderId) {
    return (
      candidateOrders.find((order) => String(order._id) === String(selectedOrderId)) || null
    );
  }

  const reference = extractOrderReference(message);
  if (reference?.type === "orderId") {
    const matched = candidateOrders.find((order) => String(order._id) === reference.value);
    if (matched) {
      return matched;
    }
  }

  if (reference?.type === "orderNumber") {
    const matched = candidateOrders.find((order) => makeOrderNumber(order) === reference.value);
    if (matched) {
      return matched;
    }
  }

  const normalized = normalizeText(message);
  const contextOrderId = session?.context?.activeOrderId;
  const referencesPreviousOrder =
    /\b(it|this|that|this order|that order|the latest one|the last one|latest order|last order)\b/.test(
      normalized
    );

  if (referencesPreviousOrder && contextOrderId) {
    const matched = candidateOrders.find((order) => String(order._id) === String(contextOrderId));
    if (matched) {
      return matched;
    }
  }

  if (/\b(latest|recent|newest|last)\b/.test(normalized)) {
    return candidateOrders[0] || null;
  }

  if (candidateOrders.length === 1) {
    return candidateOrders[0];
  }

  return null;
}

function buildConversationWindow(messages = [], limit = 10) {
  return messages.slice(-limit).map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

function deriveSessionTitle(messages = []) {
  const firstUserMessage = messages.find((message) => message.role === "user" && message.content?.trim());
  if (!firstUserMessage) {
    return "ElectroMart Support";
  }

  return firstUserMessage.content.trim().slice(0, 60);
}

module.exports = {
  ORDER_STATUSES,
  STATUS_EXPLANATIONS,
  PREPAID_METHODS,
  formatCurrency,
  normalizeText,
  makeOrderNumber,
  toOrderItemSnapshot,
  getOrderDisplayLabel,
  assessCancellationEligibility,
  canCancelOrder,
  getDeliveryTimeline,
  buildOrderActions,
  toOrderSnapshot,
  resolveOrderSelection,
  buildConversationWindow,
  deriveSessionTitle,
};
