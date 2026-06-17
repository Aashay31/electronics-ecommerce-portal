import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useProfile } from "../context/ProfileContext";

function Profile() {
  const { profile, addresses, isLoading } = useProfile();

  const primaryAddress = addresses.find((address) => address.isDefault);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pt-36 pb-12 md:pt-28">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Profile</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage your personal information and saved addresses.
            </p>
          </div>
          <Link
            to="/profile/edit"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:shadow-white/10 dark:hover:bg-slate-200"
          >
            Edit Profile
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-10 text-center text-slate-500 shadow-md dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
            Loading profile...
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md dark:border-white/10 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Personal Information
              </h2>
              <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-2xl font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">
                  {profile?.fullName
                    ? profile.fullName
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : ""}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                    Member
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                    {profile?.fullName}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {profile?.email}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {profile?.phoneNumber}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md dark:border-white/10 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Account Settings
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Joined</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Default Address</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {primaryAddress
                      ? `${primaryAddress.city}, ${primaryAddress.state}`
                      : "Not set"}
                  </span>
                </div>
              </div>
              <Link
                to="/addresses"
                className="mt-5 inline-flex items-center rounded-full border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
              >
                Manage Addresses
              </Link>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md dark:border-white/10 dark:bg-slate-900 lg:col-span-2">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Saved Addresses
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {addresses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 p-6 text-sm text-slate-500 dark:text-slate-400">
                    No saved addresses yet.
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address._id}
                      className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 p-4 text-sm text-slate-600 dark:text-slate-400"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {address.label}
                        </span>
                        {address.isDefault && (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-2">
                        {address.street}, {address.city}, {address.state}
                      </p>
                      <p>
                        {address.pincode}, {address.country}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Profile;
