import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

function ProtectedRoute({ children, redirectTo = "/login", toastMessage }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const hasToasted = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && toastMessage && !hasToasted.current) {
      toast.error(toastMessage);
      hasToasted.current = true;
    }
  }, [isAuthenticated, toastMessage]);

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
