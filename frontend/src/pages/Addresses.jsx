import { useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useProfile } from "../context/ProfileContext";

const emptyForm = {
  label: "",
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
      setEditingId(null);
      toast.success("Address updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update address");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">
            Saved Addresses
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your shipping locations and default address.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
            <h2 className="text-lg font-semibold text-slate-900">
              Your Addresses
            </h2>
            <div className="mt-6 space-y-4">
              {addresses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                  Add your first address to get started.
                </div>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address._id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {address.label}
                        </p>
                        <p className="text-xs text-slate-500">
                          {address.street}, {address.city}, {address.state}
                        </p>
                        <p className="text-xs text-slate-500">
                          {address.pincode}, {address.country}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        {address.isDefault && (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
                            Default
                          </span>
                        )}
                        {!address.isDefault && (
                          <button
                            type="button"
                            onClick={async () => {
                              await setDefaultAddress(address._id);
                              toast.success("Default address updated");
                            }}
                            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300 hover:bg-white"
                          >
                            Set default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEdit(address)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300 hover:bg-white"
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
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs"
                        />
                        <input
                          name="street"
                          value={editData.street}
                          onChange={handleEditChange}
                          placeholder="Street"
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs sm:col-span-2"
                        />
                        <input
                          name="city"
                          value={editData.city}
                          onChange={handleEditChange}
                          placeholder="City"
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs"
                        />
                        <input
                          name="state"
                          value={editData.state}
                          onChange={handleEditChange}
                          placeholder="State"
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs"
                        />
                        <input
                          name="pincode"
                          value={editData.pincode}
                          onChange={handleEditChange}
                          placeholder="Pincode"
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs"
                        />
                        <input
                          name="country"
                          value={editData.country}
                          onChange={handleEditChange}
                          placeholder="Country"
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs"
                        />
                        <label className="flex items-center gap-2 text-xs text-slate-500">
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
                            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
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

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
            <h2 className="text-lg font-semibold text-slate-900">
              Add New Address
            </h2>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <input
                name="label"
                value={formData.label}
                onChange={handleChange}
                placeholder="Label (Home, Office)"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              />
              <input
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Street"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                required
              />
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                required
              />
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                required
              />
              <input
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                required
              />
              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                required
              />
              <label className="flex items-center gap-2 text-xs text-slate-500">
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
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800"
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
