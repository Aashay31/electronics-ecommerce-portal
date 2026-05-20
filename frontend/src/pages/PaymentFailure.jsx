import { Link, useLocation } from "react-router-dom";
import { FiXCircle, FiRotateCcw, FiShoppingBag } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const failureMessages = {
  cancelled: "Payment was cancelled. No amount was deducted.",
  failed: "Payment failed. Please try again or use another method.",
  verification: "Payment verification failed. If money was deducted, contact support.",
};

function PaymentFailure() {
  const location = useLocation();
  const reason = location.state?.reason || "failed";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="bg-rose-600 px-6 py-12 text-center text-white">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <FiXCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Unsuccessful</h1>
            <p className="mt-2 text-rose-100">
              {failureMessages[reason] || failureMessages.failed}
            </p>
          </div>

          <div className="p-8 sm:p-10">
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700">
              You can retry the payment from checkout or continue shopping.
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/checkout"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/30 transition hover:-translate-y-0.5 hover:bg-rose-700"
              >
                <FiRotateCcw className="h-4 w-4" /> Retry Payment
              </Link>
              <Link
                to="/home"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                <FiShoppingBag className="h-4 w-4" /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PaymentFailure;
