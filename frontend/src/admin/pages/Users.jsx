import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search, Trash2, Ban, UserCheck, Shield, User as UserIcon } from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";

function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Delete Modal state
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchUsers = async (page = 1, searchQuery = search, role = roleFilter) => {
    try {
      const response = await api.get("/api/admin/users", {
        params: { page, limit: 10, search: searchQuery, role },
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => fetchUsers(1, "", ""), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsLoading(true);
    fetchUsers(1, search, roleFilter);
  };

  const handleFilterChange = (e) => {
    const newRole = e.target.value;
    setRoleFilter(newRole);
    setIsLoading(true);
    fetchUsers(1, search, newRole);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setIsLoading(true);
      fetchUsers(newPage, search, roleFilter);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      toast.success("User role updated");
      fetchUsers(pagination.page, search, roleFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      await api.put(`/api/admin/users/${userId}/ban`);
      toast.success("User ban status updated");
      fetchUsers(pagination.page, search, roleFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update ban status");
    }
  };

  const handleDeleteClick = (id) => {
    if (id === currentUser._id) {
      toast.error("You cannot delete your own account");
      return;
    }
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/admin/users/${deleteId}`);
      toast.success("User deleted successfully");
      setIsDeleteModalOpen(false);
      fetchUsers(pagination.page, search, roleFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage platform users, roles, and access.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
          >
            Search
          </button>
        </form>
        <select
          value={roleFilter}
          onChange={handleFilterChange}
          className="rounded-xl border-none bg-slate-50 py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 sm:w-48"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u._id === currentUser?._id;
                  
                  return (
                    <tr key={u._id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-500">
                            <UserIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {u.fullName} {isSelf && <span className="text-xs font-normal text-indigo-600">(You)</span>}
                            </p>
                            <p className="text-xs text-slate-500">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900">{u.email}</p>
                        <p className="text-xs text-slate-500">{u.phoneNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={isSelf}
                          className="rounded-full border-none bg-slate-50 py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            u.isBanned
                              ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20"
                              : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                          }`}
                        >
                          {u.isBanned ? <Ban className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                          {u.isBanned ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleBan(u._id)}
                            disabled={isSelf}
                            className={`rounded-lg p-1.5 transition disabled:cursor-not-allowed disabled:opacity-30 ${
                              u.isBanned
                                ? "text-emerald-600 hover:bg-emerald-50"
                                : "text-amber-600 hover:bg-amber-50"
                            }`}
                            title={u.isBanned ? "Unban User" : "Suspend User"}
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(u._id)}
                            disabled={isSelf}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
            <p className="text-sm text-slate-500">
              Showing page <span className="font-medium text-slate-900">{pagination.page}</span> of{" "}
              <span className="font-medium text-slate-900">{pagination.pages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={isDeleteModalOpen}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone and will remove their order history."
        danger={true}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}

export default Users;
