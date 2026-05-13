import { FaGoogle } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900">
      <Navbar />

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 top-16 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-slate-200/70 blur-3xl" />
          <div className="absolute left-1/2 top-2 h-40 w-40 -translate-x-1/2 rounded-full bg-slate-100/80 blur-2xl" />
        </div>

        <section className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.4)] backdrop-blur sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-slate-900/30">
              EM
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Electronics & Robotics Marketplace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Access your saved carts, orders, and wishlist.
            </p>
          </div>

          <form className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@electromart.com"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
              <div className="mt-3 text-right">
                <a
                  className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                  href="#"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            <button
              type="button"
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition duration-200 ease-out hover:-translate-y-1 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
            >
              Login
            </button>
          </form>

          <div className="my-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            OR
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
              <FaGoogle className="text-[18px] text-[#4285F4]" />
            </span>
            Continue with Google
          </button>

          <p className="mt-7 text-center text-sm text-slate-500">
            New here?{" "}
            <a
              href="#"
              className="font-semibold text-slate-900 transition hover:text-indigo-500"
            >
              Create Account
            </a>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Login;