import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import api from "../utils/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

function getStoredUser() {
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    window.localStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState(getStoredUser);

  const isAuthenticated = Boolean(token);

  const persistAuth = useCallback((nextToken, nextUser) => {
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const clearAuth = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const signup = useCallback(async (payload) => {
    const response = await api.post("/api/auth/signup", payload);
    persistAuth(response.data.token, response.data.user);
    return response.data.user;
  }, [persistAuth]);

  const login = useCallback(async (payload) => {
    const response = await api.post("/api/auth/login", payload);
    persistAuth(response.data.token, response.data.user);
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
      token,
      user,
      isAuthenticated,
      signup,
      login,
      logout,
      updateUser,
    }),
    [token, user, isAuthenticated, signup, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
