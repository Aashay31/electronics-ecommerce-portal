import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

function getInitialCart() {
  return [];
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(getInitialCart);

  const addToCart = (product) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.product._id === product._id);
      if (existing) {
        return current.map((entry) =>
          entry.product._id === product._id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }

      return [...current, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setItems((current) => current.filter((entry) => entry.product._id !== productId));
  };

  const updateQuantity = (productId, nextQuantity) => {
    setItems((current) => {
      if (nextQuantity <= 0) {
        return current.filter((entry) => entry.product._id !== productId);
      }

      return current.map((entry) =>
        entry.product._id === productId
          ? { ...entry, quantity: nextQuantity }
          : entry
      );
    });
  };

  const cartTotal = useMemo(
    () =>
      items.reduce(
        (total, entry) => total + entry.product.price * entry.quantity,
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
      addToCart,
      removeFromCart,
      updateQuantity,
      cartTotal,
      itemCount,
    }),
    [items, cartTotal, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
