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

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { isAuthenticated, updateUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState(() => {
    return localStorage.getItem("selectedDeliveryAddressId") || "";
  });

  useEffect(() => {
    localStorage.setItem("selectedDeliveryAddressId", selectedDeliveryAddressId);
  }, [selectedDeliveryAddressId]);

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setWishlist([]);
      setAddresses([]);
      setOrders([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get("/api/users/me");
      setProfile(response.data.user);
      setWishlist(response.data.user?.wishlistItems || []);
      setAddresses(response.data.user?.savedAddresses || []);
      // Orders are now loaded on demand or explicitly fetched
      updateUser(response.data.user);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      } else {
        toast.error("Unable to load profile");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, updateUser, logout]);

  useEffect(() => {
    const timeoutId = setTimeout(() => refreshProfile(), 0);
    return () => clearTimeout(timeoutId);
  }, [refreshProfile]);

  const updateProfile = useCallback(
    async (payload) => {
      const response = await api.put("/api/users/me", payload);
      setProfile(response.data.user);
      updateUser(response.data.user);
      return response.data.user;
    },
    [updateUser]
  );

  const updatePassword = useCallback(async (payload) => {
    const response = await api.put("/api/users/me/password", payload);
    return response.data;
  }, []);

  const loadOrders = useCallback(async () => {
    const response = await api.get("/api/orders/myorders");
    setOrders(response.data.orders || []);
    return response.data.orders || [];
  }, []);

  const toggleWishlist = useCallback(
    async (productId) => {
      if (!productId) {
        return [];
      }

      const exists = wishlist.some((item) => item._id === productId);
      const response = exists
        ? await api.delete(`/api/users/me/wishlist/${productId}`)
        : await api.post("/api/users/me/wishlist", { productId });

      setWishlist(response.data.wishlist || []);
      return response.data.wishlist || [];
    },
    [wishlist]
  );

  const loadWishlist = useCallback(async () => {
    const response = await api.get("/api/users/me/wishlist");
    setWishlist(response.data.wishlist || []);
    return response.data.wishlist || [];
  }, []);

  const loadAddresses = useCallback(async () => {
    const response = await api.get("/api/users/me/addresses");
    setAddresses(response.data.addresses || []);
    return response.data.addresses || [];
  }, []);

  const addAddress = useCallback(async (payload) => {
    const response = await api.post("/api/users/me/addresses", payload);
    setAddresses(response.data.addresses || []);
    setProfile((current) =>
      current ? { ...current, savedAddresses: response.data.addresses || [] } : current
    );
    return response.data.addresses || [];
  }, []);

  const updateAddress = useCallback(async (addressId, payload) => {
    const response = await api.put(`/api/users/me/addresses/${addressId}`, payload);
    setAddresses(response.data.addresses || []);
    setProfile((current) =>
      current ? { ...current, savedAddresses: response.data.addresses || [] } : current
    );
    return response.data.addresses || [];
  }, []);

  const deleteAddress = useCallback(async (addressId) => {
    const response = await api.delete(`/api/users/me/addresses/${addressId}`);
    setAddresses(response.data.addresses || []);
    setProfile((current) =>
      current ? { ...current, savedAddresses: response.data.addresses || [] } : current
    );
    return response.data.addresses || [];
  }, []);

  const setDefaultAddress = useCallback(async (addressId) => {
    const response = await api.put(`/api/users/me/addresses/${addressId}/default`);
    setAddresses(response.data.addresses || []);
    setProfile((current) =>
      current ? { ...current, savedAddresses: response.data.addresses || [] } : current
    );
    return response.data.addresses || [];
  }, []);

  const value = useMemo(
    () => ({
      profile,
      wishlist,
      addresses,
      orders,
      setOrders,
      isLoading,
      refreshProfile,
      updateProfile,
      updatePassword,
      loadOrders,
      toggleWishlist,
      loadWishlist,
      loadAddresses,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      selectedDeliveryAddressId,
      setSelectedDeliveryAddressId,
    }),
    [
      profile,
      wishlist,
      addresses,
      orders,
      setOrders,
      isLoading,
      refreshProfile,
      updateProfile,
      updatePassword,
      loadOrders,
      toggleWishlist,
      loadWishlist,
      loadAddresses,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      selectedDeliveryAddressId,
    ]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }

  return context;
}
