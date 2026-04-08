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
    <div className="app-page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Identity Governance</p>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">
            Manage account status, view user details, and update roles using the backend role catalogue.
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus size={14} />
          Add New User
        </Button>
      </div>

      <Card className="toolbar-panel">
        <div className="filter-grid">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email"
          />
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
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          <Search size={12} />
          Showing {filteredUsers.length} user(s) on this page
        </div>
      </Card>

      <Card className="section-card">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
        ) : (
          <>
            <div className="app-table-wrap">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((account) => (
                    <tr
                      key={account.id}
                      className="cursor-pointer"
                      onClick={() => openUserDetails(account)}
                    >
                      <td className="font-semibold text-text-primary">{account.fullName}</td>
                      <td className="text-xs text-text-muted">{account.universityEmailAddress}</td>
                      <td>
                        <Badge className={roleBadge(account.role)}>{account.role}</Badge>
                      </td>
                      <td>
                        <Badge className={isEnabled(account) ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                          {isEnabled(account) ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="text-xs text-text-muted">{formatDate(account.createdAt)}</td>
                      <td>
                        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                          <button
                            onClick={() => openRoleModal(account)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-violet-200 bg-violet-50 text-violet-700 transition-colors hover:bg-violet-100"
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
                                <UserX size={13} />
                                Disable
                              </>
                            ) : (
                              <>
                                <UserCheck size={13} />
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
            <div className="px-5 pb-4">
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
          <div className="space-y-5">
            <div className="detail-grid">
              <div className="detail-tile">
                <p className="detail-tile__label">Full Name</p>
                <p className="detail-tile__value">{selectedUser.fullName || '-'}</p>
              </div>
              <div className="detail-tile">
                <p className="detail-tile__label">Email</p>
                <p className="detail-tile__value">{selectedUser.universityEmailAddress || '-'}</p>
              </div>
              <div className="detail-tile">
                <p className="detail-tile__label">Contact Number</p>
                <p className="detail-tile__value">{selectedUser.contactNumber || '-'}</p>
              </div>
              <div className="detail-tile">
                <p className="detail-tile__label">Joined</p>
                <p className="detail-tile__value">{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={roleBadge(selectedUser.role)}>{selectedUser.role || '-'}</Badge>
              <Badge className={isEnabled(selectedUser) ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                {isEnabled(selectedUser) ? 'Active' : 'Disabled'}
              </Badge>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New User" size="md">
        <form onSubmit={handleAddUser} className="space-y-4">
          {addError && (
            <div className="soft-alert border-red-200 bg-red-50 text-danger">
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
          <div className="flex justify-end gap-2 pt-2">
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
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Change role for <strong>{roleModal.fullName}</strong>
            </p>
            <select
              value={newRole}
              onChange={(event) => setNewRole(event.target.value)}
              className="w-full px-4 py-3 text-sm"
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
