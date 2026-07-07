const ChatSession = require("../models/ChatSession");
const Order = require("../models/Order");
const { cancelOrderForUser } = require("../services/orderCancellationService");
const {
  buildAssistantResponse,
  QUICK_ACTIONS,
  buildOrderActions,
  toOrderSnapshot,
  getOrderDisplayLabel,
  assessCancellationEligibility,
} = require("../services/assistantService");
const { deriveSessionTitle } = require("../services/orderSupportService");
const { getCache, setCache, TTL } = require("../utils/cache");

// Detect if message is product-related (cacheable)
const isProductQuery = (message) => {
  const keywords = [
    "recommend", "compare", "best", "suggest",
    "difference", "vs", "which", "specs", "price",
    "available", "buy", "under", "cheap", "good",
  ];
  return keywords.some((k) => message.toLowerCase().includes(k));
};

async function hydrateSessionMessages(messages = [], userId) {
  const orderIds = new Set();

  messages.forEach((message) => {
    (message.richContent?.orders || []).forEach((order) => {
      if (order?.orderId) {
        orderIds.add(String(order.orderId));
      }
    });
    (message.richContent?.quickActions || []).forEach((action) => {
      if (action?.action === "select_order" && action?.value) {
        orderIds.add(String(action.value));
      }
    });
  });

  if (orderIds.size === 0) {
    return messages;
  }

  const orders = await Order.find({
    _id: { $in: Array.from(orderIds) },
    user: userId,
  }).populate("items.product", "productName category price imageUrl");

  const snapshotById = new Map(
    orders.map((order) => [String(order._id), toOrderSnapshot(order)])
  );

  return messages.map((message) => {
    const richContent = message.richContent || {};
    const hydratedOrders = (richContent.orders || []).map((order) => {
      const hydrated = snapshotById.get(String(order.orderId || ""));
      return hydrated ? { ...order, ...hydrated } : order;
    });
    const hydratedActions = (richContent.quickActions || []).map((action) => {
      if (action.action !== "select_order" || !action.value) {
        return action;
      }

      const hydratedOrder = snapshotById.get(String(action.value));
      return hydratedOrder
        ? { ...action, label: hydratedOrder.displayLabel || getOrderDisplayLabel(hydratedOrder) }
        : action;
    });

    return {
      ...message.toObject(),
      richContent: {
        ...richContent,
        orders: hydratedOrders,
        quickActions: hydratedActions,
      },
    };
  });
}

async function getOrCreateSession(userId) {
  let session = await ChatSession.findOne({ user: userId });

  if (!session) {
    session = await ChatSession.create({
      user: userId,
      messages: [
        {
          role: "assistant",
          content:
            "I'm your ElectroMart AI assistant. I can track orders, compare electronics, recommend products, and help with payment or delivery questions.",
          richContent: {
            intent: "general",
            summary: "",
            quickActions: QUICK_ACTIONS,
            products: [],
            orders: [],
            comparison: null,
          },
        },
      ],
      title: "ElectroMart Support",
      summary: "",
      lastIntent: "general",
      context: {
        activeOrderId: null,
        activeProductIds: [],
        lastResolvedReference: "",
      },
    });
  }

  return session;
}

const getSession = async (req, res) => {
  try {
    const session = await getOrCreateSession(req.user.id);
    const hydratedMessages = await hydrateSessionMessages(session.messages, req.user.id);
    return res.status(200).json({
      success: true,
      session: {
        ...session.toObject(),
        messages: hydratedMessages,
      },
    });
  } catch (error) {
    console.error("Error in assistantController.js:", error);
    return console.error("Error in assistantController.js:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again.",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { message, quickAction = "", selectedOrderId = "" } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const trimmedMessage = String(message).trim();

    // Check cache for product-related queries only
    const productQuery = isProductQuery(trimmedMessage);
    const chatCacheKey = productQuery
      ? `chat:${trimmedMessage.toLowerCase()}`
      : null;

    if (chatCacheKey) {
      const cachedResponse = await getCache(chatCacheKey);
      if (cachedResponse) {
        return res.status(200).json(cachedResponse);
      }
    }

    const session = await getOrCreateSession(req.user.id);

    const userMessage = {
      role: "user",
      content: trimmedMessage,
      quickReplyAction: quickAction,
      timestamp: new Date(),
      richContent: {
        intent: quickAction || "general",
        summary: "",
        quickActions: [],
        products: [],
        orders: [],
        comparison: null,
      },
    };

    const assistantReply = await buildAssistantResponse({
      userId: req.user.id,
      message: trimmedMessage,
      quickAction,
      selectedOrderId,
      session,
    });

    const assistantMessage = {
      role: "assistant",
      content: assistantReply.content,
      timestamp: new Date(),
      richContent: assistantReply.richContent,
    };

    session.messages.push(userMessage, assistantMessage);
    session.title = deriveSessionTitle(session.messages);
    session.summary = assistantReply.sessionSummary || session.summary;
    session.lastIntent = assistantReply.intent;
    session.context = {
      activeOrderId: assistantReply.sessionContext?.activeOrderId || null,
      activeProductIds: assistantReply.sessionContext?.activeProductIds || [],
      lastResolvedReference: assistantReply.sessionContext?.lastResolvedReference || "",
    };
    session.updatedAt = new Date();
    await session.save();
    const hydratedMessages = await hydrateSessionMessages(session.messages, req.user.id);

    const responseData = {
      success: true,
      session: {
        ...session.toObject(),
        messages: hydratedMessages,
      },
      message: assistantMessage,
    };

    // Cache the response for product-related queries
    if (chatCacheKey) {
      await setCache(chatCacheKey, responseData, TTL.CHAT_RESPONSE);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in assistantController.js:", error);
    return console.error("Error in assistantController.js:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again.",
    });
  }
};

const clearSession = async (req, res) => {
  try {
    const session = await ChatSession.findOneAndUpdate(
      { user: req.user.id },
      {
        $set: {
          messages: [
            {
              role: "assistant",
              content:
                "Chat cleared. I'm ready to help again with orders, recommendations, comparisons, and electronics support.",
              richContent: {
                intent: "general",
                summary: "",
                quickActions: QUICK_ACTIONS,
                products: [],
                orders: [],
                comparison: null,
              },
            },
          ],
          title: "ElectroMart Support",
          summary: "",
          lastIntent: "general",
          context: {
            activeOrderId: null,
            activeProductIds: [],
            lastResolvedReference: "",
          },
        },
      },
      { new: true, upsert: true }
    );
    const hydratedMessages = await hydrateSessionMessages(session.messages, req.user.id);

    return res.status(200).json({
      success: true,
      session: {
        ...session.toObject(),
        messages: hydratedMessages,
      },
    });
  } catch (error) {
    console.error("Error in assistantController.js:", error);
    return console.error("Error in assistantController.js:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again.",
    });
  }
};

const getOrderSupport = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "productName category price imageUrl")
      .sort({ createdAt: -1 })
      .limit(8);

    const mappedOrders = orders.map((order) => ({
      ...toOrderSnapshot(order),
      actions: buildOrderActions(order),
    }));

    return res.status(200).json({ success: true, orders: mappedOrders });
  } catch (error) {
    console.error("Error in assistantController.js:", error);
    return console.error("Error in assistantController.js:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again.",
    });
  }
};

const cancelOrderFromAssistant = async (req, res) => {
  try {
    const { reason } = req.body;
    const cancelledOrder = await cancelOrderForUser({
      orderId: req.params.orderId,
      userId: req.user.id,
      reason: reason || "Cancelled from AI assistant",
    });
    const hydratedOrder =
      (await Order.findOne({ _id: cancelledOrder._id, user: req.user.id }).populate(
        "items.product",
        "productName category price imageUrl"
      )) || cancelledOrder;

    const session = await getOrCreateSession(req.user.id);
    const assistantMessage = {
      role: "assistant",
      content: `Your order ${getOrderDisplayLabel(hydratedOrder)} has been cancelled successfully.`,
      timestamp: new Date(),
      richContent: {
        intent: "cancel_order",
        summary: "Order cancelled successfully.",
        quickActions: buildOrderActions(hydratedOrder),
        products: [],
        orders: [toOrderSnapshot(hydratedOrder)],
        comparison: null,
      },
    };

    session.messages.push(assistantMessage);
    session.title = deriveSessionTitle(session.messages);
    session.summary = `Latest action: cancelled ${getOrderDisplayLabel(hydratedOrder)}.`;
    session.lastIntent = "cancel_order";
    session.context = {
      activeOrderId: hydratedOrder._id,
      activeProductIds: [],
      lastResolvedReference: getOrderDisplayLabel(hydratedOrder),
    };
    await session.save();
    const hydratedMessages = await hydrateSessionMessages(session.messages, req.user.id);

    return res.status(200).json({
      success: true,
      order: toOrderSnapshot(hydratedOrder),
      message: assistantMessage,
      session: {
        ...session.toObject(),
        messages: hydratedMessages,
      },
    });
  } catch (error) {
    console.error("Error in assistantController.js:", error);
    if (error.assessment && error.order) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.assessment.shortMessage,
        order: toOrderSnapshot(error.order),
        assessment: error.assessment,
      });
    }

    return res.status(error.statusCode || 500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

const validateOrderCancellation = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user.id }).populate(
      "items.product",
      "productName category price imageUrl"
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      order: toOrderSnapshot(order),
      assessment: assessCancellationEligibility(order),
    });
  } catch (error) {
    console.error("Error in assistantController.js:", error);
    return console.error("Error in assistantController.js:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again.",
    });
  }
};

module.exports = {
  getSession,
  sendMessage,
  clearSession,
  getOrderSupport,
  cancelOrderFromAssistant,
  validateOrderCancellation,
};
