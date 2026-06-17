import { useEffect, useRef } from "react";
import { Bot, Sparkles, Trash2, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAssistant } from "./AssistantContext";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import QuickActionButtons from "./components/QuickActionButtons";
import TypingIndicator from "./components/TypingIndicator";

const HEADER_ACTIONS = [
  { label: "Track My Orders", action: "track_orders", variant: "primary" },
  { label: "Recommend Products", action: "recommend_products", variant: "secondary" },
  { label: "Compare Products", action: "compare_products", variant: "secondary" },
  { label: "Payment Help", action: "payment_help", variant: "secondary" },
  { label: "Delivery Help", action: "delivery_help", variant: "secondary" },
  { label: "Electronics Guidance", action: "electronics_guidance", variant: "secondary" },
];

function mapActionToPrompt(action) {
  switch (action.action) {
    case "track_orders":
      return { message: "Track my latest orders", quickAction: action.action };
    case "recommend_products":
      return { message: "Recommend some products for me", quickAction: action.action };
    case "compare_products":
      return { message: "Compare two products for me", quickAction: action.action };
    case "payment_help":
      return { message: "I need payment help", quickAction: action.action };
    case "delivery_help":
      return { message: "I need delivery help", quickAction: action.action };
    case "electronics_guidance":
      return { message: "Help me choose electronics for my project", quickAction: action.action };
    case "select_order":
      return { message: "Where is this order?", quickAction: action.action, selectedOrderId: action.value };
    case "cancel_order_help":
      return { message: "Can I cancel this COD order?", quickAction: "cancel_order_help", selectedOrderId: action.value };
    case "view_order_details":
      return { navigateTo: `/orders/${action.value}` };
    case "reorder":
      return { navigateTo: `/orders/${action.value}` };
    case "contact_support":
      return { message: "I need help with this order", quickAction: action.action, selectedOrderId: action.value };
    default:
      return { message: action.label, quickAction: action.action, selectedOrderId: action.value || "" };
  }
}

function ChatWidget() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isOpen,
    setIsOpen,
    messages,
    sessionTitle,
    isLoadingHistory,
    isSending,
    activeOrderActionId,
    sendMessage,
    clearChat,
    cancelOrderFromAssistant,
  } = useAssistant();
  const scrollRef = useRef(null);

  const shouldRender =
    isAuthenticated &&
    location.pathname !== "/" &&
    !location.pathname.startsWith("/login") &&
    !location.pathname.startsWith("/signup") &&
    !location.pathname.startsWith("/forgot-password") &&
    !location.pathname.startsWith("/reset-password") &&
    !location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isSending, isOpen, activeOrderActionId]);

  if (!shouldRender) {
    return null;
  }

  const handleQuickAction = async (action) => {
    if (action.action === "cancel_order") {
      await cancelOrderFromAssistant(action.value);
      return;
    }

    const mapped = mapActionToPrompt(action);
    if (mapped.navigateTo) {
      navigate(mapped.navigateTo);
      return;
    }
    await sendMessage(mapped);
  };

  const handleExploreProduct = (product) => {
    navigate(`/products/${product.productId}`);
  };

  return (
    <>
      {/* FAB toggle button */}
      <div className="fixed bottom-5 right-5 z-[70] sm:bottom-7 sm:right-7">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="group relative flex h-16 w-16 items-center justify-center rounded-[1.75rem] border border-white/15 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white shadow-[0_25px_60px_rgba(2,12,27,0.45)] transition duration-300 hover:-translate-y-1"
        >
          <div className="absolute inset-0 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(103,232,249,0.28),_transparent_60%)] opacity-80" />
          <Bot className="relative h-7 w-7" />
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300 text-[10px] font-bold text-slate-950 shadow-lg shadow-cyan-400/20">
            AI
          </span>
        </button>
      </div>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 left-3 right-3 z-[69] origin-bottom-right transition duration-300 sm:left-auto sm:right-7 sm:w-[420px] sm:max-w-[calc(100vw-3.5rem)] ${
          isOpen ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        {/*
          KEY FIX: use a fixed height instead of min-height so the flex column
          can actually distribute space between header / messages / footer.
          h-[580px] gives comfortable room; cap with max-h so it never overflows
          the viewport on small screens.
        */}
        <div className="flex h-[700px] max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.95))] shadow-[0_30px_90px_rgba(2,12,27,0.65)] backdrop-blur-2xl">

          {/* ── Header ── */}
          <div className="relative shrink-0 overflow-hidden border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-transparent px-5 py-4">
            <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_40%)]" />
            <div className="relative flex items-start justify-between gap-3">
              {/* left: brand + quick actions */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 rounded-full border border-cyan-500/30 dark:border-cyan-300/20 bg-cyan-500/10 dark:bg-cyan-300/10 p-2 text-cyan-600 dark:text-cyan-100">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">ElectroMart AI</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{sessionTitle || "Shopping intelligence for electronics and orders"}</p>
                  </div>
                </div>
                <QuickActionButtons actions={HEADER_ACTIONS} onAction={handleQuickAction} compact />
              </div>

              {/* right: clear + close — shrink-0 so they are never squeezed off screen */}
              <div className="flex shrink-0 items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={clearChat}
                  className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-2 text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-white/10"
                  aria-label="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-2 text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-white/10"
                  aria-label="Close assistant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Messages (scrollable, flex-1 so it fills remaining space) ── */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-4 px-4 py-4"
            style={{ overscrollBehavior: "contain" }}
          >
            {isLoadingHistory ? (
              <div className="space-y-3">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="animate-pulse rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-4">
                    <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-white/10" />
                    <div className="mt-3 h-3 w-full rounded bg-slate-200 dark:bg-white/10" />
                    <div className="mt-2 h-3 w-4/5 rounded bg-slate-200 dark:bg-white/10" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage
                    key={message._id || `${message.role}-${message.timestamp}`}
                    message={message}
                    onQuickAction={handleQuickAction}
                    onExploreProduct={handleExploreProduct}
                    activeOrderActionId={activeOrderActionId}
                  />
                ))}
                {isSending || activeOrderActionId ? <TypingIndicator label={activeOrderActionId ? "ElectroMart AI is updating your order" : "ElectroMart AI is thinking"} /> : null}
              </>
            )}
          </div>



          <ChatInput onSend={(message) => sendMessage({ message })} disabled={isSending || Boolean(activeOrderActionId)} />
        </div>
      </div>
    </>
  );
}

export default ChatWidget;
