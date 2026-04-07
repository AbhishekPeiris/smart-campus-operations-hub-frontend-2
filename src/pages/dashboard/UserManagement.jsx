import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllUsers, updateUserStatus, updateUserRole } from "../../api/users";
import { register } from "../../api/auth";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import Pagination from "../../components/common/Pagination";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Modal from "../../components/common/Modal";
import { formatDate, USER_ROLES } from "../../utils/constants";
import { Plus, Search, UserCheck, UserX, Shield } from "lucide-react";

export default function UserManagement() {
  const { user } = useAuth();
  const [data, setData] = useState({ content: [], totalPages: 0, currentPage: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedUser, setSelectedUser] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [newUser, setNewUser] = useState({
    fullName: "", universityEmailAddress: "", password: "", contactNumber: "",
    role: user?.role === "TECHNICIAN" ? "USER" : "TECHNICIAN",
  });

  // Role change
  const [roleModal, setRoleModal] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [changingRole, setChangingRole] = useState(false);

  const load = (p) => {
    setLoading(true);
    getAllUsers(p, 15)
      .then((res) => setData(res.data.data || { content: [] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  const isEnabled = (u) => (u.accountEnabled ?? u.enabled) !== false;

  const toggleStatus = async (userId, currentEnabled) => {
    try {
      await updateUserStatus(userId, !currentEnabled);
      setData((prev) => ({
        ...prev,
        content: (prev.content || []).map((u) => {
          if (u.id !== userId) return u;
          return { ...u, accountEnabled: !currentEnabled, enabled: !currentEnabled };
        }),
      }));
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => ({ ...prev, accountEnabled: !currentEnabled, enabled: !currentEnabled }));
      }
    } catch {}
  };

  const openRoleModal = (u) => {
    setRoleModal(u);
    setNewRole(u.role);
  };

  const handleRoleChange = async () => {
    if (!roleModal || !newRole || newRole === roleModal.role) return;
    setChangingRole(true);
    try {
      await updateUserRole(roleModal.id, newRole);
      setData(prev => ({
        ...prev,
        content: (prev.content || []).map(u => u.id === roleModal.id ? { ...u, role: newRole } : u)
      }));
      setRoleModal(null);
    } catch {} finally { setChangingRole(false); }
  };

  const openUserDetails = (u) => { setSelectedUser(u); setDetailOpen(true); };

  const addRoleOptions = user?.role === "ADMIN"
    ? [{ value: "TECHNICIAN", label: "Technician" }, { value: "ADMIN", label: "Admin" }, { value: "USER", label: "User" }]
    : [{ value: "USER", label: "User" }];

  const openAddModal = () => {
    const defaultRole = user?.role === "ADMIN" ? "TECHNICIAN" : "USER";
    setNewUser({ fullName: "", universityEmailAddress: "", password: "", contactNumber: "", role: defaultRole });
    setAddError("");
    setAddOpen(true);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError("");
    setAdding(true);
    const payload = {
      fullName: newUser.fullName, universityEmailAddress: newUser.universityEmailAddress,
      password: newUser.password, contactNumber: newUser.contactNumber,
      role: user?.role === "TECHNICIAN" ? "USER" : newUser.role,
    };
    try {
      await register(payload);
      setAddOpen(false);
      load(page);
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to create user");
    } finally { setAdding(false); }
  };

  const roleBadge = (role) => {
    const map = { ADMIN: "bg-violet-100 text-violet-700", TECHNICIAN: "bg-blue-100 text-blue-700", USER: "bg-slate-100 text-slate-600" };
    return map[role] || map.USER;
  };

  let filtered = data.content || [];
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(u => String(u.fullName || "").toLowerCase().includes(q) || String(u.universityEmailAddress || "").toLowerCase().includes(q));
  }
  if (roleFilter !== "ALL") filtered = filtered.filter(u => u.role === roleFilter);
  if (statusFilter !== "ALL") filtered = filtered.filter(u => statusFilter === "ACTIVE" ? isEnabled(u) : !isEnabled(u));

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3">
        <h1 className="text-lg font-semibold">User Management</h1>
        <Button onClick={openAddModal}><Plus size={14} className="mr-1" />Add New User</Button>
      </div>

      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or email" />
          </div>
          <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            options={[{ value: "ALL", label: "All Roles" }, { value: "ADMIN", label: "Admin" }, { value: "TECHNICIAN", label: "Technician" }, { value: "USER", label: "User" }]} />
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            options={[{ value: "ALL", label: "All Statuses" }, { value: "ACTIVE", label: "Active" }, { value: "DISABLED", label: "Disabled" }]} />
        </div>
        <div className="mt-3 text-xs text-text-muted flex items-center gap-2">
          <Search size={12} />Showing {filtered.length} user(s) on this page
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-alt text-xs text-text-muted">
                    <th className="text-left px-4 py-2 font-medium">Name</th>
                    <th className="text-left px-4 py-2 font-medium">Email</th>
                    <th className="text-left px-4 py-2 font-medium">Role</th>
                    <th className="text-left px-4 py-2 font-medium">Status</th>
                    <th className="text-left px-4 py-2 font-medium">Joined</th>
                    <th className="text-left px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-surface-alt/50 cursor-pointer" onClick={() => openUserDetails(u)}>
                      <td className="px-4 py-2.5 font-medium">{u.fullName}</td>
                      <td className="px-4 py-2.5 text-xs text-text-muted">{u.universityEmailAddress}</td>
                      <td className="px-4 py-2.5"><Badge className={roleBadge(u.role)}>{u.role}</Badge></td>
                      <td className="px-4 py-2.5">
                        <Badge className={isEnabled(u) ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                          {isEnabled(u) ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-text-muted">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          {user?.role === 'ADMIN' && (
                            <button onClick={() => openRoleModal(u)} className="p-1.5 rounded hover:bg-surface-alt text-text-muted hover:text-violet-600" title="Change Role">
                              <Shield size={13} />
                            </button>
                          )}
                          <Button size="sm" variant={isEnabled(u) ? "danger" : "success"} onClick={() => toggleStatus(u.id, isEnabled(u))}>
                            {isEnabled(u) ? <><UserX size={13} className="mr-1" />Disable</> : <><UserCheck size={13} className="mr-1" />Enable</>}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-3">
              <Pagination currentPage={data.currentPage || 0} totalPages={data.totalPages || 0} onPageChange={setPage} />
            </div>
          </>
        )}
      </Card>

      {/* User Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="User Details" size="md">
        {selectedUser ? (
          <div className="space-y-3">
            <div><p className="text-xs text-text-muted">Full Name</p><p className="text-sm font-medium">{selectedUser.fullName || "—"}</p></div>
            <div><p className="text-xs text-text-muted">Email</p><p className="text-sm font-medium">{selectedUser.universityEmailAddress || "—"}</p></div>
            <div><p className="text-xs text-text-muted">Contact Number</p><p className="text-sm font-medium">{selectedUser.contactNumber || "—"}</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-text-muted">Role</p><div className="mt-1"><Badge className={roleBadge(selectedUser.role)}>{selectedUser.role || "—"}</Badge></div></div>
              <div><p className="text-xs text-text-muted">Status</p><div className="mt-1"><Badge className={isEnabled(selectedUser) ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>{isEnabled(selectedUser) ? "Active" : "Disabled"}</Badge></div></div>
            </div>
            <div><p className="text-xs text-text-muted">Joined</p><p className="text-sm font-medium">{formatDate(selectedUser.createdAt)}</p></div>
          </div>
        ) : null}
      </Modal>

      {/* Add User Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New User" size="md">
        <form onSubmit={handleAddUser} className="space-y-3">
          {addError && <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-danger">{addError}</div>}
          <Input label="Full Name" value={newUser.fullName} onChange={e => setNewUser(p => ({ ...p, fullName: e.target.value }))} required />
          <Input label="University Email" type="email" value={newUser.universityEmailAddress} onChange={e => setNewUser(p => ({ ...p, universityEmailAddress: e.target.value }))} required />
          <Input label="Password" type="password" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} placeholder="Minimum 6 characters" required />
          <Input label="Contact Number" value={newUser.contactNumber} onChange={e => setNewUser(p => ({ ...p, contactNumber: e.target.value }))} />
          <Select label="Role" options={addRoleOptions} value={user?.role === "TECHNICIAN" ? "USER" : newUser.role}
            onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))} disabled={user?.role === "TECHNICIAN"} required />
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={adding}>{adding ? "Creating..." : "Create User"}</Button>
          </div>
        </form>
      </Modal>

      {/* Role Change Modal */}
      <Modal open={!!roleModal} onClose={() => setRoleModal(null)} title="Change User Role" size="sm">
        {roleModal && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">Change role for <strong>{roleModal.fullName}</strong></p>
            <select value={newRole} onChange={e => setNewRole(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-white">
              {USER_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setRoleModal(null)}>Cancel</Button>
              <Button size="sm" onClick={handleRoleChange} disabled={changingRole || newRole === roleModal.role}>
                {changingRole ? "Updating..." : "Update Role"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
