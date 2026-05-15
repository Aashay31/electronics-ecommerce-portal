import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

const initialState = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
};

function Signup() {
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
      });
      toast.success("Account created successfully");
      navigate("/home");
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to create account";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900">
      <Navbar />

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 pt-36 pb-12 sm:px-6 lg:px-8 md:pt-28">
        <section className="w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.4)] backdrop-blur sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-slate-900/30">
              EM
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Electronics & Robotics Marketplace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Create account
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Join ElectroMart to save carts and manage orders.
            </p>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <input
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Street Address
                </label>
                <input
                  name="street"
                  type="text"
                  required
                  value={formData.street}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  City
                </label>
                <input
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  State
                </label>
                <input
                  name="state"
                  type="text"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Pincode
                </label>
                <input
                  name="pincode"
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Country
              </label>
              <input
                name="country"
                type="text"
                required
                value={formData.country}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 ease-out placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition duration-200 ease-out hover:-translate-y-1 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-slate-900 transition hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Signup;
