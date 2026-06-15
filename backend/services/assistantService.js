const Groq = require("groq-sdk");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const {
  STATUS_EXPLANATIONS,
  formatCurrency,
  normalizeText,
  makeOrderNumber,
  getOrderDisplayLabel,
  assessCancellationEligibility,
  canCancelOrder,
  getDeliveryTimeline,
  buildOrderActions,
  toOrderSnapshot,
  resolveOrderSelection,
  buildConversationWindow,
} = require("./orderSupportService");

const QUICK_ACTIONS = [
  { label: "Track My Orders", action: "track_orders", variant: "primary" },
  { label: "Recommend Products", action: "recommend_products", variant: "secondary" },
  { label: "Compare Products", action: "compare_products", variant: "secondary" },
  { label: "Payment Help", action: "payment_help", variant: "secondary" },
  { label: "Delivery Help", action: "delivery_help", variant: "secondary" },
  { label: "Electronics Guidance", action: "electronics_guidance", variant: "secondary" },
];

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

function extractBudget(text) {
  const match = text.match(/(?:under|below|within)\s*(?:rs\.?|inr)?\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

function extractComparisonTerms(text) {
  const match = text.match(/(.+?)\s+(?:vs|versus|compare)\s+(.+)/i);
  if (!match) {
    return [];
  }

  return [match[1].trim(), match[2].trim()].filter(Boolean);
}

function detectIntent(message, quickAction) {
  if (quickAction) {
    return quickAction;
  }

  const normalized = normalizeText(message);
  if (!normalized) {
    return "general";
  }

  if (/\b(cancel|cancellation|cancel it|can i cancel|stop my order)\b/.test(normalized)) {
    return "cancel_order_help";
  }
  if (/\b(return|refund|exchange|replace|replacement)\b/.test(normalized)) {
    return "unsupported_feature";
  }
  if (/\b(track|where.*order|delivery status|my order|order status)\b/.test(normalized)) {
    return "track_orders";
  }
  if (/\b(compare|vs|versus|difference)\b/.test(normalized)) {
    return "compare_products";
  }
  if (/\b(recommend|best|suggest|under \d+|budget|good for)\b/.test(normalized)) {
    return "recommend_products";
  }
  if (/\b(payment|upi|card|netbanking|wallet|failed payment)\b/.test(normalized)) {
    return "payment_help";
  }
  if (/\b(delivery|shipping|shipped|dispatch)\b/.test(normalized)) {
    return "delivery_help";
  }
  if (/\b(sensor|arduino|esp32|nodemcu|raspberry pi|robotics|iot|electronics|component)\b/.test(normalized)) {
    return "electronics_guidance";
  }
  return "general";
}

async function searchProductsByTerms(text, limit = 6) {
  const normalized = normalizeText(text);
  const terms = normalized
    .split(" ")
    .filter((term) => term.length > 2)
    .slice(0, 8);

  const budget = extractBudget(text);
  const filter = {
    stock: { $gt: 0 },
  };

  if (budget) {
    filter.price = { $lte: budget };
  }

  if (terms.length > 0) {
    filter.$or = [
      { productName: { $regex: terms.join("|"), $options: "i" } },
      { category: { $regex: terms.join("|"), $options: "i" } },
      { description: { $regex: terms.join("|"), $options: "i" } },
    ];
  }

  return Product.find(filter)
    .sort({ featured: -1, rating: -1, soldCount: -1, price: 1 })
    .limit(limit);
}

async function buildUserContext(userId) {
  const user = await User.findById(userId)
    .select("fullName email cartItems wishlistItems savedAddresses")
    .populate("cartItems.product", "productName category price stock")
    .populate("wishlistItems", "productName category price stock rating");

  const orders = await Order.find({ user: userId })
    .populate("items.product", "productName category price imageUrl")
    .sort({ createdAt: -1 })
    .limit(6);

  return {
    user,
    orders,
  };
}

function toProductSnapshot(product) {
  return {
    productId: product._id,
    productName: product.productName,
    category: product.category,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl,
    stock: product.stock,
    rating: product.rating || 0,
    averageRating: product.averageRating || product.rating || 0,
  };
}

function buildOrderSummary(order) {
  const statusNote = STATUS_EXPLANATIONS[order.orderStatus] || "Your order is being processed.";
  const deliveryDate = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not available";
  const displayLabel = getOrderDisplayLabel(order);
  const orderReference =
    displayLabel === makeOrderNumber(order)
      ? makeOrderNumber(order)
      : `${displayLabel} (${makeOrderNumber(order)})`;

  return [
    `Order ${orderReference} is currently ${order.orderStatus}.`,
    statusNote,
    `Payment method: ${order.paymentMethod}.`,
    `Payment status: ${order.paymentStatus}.`,
    `Estimated delivery: ${deliveryDate}.`,
  ].join(" ");
}

function buildCancellationFallback(order) {
  const assessment = assessCancellationEligibility(order);
  const displayLabel = getOrderDisplayLabel(order);
  const base = `${displayLabel} (${makeOrderNumber(order)}) is currently ${order.orderStatus}. Payment method: ${order.paymentMethod}.`;
  return `${base} ${assessment.detailMessage}`;
}

function buildUnsupportedFeatureFallback() {
  return "Currently, the platform does not support return or refund requests through the website.";
}

function buildContactSupportFallback(order) {
  const displayLabel = getOrderDisplayLabel(order);
  return `I can help you with support for ${displayLabel} (${makeOrderNumber(order)}). The current status is ${order.orderStatus}, and the payment method is ${order.paymentMethod}.`;
}

function buildOrderChoicePrompt(orders, intent) {
  if (!orders.length) {
    return "I couldn't find any recent orders on your account yet.";
  }

  if (intent === "cancel_order_help") {
    return "I can help with cancellation eligibility, but I need the exact order first. Please choose one of your recent orders below.";
  }

  return "I found your recent orders. Please pick the one you want help with, and I will continue from there.";
}

function buildGeneralFallback(intent, orders, products) {
  switch (intent) {
    case "track_orders":
      return orders.length
        ? "I pulled your recent order details below. Select an order for tracking, payment status, or cancellation guidance."
        : "I couldn't find any recent orders on your account yet. Once you place an order, I can help you track it.";
    case "payment_help":
      return "I can help with payment status, COD eligibility, prepaid order questions, or what to do after a failed payment.";
    case "delivery_help":
      return "I can explain delivery timelines, shipped statuses, and what to do if an order feels delayed.";
    case "unsupported_feature":
      return buildUnsupportedFeatureFallback();
    case "electronics_guidance":
      return products.length
        ? "I matched your electronics request to products in our catalog and surfaced a few relevant options below."
        : "Tell me your project goal, budget, or skill level and I will narrow down the best electronics options for you.";
    default:
      return "I can help with order tracking, cancellation guidance, product recommendations, comparisons, payments, and delivery support.";
  }
}

function buildRecommendationFallback(products, message) {
  if (products.length === 0) {
    return "I couldn't find a strong in-stock match in our current catalog for that request. Try a more specific use case like robotics, IoT, sensors, or a budget range.";
  }

  const names = products.slice(0, 3).map((product) => product.productName).join(", ");
  return `I found a few relevant in-stock options for "${message}": ${names}. I've surfaced the best matches below so you can compare quickly.`;
}

function buildComparisonFallback(products) {
  if (products.length < 2) {
    return "I need two matching products from our catalog to make a proper comparison. Try naming both products, like ESP32 vs Arduino Uno.";
  }

  const [first, second] = products;
  return `${first.productName} is priced at ${formatCurrency(first.price)}, while ${second.productName} is ${formatCurrency(second.price)}. I've added a side-by-side comparison below to help you choose faster.`;
}

function buildAssistantDirective({ intent, resolvedOrder, comparison, session }) {
  if (intent === "cancel_order_help" && resolvedOrder) {
    const assessment = assessCancellationEligibility(resolvedOrder);
    return [
      "User is asking about cancellation.",
      `Resolved order: ${getOrderDisplayLabel(resolvedOrder)} (${makeOrderNumber(resolvedOrder)}).`,
      `Cancellation result: ${assessment.shortMessage}`,
      `Required explanation: ${assessment.detailMessage}`,
      "Do not change or reinterpret this rule.",
    ].join(" ");
  }

  if (resolvedOrder) {
    return `Resolved order reference from conversation memory: ${getOrderDisplayLabel(resolvedOrder)} (${makeOrderNumber(resolvedOrder)}).`;
  }

  if (comparison?.title) {
    return `Provide a concise comparison aligned to: ${comparison.title}.`;
  }

  if (session?.summary) {
    return `Conversation summary: ${session.summary}`;
  }

  return "Maintain continuity with the recent conversation and resolve references like it, that order, and the latest one using the provided memory.";
}

function buildPrompt({
  message,
  intent,
  session,
  userContext,
  products,
  orders,
  resolvedOrder,
  comparison,
}) {
  const cartSummary = (userContext.user?.cartItems || []).map((item) => ({
    productName: item.product?.productName,
    category: item.product?.category,
    quantity: item.quantity,
    price: item.product?.price,
  }));

  const wishlistSummary = (userContext.user?.wishlistItems || []).slice(0, 8).map((item) => ({
    productName: item.productName,
    category: item.category,
    price: item.price,
    rating: item.rating,
  }));

  const orderSummary = orders.map((order) => ({
    displayLabel: getOrderDisplayLabel(order),
    orderNumber: makeOrderNumber(order),
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    totalAmount: order.totalAmount,
    estimatedDelivery: order.estimatedDelivery,
  }));

  const conversationWindow = buildConversationWindow(session?.messages || [], 10);
  const activeOrderContext = resolvedOrder
    ? {
        displayLabel: getOrderDisplayLabel(resolvedOrder),
        orderNumber: makeOrderNumber(resolvedOrder),
        orderStatus: resolvedOrder.orderStatus,
        paymentMethod: resolvedOrder.paymentMethod,
        paymentStatus: resolvedOrder.paymentStatus,
      }
    : null;

  const isProductIntent = ['recommend_products', 'compare_products', 'electronics_guidance', 'general'].includes(intent);
  const productContextBlock = products.length > 0
    ? `The following products are currently available in our store:\n${JSON.stringify(products, null, 2)}\nOnly refer to products from this list when answering. If the user asks about a product not present in this list, clearly state it is not available in our store and suggest the closest available alternative from the list if one exists. Never invent product names, prices, or specifications.`
    : isProductIntent
      ? 'No matching products were found in our database for this query. The product the user is asking about is not currently stocked in our store. You must clearly tell the user that the product is not available. Do not hallucinate or invent any product details, names, prices, or specifications.'
      : 'No specific product context for this query.';

  return `
You are ElectroMart AI, a premium electronics ecommerce support assistant for a MERN platform.

Behavior rules:
- Continue the conversation naturally using the provided chat memory.
- Resolve follow-ups like "it", "that order", and "the latest one" from memory and resolved context.
- Be concise, professional, and support-oriented.
- Only discuss features that exist on the current website.
- Never invent products, orders, tracking events, or unsupported ecommerce workflows.
- For any product-related query (recommendations, comparisons, availability, specs, or pricing): ONLY reference products from the "Product context" section below. If the user asks about a product not in that section, clearly state it is not available in our store and suggest the closest available alternative if one exists. Never fabricate product names, prices, or specifications under any circumstances.
- The platform supports order placement, COD and online payments, order tracking, and COD order cancellation before shipment or delivery.
- The platform does not support returns, refunds, exchanges, replacements, return requests, or refund workflows through the website.
- If the user asks about returns or refunds, reply that the platform does not support return or refund requests through the website, and optionally suggest contacting support.
- Use deterministic order facts exactly as provided.
- Never override the provided cancellation decision.
- Cancellation rules are strict: only Cash on Delivery orders can be cancelled, and only before they are shipped or delivered. Online paid orders cannot be cancelled through the website. Delivered orders cannot be cancelled.
- Keep the response under 140 words unless a comparison needs slightly more depth.

Recent conversation:
${JSON.stringify(conversationWindow, null, 2)}

Conversation summary:
${session?.summary || "none"}

User message:
${message}

Detected intent:
${intent}

Resolved order context:
${JSON.stringify(activeOrderContext, null, 2)}

Product context:
${productContextBlock}

Relevant orders:
${JSON.stringify(orderSummary, null, 2)}

Cart context:
${JSON.stringify(cartSummary, null, 2)}

Wishlist context:
${JSON.stringify(wishlistSummary, null, 2)}

Comparison context:
${comparison?.title || "none"}

Assistant directive:
${buildAssistantDirective({ intent, resolvedOrder, comparison, session })}

Respond in markdown with short paragraphs or brief bullets only when useful.
`;
}

async function generateAiText(payload, fallback) {
  if (!groq) {
    return fallback;
  }

  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.35,
      max_tokens: 450,
      messages: [
        {
          role: "system",
          content:
            "You generate reliable ecommerce assistant replies grounded only in provided context and conversation memory.",
        },
        {
          role: "user",
          content: payload,
        },
      ],
    });

    return completion.choices?.[0]?.message?.content?.trim() || fallback;
  } catch (error) {
    console.error("Groq assistant error:", error.message);
    return fallback;
  }
}

function buildSessionSummary({ intent, resolvedOrder, products }) {
  if (resolvedOrder) {
    return `Active order: ${getOrderDisplayLabel(resolvedOrder)} (${makeOrderNumber(resolvedOrder)}) with status ${resolvedOrder.orderStatus} and payment method ${resolvedOrder.paymentMethod}. Last support topic: ${intent}.`;
  }

  if (products.length > 0) {
    return `Recent shopping topic: ${products
      .slice(0, 2)
      .map((product) => product.productName)
      .join(", ")}. Last support topic: ${intent}.`;
  }

  return `Last support topic: ${intent}.`;
}

async function buildAssistantResponse({ userId, message, quickAction, selectedOrderId, session }) {
  const intent = detectIntent(message, quickAction);
  const userContext = await buildUserContext(userId);
  const recentOrders = userContext.orders || [];

  let products = [];
  let orders = [];
  let comparison = null;
  let resolvedOrder = null;

  if (["recommend_products", "electronics_guidance", "general"].includes(intent)) {
    products = await searchProductsByTerms(message, 6);
  }

  if (
    [
      "track_orders",
      "delivery_help",
      "payment_help",
      "cancel_order_help",
      "contact_support",
      "select_order",
    ].includes(intent) ||
    selectedOrderId
  ) {
    orders = recentOrders;
    resolvedOrder = resolveOrderSelection({
      message,
      selectedOrderId,
      session,
      candidateOrders: recentOrders,
    });

    if (!resolvedOrder) {
      const fallbackOrderId = selectedOrderId || session?.context?.activeOrderId;
      if (fallbackOrderId) {
        resolvedOrder = await Order.findOne({ _id: fallbackOrderId, user: userId }).populate(
          "items.product",
          "productName category price imageUrl"
        );
      }
    }

    if (resolvedOrder) {
      orders = [resolvedOrder];
    }
  }

  if (intent === "compare_products") {
    const terms = extractComparisonTerms(message);
    const compared = [];
    for (const term of terms) {
      const found = await Product.findOne({
        $or: [
          { productName: { $regex: term, $options: "i" } },
          { category: { $regex: term, $options: "i" } },
        ],
      }).sort({ stock: -1, rating: -1, soldCount: -1 });
      if (found) {
        compared.push(found);
      }
    }
    products = compared;
    if (compared.length >= 2) {
      comparison = {
        title: `${compared[0].productName} vs ${compared[1].productName}`,
        points: [
          {
            label: "Pricing",
            value: `${formatCurrency(compared[0].price)} vs ${formatCurrency(compared[1].price)}`,
          },
          {
            label: "Category",
            value: `${compared[0].category} vs ${compared[1].category}`,
          },
          {
            label: "Ratings",
            value: `${(compared[0].averageRating || compared[0].rating || 0).toFixed(1)} vs ${(compared[1].averageRating || compared[1].rating || 0).toFixed(1)}`,
          },
          {
            label: "Stock",
            value: `${compared[0].stock} available vs ${compared[1].stock} available`,
          },
        ],
      };
    }
  }

  if (resolvedOrder && ["track_orders", "delivery_help", "payment_help", "select_order"].includes(intent)) {
    comparison = {
      title: `Tracking Timeline for ${getOrderDisplayLabel(resolvedOrder)}`,
      timeline: getDeliveryTimeline(resolvedOrder),
    };
  }

  let fallbackText = "";

  if (intent === "cancel_order_help") {
    fallbackText = resolvedOrder
      ? buildCancellationFallback(resolvedOrder)
      : buildOrderChoicePrompt(recentOrders, intent);
  } else if (intent === "unsupported_feature") {
    fallbackText = buildUnsupportedFeatureFallback();
  } else if (intent === "contact_support") {
    fallbackText = resolvedOrder
      ? buildContactSupportFallback(resolvedOrder)
      : buildOrderChoicePrompt(recentOrders, intent);
  } else if (intent === "recommend_products") {
    fallbackText = buildRecommendationFallback(products, message);
  } else if (intent === "compare_products") {
    fallbackText = buildComparisonFallback(products);
  } else if (resolvedOrder) {
    fallbackText = buildOrderSummary(resolvedOrder);
  } else if (orders.length > 1 && ["track_orders", "delivery_help", "payment_help"].includes(intent)) {
    fallbackText = buildOrderChoicePrompt(orders, intent);
  } else {
    fallbackText = buildGeneralFallback(intent, orders, products);
  }

  const prompt = buildPrompt({
    message,
    intent,
    session,
    userContext,
    products: products.map((product) => ({
      productName: product.productName,
      category: product.category,
      description: product.description,
      price: product.price,
      stock: product.stock,
      rating: product.averageRating || product.rating || 0,
    })),
    orders,
    resolvedOrder,
    comparison,
  });

  const content = await generateAiText(prompt, fallbackText);

  const quickActions =
    resolvedOrder && orders[0]
      ? buildOrderActions(orders[0])
      : orders.length > 1
        ? orders.slice(0, 4).map((order) => ({
            label: getOrderDisplayLabel(order),
            action: "select_order",
            value: String(order._id),
            variant: "secondary",
          }))
        : QUICK_ACTIONS;

  return {
    content,
    intent,
    richContent: {
      intent,
      summary:
        resolvedOrder && orders[0]
          ? STATUS_EXPLANATIONS[orders[0].orderStatus] || ""
          : session?.summary || "",
      quickActions,
      products: products.map(toProductSnapshot),
      orders: orders.map(toOrderSnapshot),
      comparison,
    },
    sessionContext: {
      activeOrderId: resolvedOrder?._id || session?.context?.activeOrderId || null,
      activeProductIds: products.slice(0, 4).map((product) => product._id),
      lastResolvedReference: resolvedOrder ? getOrderDisplayLabel(resolvedOrder) : "",
    },
    sessionSummary: buildSessionSummary({ intent, resolvedOrder, products }),
  };
}

module.exports = {
  QUICK_ACTIONS,
  buildAssistantResponse,
  canCancelOrder,
  formatCurrency,
  makeOrderNumber,
  toOrderSnapshot,
  getOrderDisplayLabel,
  buildOrderActions,
  assessCancellationEligibility,
};
