import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import api from "../utils/api";

const AuthContext = createContext(null);
const USER_KEY = "authUser";

function getStoredUser() {
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const isAuthenticated = Boolean(user);

  const persistAuth = useCallback((nextUser) => {
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const clearAuth = useCallback(() => {
    window.localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const signup = useCallback(async (payload) => {
    const response = await api.post("/api/auth/signup", payload);
    persistAuth(response.data.user);
    return response.data.user;
  }, [persistAuth]);

  const login = useCallback(async (payload) => {
    const response = await api.post("/api/auth/login", payload);
    persistAuth(response.data.user);
    return response.data.user;
  }, [persistAuth]);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      signup,
      login,
      logout,
      updateUser,
    }),
    [user, isAuthenticated, signup, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
