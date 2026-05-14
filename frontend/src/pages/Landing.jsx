import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900">
      <Navbar />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Premium Electronics Marketplace
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              Build smarter with curated electronics and pro-grade components.
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-600">
              ElectroMart brings together the latest hardware, robotics kits, and
              components trusted by makers and engineers worldwide.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/home"
                className="rounded-full bg-slate-900 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Explore Products
              </Link>
              <Link
                to="/signup"
                className="rounded-full border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <div className="flex min-h-[190px] flex-col rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.4)] backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-900">
                Register
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Save your cart, track orders, and unlock member-only deals.
              </p>
              <Link
                to="/signup"
                className="mt-auto inline-flex items-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Register now
              </Link>
            </div>
            <div className="flex min-h-[190px] flex-col rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.4)] backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-900">Login</h2>
              <p className="mt-2 text-sm text-slate-500">
                Access saved carts and manage all your purchases in one place.
              </p>
              <Link
                to="/login"
                className="mt-auto inline-flex items-center rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Landing;
