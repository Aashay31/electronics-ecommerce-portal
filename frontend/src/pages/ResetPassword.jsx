import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../utils/api";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.put(`/api/auth/reset-password/${token}`, { password });
      toast.success("Password reset successful. You can now login.");
      navigate("/login");
    } catch (error) {
      const message = error.response?.data?.message || "Invalid or expired reset link.";
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
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Set New Password
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Enter your new password below.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter new password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white transition duration-200 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-white/20 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white transition duration-200 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-white/20 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition duration-200 ease-out hover:-translate-y-1 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 dark:bg-white dark:text-slate-900 dark:shadow-white/10 dark:hover:bg-slate-200 dark:focus:ring-white/20"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ResetPassword;
