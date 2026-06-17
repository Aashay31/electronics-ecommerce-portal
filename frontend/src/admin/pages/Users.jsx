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
        <h1 className="text-[20px] font-semibold text-[var(--admin-text-primary)] tracking-[-0.01em]">Users</h1>
        <p className="mt-1 text-[13px] text-[var(--admin-text-secondary)]">
          Manage platform users, roles, and access.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-[12px] rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-[16px] py-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-[12px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-2)] py-[8px] pl-10 pr-3 text-[14px] text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] outline-none focus:border-[var(--admin-accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
            />
          </div>
          <button
            type="submit"
            className="rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-[18px] py-[8px] text-[14px] font-medium text-[var(--admin-text-primary)] transition hover:bg-[var(--admin-surface-2)]"
          >
            Search
          </button>
        </form>
        <select
          value={roleFilter}
          onChange={handleFilterChange}
          className="rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] py-[8px] pl-3 pr-8 text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] sm:w-48"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left">
            <thead className="border-b-2 border-[var(--admin-border-strong)] bg-[var(--admin-surface-2)]">
              <tr>
                <th className="px-[16px] py-[12px] text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--admin-text-secondary)]">User</th>
                <th className="px-[16px] py-[12px] text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--admin-text-secondary)]">Contact</th>
                <th className="px-[16px] py-[12px] text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--admin-text-secondary)]">Role</th>
                <th className="px-[16px] py-[12px] text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--admin-text-secondary)]">Status</th>
                <th className="px-[16px] py-[12px] text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--admin-text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-[16px] py-[14px] text-center text-[14px] text-[var(--admin-text-secondary)]">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-[16px] py-[14px] text-center text-[14px] text-[var(--admin-text-secondary)]">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => {
                  const isSelf = u._id === currentUser?._id;
                  
                  return (
                    <tr key={u._id} className={`transition hover:bg-[var(--admin-accent-light)] ${idx % 2 === 0 ? "bg-[var(--admin-surface)]" : "bg-[#FAFBFC]"}`}>
                      <td className="px-[16px] py-[14px]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--admin-surface-2)] text-[var(--admin-text-secondary)] border border-[var(--admin-border)]">
                            <UserIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-[var(--admin-text-primary)]">
                              {u.fullName} {isSelf && <span className="text-[12px] font-normal text-[var(--admin-accent)]">(You)</span>}
                            </p>
                            <p className="text-[13px] text-[var(--admin-text-secondary)]">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-[16px] py-[14px]">
                        <p className="text-[14px] text-[var(--admin-text-primary)]">{u.email}</p>
                        <p className="text-[13px] text-[var(--admin-text-secondary)]">{u.phoneNumber}</p>
                      </td>
                      <td className="px-[16px] py-[14px]">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={isSelf}
                          className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-2)] py-[4px] pl-2 pr-8 text-[13px] font-medium text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] disabled:opacity-50"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-[16px] py-[14px]">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-[10px] py-[3px] text-[12px] font-medium border ${
                            u.isBanned
                              ? "bg-[var(--admin-danger-bg)] text-[var(--admin-danger)] border-[#FECACA]"
                              : "bg-[var(--admin-success-bg)] text-[var(--admin-success)] border-[#BBF7D0]"
                          }`}
                        >
                          {u.isBanned ? <Ban className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                          {u.isBanned ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="px-[16px] py-[14px] text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleBan(u._id)}
                            disabled={isSelf}
                            className={`rounded-md p-[7px] transition border border-transparent disabled:cursor-not-allowed disabled:opacity-30 ${
                              u.isBanned
                                ? "text-[var(--admin-success)] hover:bg-[var(--admin-success-bg)] hover:border-[#BBF7D0]"
                                : "text-[var(--admin-warning)] hover:bg-[var(--admin-warning-bg)] hover:border-[#FDE68A]"
                            }`}
                            title={u.isBanned ? "Unban User" : "Suspend User"}
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(u._id)}
                            disabled={isSelf}
                            className="rounded-md p-[7px] text-[var(--admin-text-secondary)] transition hover:bg-[var(--admin-danger-bg)] hover:text-[var(--admin-danger)] border border-transparent hover:border-[#FECACA] disabled:cursor-not-allowed disabled:opacity-30"
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
          <div className="flex items-center justify-between border-t border-[var(--admin-border)] bg-[var(--admin-surface)] px-[24px] py-[12px]">
            <p className="text-[13px] text-[var(--admin-text-secondary)]">
              Showing page <span className="font-medium text-[var(--admin-text-primary)]">{pagination.page}</span> of{" "}
              <span className="font-medium text-[var(--admin-text-primary)]">{pagination.pages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-[12px] py-[6px] text-[13px] font-medium text-[var(--admin-text-primary)] transition hover:bg-[var(--admin-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-[12px] py-[6px] text-[13px] font-medium text-[var(--admin-text-primary)] transition hover:bg-[var(--admin-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
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
