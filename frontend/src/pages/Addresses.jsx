import { useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useProfile } from "../context/ProfileContext";

const emptyForm = {
  label: "",
  recipientName: "",
  phoneNumber: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
  isDefault: false,
};

function Addresses() {
  const {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    selectedDeliveryAddressId,
    setSelectedDeliveryAddressId,
    refreshProfile,
  } = useProfile();
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(emptyForm);


  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await addAddress(formData);
      setFormData(emptyForm);
      toast.success("Address added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to add address");
    }
  };

  const handleEdit = (address) => {
    setEditingId(address._id);
    setEditData({
      label: address.label || "",
      recipientName: address.recipientName || "",
      phoneNumber: address.phoneNumber || "",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      country: address.country || "",
      isDefault: address.isDefault || false,
    });
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateAddress(editingId, editData);
      await refreshProfile();
      setEditingId(null);
      toast.success("Address updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update address");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pt-36 pb-12 md:pt-28">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Saved Addresses
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage your shipping locations and default address.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md dark:border-white/10 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Your Addresses
            </h2>
            <div className="mt-6 space-y-4">
              {addresses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 p-6 text-sm text-slate-500 dark:text-slate-400">
                  Add your first address to get started.
                </div>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`rounded-2xl border bg-slate-50 dark:bg-slate-900 p-4 transition ${
                      selectedDeliveryAddressId === address._id
                        ? "border-indigo-500 bg-indigo-50/60 shadow-md dark:bg-indigo-500/10 dark:border-indigo-500"
                        : "border-slate-200 dark:border-white/10"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{address.label}</span>
                          {address.isDefault && (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">
                          {address.recipientName?.trim() || "Recipient"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {address.phoneNumber?.trim() || "Phone not set"}
                        </p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {address.street}, {address.city}, {address.state}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {address.pincode}, {address.country}
                        </p>
                        <label className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">
                          <input
                            type="radio"
                            name="deliveryAddress"
                            checked={selectedDeliveryAddressId === address._id}
                            onChange={() => {
                              setSelectedDeliveryAddressId(address._id);
                              toast.success("Delivery address selected for checkout");
                            }}
                            className="h-4 w-4 text-indigo-600"
                          />
                          Deliver here for checkout
                        </label>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        {!address.isDefault && (
                          <button
                            type="button"
                            onClick={async () => {
                              await setDefaultAddress(address._id);
                              toast.success("Default address updated");
                            }}
                            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/5"
                          >
                            Set default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEdit(address)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/5"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteAddress(address._id);
                            toast.success("Address removed");
                          }}
                          className="rounded-full border border-rose-200 px-3 py-1 text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {editingId === address._id && (
                      <form
                        onSubmit={handleEditSubmit}
                        className="mt-4 grid gap-3 sm:grid-cols-2"
                      >
                        <input
                          name="label"
                          value={editData.label}
                          onChange={handleEditChange}
                          placeholder="Label"
                          className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                        <input
                          name="recipientName"
                          value={editData.recipientName}
                          onChange={handleEditChange}
                          placeholder="Recipient name"
                          className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5 dark:text-white"
                          required
                        />
                        <input
                          name="phoneNumber"
                          value={editData.phoneNumber}
                          onChange={handleEditChange}
                          placeholder="Phone number"
                          className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5 dark:text-white"
                          required
                        />
                        <input
                          name="street"
                          value={editData.street}
                          onChange={handleEditChange}
                          placeholder="Street"
                          className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-xs sm:col-span-2"
                        />
                        <input
                          name="city"
                          value={editData.city}
                          onChange={handleEditChange}
                          placeholder="City"
                          className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                        <input
                          name="state"
                          value={editData.state}
                          onChange={handleEditChange}
                          placeholder="State"
                          className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                        <input
                          name="pincode"
                          value={editData.pincode}
                          onChange={handleEditChange}
                          placeholder="Pincode"
                          className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                        <input
                          name="country"
                          value={editData.country}
                          onChange={handleEditChange}
                          placeholder="Country"
                          className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                        <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <input
                            type="checkbox"
                            name="isDefault"
                            checked={editData.isDefault}
                            onChange={handleEditChange}
                          />
                          Set as default
                        </label>
                        <div className="flex gap-2 sm:col-span-2">
                          <button
                            type="submit"
                            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md dark:border-white/10 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Add New Address
            </h2>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <input
                name="label"
                value={formData.label}
                onChange={handleChange}
                placeholder="Label (Home, Office)"
                className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <input
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="Recipient name"
                className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                required
              />
              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone number"
                className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                required
              />
              <input
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Street"
                className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                required
              />
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                required
              />
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                required
              />
              <input
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                required
              />
              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
                className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                required
              />
              <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                />
                Set as default
              </label>
              <button
                type="submit"
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:shadow-white/10 dark:hover:bg-slate-200"
              >
                Save Address
              </button>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Addresses;
