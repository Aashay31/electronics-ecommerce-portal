import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useProfile } from "../context/ProfileContext";

function buildFormData(profile) {
  return {
    fullName: profile?.fullName || "",
    phoneNumber: profile?.phoneNumber || "",
    street: profile?.address?.street || "",
    city: profile?.address?.city || "",
    state: profile?.address?.state || "",
    pincode: profile?.address?.pincode || "",
    country: profile?.address?.country || "",
  };
}

function EditProfileForm({ profile, updateProfile, updatePassword }) {
  const [formData, setFormData] = useState(() => buildFormData(profile));
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
      });
      toast.success("Profile updated");
      navigate("/profile");
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to update profile";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setIsUpdatingPassword(true);

    try {
      await updatePassword(passwordData);
      toast.success("Password updated");
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to update password";
      toast.error(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md dark:border-white/10 dark:bg-slate-900"
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Personal Information
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Full name
            </label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Phone number
            </label>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
        </div>

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Primary Address
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Street address
            </label>
            <input
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              City
            </label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              State
            </label>
            <input
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Pincode
            </label>
            <input
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Country
            </label>
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-900 dark:shadow-white/10 dark:hover:bg-slate-200"
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>

      <form
        onSubmit={handlePasswordSubmit}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md dark:border-white/10 dark:bg-slate-900"
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Change Password
        </h2>
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Current password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              New password
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isUpdatingPassword}
          className="mt-6 w-full rounded-2xl border border-slate-200 dark:border-white/10 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isUpdatingPassword ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}

function EditProfile() {
  const { profile, isLoading, updateProfile, updatePassword } = useProfile();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Edit Profile
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Update your personal details and account preferences.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-slate-500 shadow-md dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
            Loading profile...
          </div>
        ) : (
          <EditProfileForm
            key={profile?._id || "new"}
            profile={profile}
            updateProfile={updateProfile}
            updatePassword={updatePassword}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default EditProfile;
