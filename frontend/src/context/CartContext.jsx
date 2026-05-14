import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get("/api/cart");
      setItems(response.data.cartItems || []);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      } else {
        toast.error("Unable to load cart");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    const timeoutId = setTimeout(() => refreshCart(), 0);
    return () => clearTimeout(timeoutId);
  }, [refreshCart]);

  const addToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return false;
    }

    const productId = typeof product === "string" ? product : product._id;

    try {
      const response = await api.post("/api/cart/add", {
        productId,
        quantity: 1,
      });
      setItems(response.data.cartItems || []);
      return true;
    } catch {
      toast.error("Unable to add to cart");
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const response = await api.delete(`/api/cart/${productId}`);
      setItems(response.data.cartItems || []);
    } catch {
      toast.error("Unable to remove item");
    }
  };

  const updateQuantity = async (productId, nextQuantity) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const response = await api.put(`/api/cart/${productId}`, {
        quantity: nextQuantity,
      });
      setItems(response.data.cartItems || []);
    } catch {
      toast.error("Unable to update quantity");
    }
  };

  const cartTotal = useMemo(
    () =>
      items.reduce(
        (total, entry) =>
          total + (entry.product?.price || 0) * entry.quantity,
        0
      ),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((count, entry) => count + entry.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      cartTotal,
      itemCount,
      refreshCart,
    }),
    [items, isLoading, cartTotal, itemCount, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
