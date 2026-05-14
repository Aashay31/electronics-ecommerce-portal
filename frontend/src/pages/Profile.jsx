import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useProfile } from "../context/ProfileContext";

function Profile() {
  const { profile, addresses, isLoading } = useProfile();

  const primaryAddress = addresses.find((address) => address.isDefault);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Profile</h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage your personal information and saved addresses.
            </p>
          </div>
          <Link
            to="/profile/edit"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Edit Profile
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-10 text-center text-slate-500 shadow-md">
            Loading profile...
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
              <h2 className="text-lg font-semibold text-slate-900">
                Personal Information
              </h2>
              <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-semibold text-slate-700">
                  {profile?.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.fullName}
                      className="h-20 w-20 rounded-2xl object-cover"
                    />
                  ) : profile?.fullName ? (
                    profile.fullName
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  ) : (
                    ""
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Member
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                    {profile?.fullName}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {profile?.email}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {profile?.phoneNumber}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
              <h2 className="text-lg font-semibold text-slate-900">
                Account Settings
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Joined</span>
                  <span className="font-medium text-slate-800">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Default Address</span>
                  <span className="font-medium text-slate-800">
                    {primaryAddress
                      ? `${primaryAddress.city}, ${primaryAddress.state}`
                      : "Not set"}
                  </span>
                </div>
              </div>
              <Link
                to="/addresses"
                className="mt-5 inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Manage Addresses
              </Link>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md lg:col-span-2">
              <h2 className="text-lg font-semibold text-slate-900">
                Saved Addresses
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {addresses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                    No saved addresses yet.
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address._id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">
                          {address.label}
                        </span>
                        {address.isDefault && (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
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
