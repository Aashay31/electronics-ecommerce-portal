import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const AssistantContext = createContext(null);
const STORAGE_KEY = "electromart_ai_widget_open";

export function AssistantProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [sessionTitle, setSessionTitle] = useState("ElectroMart Support");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeOrderActionId, setActiveOrderActionId] = useState("");
  const initializedRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isOpen));
  }, [isOpen]);

  useEffect(() => {
    if (!isAuthenticated) {
      setMessages([]);
      setSessionId("");
      setSessionTitle("ElectroMart Support");
      setActiveOrderActionId("");
      initializedRef.current = false;
      return;
    }

    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    refreshSession();
  }, [isAuthenticated]);

  const refreshSession = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await api.get("/api/assistant/session");
      setMessages(response.data.session?.messages || []);
      setSessionId(response.data.session?._id || "");
      setSessionTitle(response.data.session?.title || "ElectroMart Support");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load assistant");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const sendMessage = async ({ message, quickAction = "", selectedOrderId = "" }) => {
    if (!isAuthenticated || isSending) {
      return;
    }

    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
      richContent: {},
    };

    setMessages((current) => [...current, optimisticMessage]);
    setIsSending(true);
    setIsOpen(true);

    try {
      const response = await api.post("/api/assistant/message", {
        message,
        quickAction,
        selectedOrderId,
      });
      setMessages(response.data.session?.messages || []);
      setSessionId(response.data.session?._id || "");
      setSessionTitle(response.data.session?.title || "ElectroMart Support");
    } catch (error) {
      setMessages((current) => current.filter((entry) => entry._id !== optimisticMessage._id));
      toast.error(error.response?.data?.message || "Unable to send message");
    } finally {
      setIsSending(false);
    }
  };

  const clearChat = async () => {
    try {
      const response = await api.delete("/api/assistant/session");
      setMessages(response.data.session?.messages || []);
      setSessionId(response.data.session?._id || "");
      setSessionTitle(response.data.session?.title || "ElectroMart Support");
      toast.success("Chat history cleared");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to clear chat");
    }
  };

  const cancelOrderFromAssistant = async (orderId, reason = "Cancelled from AI assistant") => {
    if (!isAuthenticated || !orderId || activeOrderActionId) {
      return;
    }

    setActiveOrderActionId(`cancel_order-${orderId}`);
    setIsOpen(true);

    try {
      const response = await api.post(`/api/assistant/orders/${orderId}/cancel`, { reason });
      setMessages(response.data.session?.messages || []);
      setSessionId(response.data.session?._id || "");
      setSessionTitle(response.data.session?.title || "ElectroMart Support");
      toast.success("Order cancelled successfully");
    } catch (error) {
      const message = error.response?.data?.message || "Unable to cancel order";
      toast.error(message);
    } finally {
      setActiveOrderActionId("");
    }
  };

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      messages,
      sessionId,
      sessionTitle,
      isLoadingHistory,
      isSending,
      activeOrderActionId,
      sendMessage,
      clearChat,
      refreshSession,
      cancelOrderFromAssistant,
    }),
    [isOpen, messages, sessionId, sessionTitle, isLoadingHistory, isSending, activeOrderActionId]
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error("useAssistant must be used within AssistantProvider");
  }
  return context;
}
