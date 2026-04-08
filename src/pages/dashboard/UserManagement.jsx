import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Shield, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { register } from '../../api/auth';
import {
  getAllUsers,
  getAvailableRoles,
  updateUserRole,
  updateUserStatus,
} from '../../api/users';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import { formatDate, USER_ROLES } from '../../utils/constants';
import {
  extractApiData,
  normalizePaginatedData,
  normalizeUser,
} from '../../utils/apiData';

const fallbackRoleOptions = USER_ROLES;

const toRoleOption = (role) => {
  if (!role) return null;
  if (typeof role === 'string') {
    return {
      value: role,
      label: role.charAt(0) + role.slice(1).toLowerCase(),
    };
  }

  const value = role.value || role.role || role.name;
  if (!value) return null;

  return {
    value,
    label: role.label || (value.charAt(0) + value.slice(1).toLowerCase()),
  };
};

export default function UserManagement() {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState({ content: [], totalPages: 0, currentPage: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleOptions, setRoleOptions] = useState(fallbackRoleOptions);
  const [rolesLoading, setRolesLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [newUser, setNewUser] = useState({
    fullName: '',
    universityEmailAddress: '',
    password: '',
    contactNumber: '',
    role: 'TECHNICIAN',
  });

  const [roleModal, setRoleModal] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [changingRole, setChangingRole] = useState(false);

  const loadUsers = (nextPage) => {
    setLoading(true);
    getAllUsers(nextPage, 15)
      .then((res) => {
        setData(normalizePaginatedData(extractApiData(res), normalizeUser));
      })
      .catch((err) => {
        console.error('Failed to load users:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers(page);
  }, [page]);

  useEffect(() => {
    setRolesLoading(true);
    getAvailableRoles()
      .then((res) => {
        const payload = extractApiData(res);
        const values = Array.isArray(payload) ? payload : payload?.roles || payload?.availableRoles || [];
        const nextRoleOptions = values.map(toRoleOption).filter(Boolean);
        if (nextRoleOptions.length > 0) setRoleOptions(nextRoleOptions);
      })
      .catch((err) => {
        console.error('Failed to load roles:', err);
        setRoleOptions(fallbackRoleOptions);
      })
      .finally(() => setRolesLoading(false));
  }, []);

  const isEnabled = (account) => (account.accountEnabled ?? account.enabled) !== false;

  const toggleStatus = async (userId, currentEnabled) => {
    try {
      await updateUserStatus(userId, !currentEnabled);
      setData((prev) => ({
        ...prev,
        content: prev.content.map((item) => (
          item.id === userId
            ? { ...item, accountEnabled: !currentEnabled, enabled: !currentEnabled }
            : item
        )),
      }));
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => ({ ...prev, accountEnabled: !currentEnabled, enabled: !currentEnabled }));
      }
    } catch (err) {
      console.error('Failed to update user status:', err);
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const openRoleModal = (account) => {
    setRoleModal(account);
    setNewRole(account.role);
  };

  const handleRoleChange = async () => {
    if (!roleModal || !newRole || newRole === roleModal.role) return;

    setChangingRole(true);
    try {
      await updateUserRole(roleModal.id, newRole);
      setData((prev) => ({
        ...prev,
        content: prev.content.map((item) => (
          item.id === roleModal.id ? { ...item, role: newRole } : item
        )),
      }));
      if (selectedUser?.id === roleModal.id) {
        setSelectedUser((prev) => ({ ...prev, role: newRole }));
      }
      if (user?.id === roleModal.id) {
        updateUser({ role: newRole });
      }
      setRoleModal(null);
    } catch (err) {
      console.error('Failed to update user role:', err);
      alert(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setChangingRole(false);
    }
  };

  const openUserDetails = (account) => {
    setSelectedUser(account);
    setDetailOpen(true);
  };

  const openAddModal = () => {
    const defaultRole = roleOptions[0]?.value || 'TECHNICIAN';
    setNewUser({
      fullName: '',
      universityEmailAddress: '',
      password: '',
      contactNumber: '',
      role: defaultRole,
    });
    setAddError('');
    setAddOpen(true);
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    setAddError('');
    setAdding(true);

    try {
      await register(newUser);
      setAddOpen(false);
      loadUsers(page);
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setAdding(false);
    }
  };

  const roleBadge = (role) => {
    const map = {
      ADMIN: 'bg-violet-100 text-violet-700',
      TECHNICIAN: 'bg-blue-100 text-blue-700',
      USER: 'bg-slate-100 text-slate-600',
    };
    return map[role] || map.USER;
  };

  const filteredUsers = useMemo(() => {
    let nextUsers = data.content || [];

    if (query.trim()) {
      const lowered = query.trim().toLowerCase();
      nextUsers = nextUsers.filter((account) => (
        String(account.fullName || '').toLowerCase().includes(lowered)
        || String(account.universityEmailAddress || '').toLowerCase().includes(lowered)
      ));
    }

    if (roleFilter !== 'ALL') nextUsers = nextUsers.filter((account) => account.role === roleFilter);
    if (statusFilter !== 'ALL') {
      nextUsers = nextUsers.filter((account) => (
        statusFilter === 'ACTIVE' ? isEnabled(account) : !isEnabled(account)
      ));
    }

    return nextUsers;
  }, [data.content, query, roleFilter, statusFilter]);

  const filterRoleOptions = [{ value: 'ALL', label: 'All Roles' }, ...roleOptions];

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3">
        <div>
          <h1 className="text-lg font-semibold">User Management</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Manage account status and update roles using the backend role catalogue.
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus size={14} className="mr-1" />
          Add New User
        </Button>
      </div>

      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or email"
            />
          </div>
          <Select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            options={filterRoleOptions}
            disabled={rolesLoading}
          />
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'DISABLED', label: 'Disabled' },
            ]}
          />
        </div>
        <div className="mt-3 text-xs text-text-muted flex items-center gap-2">
          <Search size={12} />
          Showing {filteredUsers.length} user(s) on this page
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
                  {filteredUsers.map((account) => (
                    <tr
                      key={account.id}
                      className="hover:bg-surface-alt/50 cursor-pointer"
                      onClick={() => openUserDetails(account)}
                    >
                      <td className="px-4 py-2.5 font-medium">{account.fullName}</td>
                      <td className="px-4 py-2.5 text-xs text-text-muted">{account.universityEmailAddress}</td>
                      <td className="px-4 py-2.5">
                        <Badge className={roleBadge(account.role)}>{account.role}</Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge className={isEnabled(account) ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                          {isEnabled(account) ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-text-muted">{formatDate(account.createdAt)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                          <button
                            onClick={() => openRoleModal(account)}
                            className="p-1.5 rounded hover:bg-surface-alt text-text-muted hover:text-violet-600"
                            title="Change Role"
                          >
                            <Shield size={13} />
                          </button>
                          <Button
                            size="sm"
                            variant={isEnabled(account) ? 'danger' : 'success'}
                            onClick={() => toggleStatus(account.id, isEnabled(account))}
                          >
                            {isEnabled(account) ? (
                              <>
                                <UserX size={13} className="mr-1" />
                                Disable
                              </>
                            ) : (
                              <>
                                <UserCheck size={13} className="mr-1" />
                                Enable
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-3">
              <Pagination
                currentPage={data.currentPage || 0}
                totalPages={data.totalPages || 0}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="User Details" size="md">
        {selectedUser ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-text-muted">Full Name</p>
              <p className="text-sm font-medium">{selectedUser.fullName || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Email</p>
              <p className="text-sm font-medium">{selectedUser.universityEmailAddress || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Contact Number</p>
              <p className="text-sm font-medium">{selectedUser.contactNumber || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted">Role</p>
                <div className="mt-1">
                  <Badge className={roleBadge(selectedUser.role)}>{selectedUser.role || '-'}</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-text-muted">Status</p>
                <div className="mt-1">
                  <Badge className={isEnabled(selectedUser) ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                    {isEnabled(selectedUser) ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-text-muted">Joined</p>
              <p className="text-sm font-medium">{formatDate(selectedUser.createdAt)}</p>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New User" size="md">
        <form onSubmit={handleAddUser} className="space-y-3">
          {addError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-danger">
              {addError}
            </div>
          )}
          <Input
            label="Full Name"
            value={newUser.fullName}
            onChange={(event) => setNewUser((prev) => ({ ...prev, fullName: event.target.value }))}
            required
          />
          <Input
            label="University Email"
            type="email"
            value={newUser.universityEmailAddress}
            onChange={(event) => setNewUser((prev) => ({ ...prev, universityEmailAddress: event.target.value }))}
            required
          />
          <Input
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
          <Input
            label="Contact Number"
            value={newUser.contactNumber}
            onChange={(event) => setNewUser((prev) => ({ ...prev, contactNumber: event.target.value }))}
          />
          <Select
            label="Role"
            options={roleOptions}
            value={newUser.role}
            onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value }))}
            disabled={rolesLoading}
            required
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={adding}>
              {adding ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!roleModal} onClose={() => setRoleModal(null)} title="Change User Role" size="sm">
        {roleModal && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Change role for <strong>{roleModal.fullName}</strong>
            </p>
            <select
              value={newRole}
              onChange={(event) => setNewRole(event.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-white"
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setRoleModal(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleRoleChange} disabled={changingRole || newRole === roleModal.role}>
                {changingRole ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
