import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loginMethod, setLoginMethod] = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload =
        loginMethod === "phone"
          ? { phoneNumber: formData.identifier, password: formData.password }
          : { email: formData.identifier, password: formData.password };
      await login(payload);
      toast.success("Welcome back!");
      const redirectTo = location.state?.from?.pathname || "/home";
      navigate(redirectTo);
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to sign in. Try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white">
      <Navbar />

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 pt-36 pb-12 sm:px-6 lg:px-8 md:pt-28">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 top-16 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-900/20" />
          <div className="absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-slate-200/70 blur-3xl dark:bg-slate-800/40" />
          <div className="absolute left-1/2 top-2 h-40 w-40 -translate-x-1/2 rounded-full bg-slate-100/80 blur-2xl dark:bg-slate-800/30" />
        </div>

        <section className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.4)] backdrop-blur dark:border-white/10 dark:bg-slate-900/90 dark:shadow-[0_30px_90px_-50px_rgba(0,0,0,0.6)] sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-slate-900/30 dark:bg-white/10 dark:shadow-none">
              EM
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Electronics & Robotics Marketplace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Access your saved carts, orders, and wishlist.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="identifier"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {loginMethod === "phone" ? "Phone number" : "Email address"}
                </label>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="loginMethod"
                      value="email"
                      checked={loginMethod === "email"}
                      onChange={() => setLoginMethod("email")}
                    />
                    Email
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="loginMethod"
                      value="phone"
                      checked={loginMethod === "phone"}
                      onChange={() => setLoginMethod("phone")}
                    />
                    Phone
                  </label>
                </div>
              </div>
              <input
                id="identifier"
                name="identifier"
                type={loginMethod === "phone" ? "tel" : "email"}
                placeholder={
                  loginMethod === "phone" ? "Enter phone number" : "you@electromart.com"
                }
                required
                value={formData.identifier}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-white/20 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-white/20 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
              />
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(event) => setShowPassword(event.target.checked)}
                  />
                  Show password
                </label>
                <Link
                  className="text-xs font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  to="/forgot-password"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition duration-200 ease-out hover:-translate-y-1 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 dark:bg-white dark:text-slate-900 dark:shadow-white/10 dark:hover:bg-slate-200 dark:focus:ring-white/20"
            >
              {isSubmitting ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
            New here?{" "}
            <Link
              to="/signup"
              className="font-semibold text-slate-900 transition hover:text-indigo-500 dark:text-white dark:hover:text-indigo-400"
            >
              Create Account
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Login;