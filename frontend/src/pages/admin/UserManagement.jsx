import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import {
  Users,
  UserPlus,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Lock,
  Mail,
  User,
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });

  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers(roleFilter === 'ALL' ? undefined : roleFilter);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load user directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      addToast('Please fill out all fields', 'warning');
      return;
    }

    try {
      await adminService.createUser(formData);
      addToast(`User ${formData.name} created successfully!`, 'success');
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'STUDENT' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to create user', 'error');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.active;
      await adminService.updateUserStatus(user.id, newStatus);
      addToast(`User account ${newStatus ? 'activated' : 'disabled'}`, 'success');
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, active: newStatus } : u))
      );
    } catch (err) {
      console.error(err);
      addToast('Failed to change user status', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteUser(deleteTarget.id);
      addToast('User deleted from database', 'success');
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      addToast('Failed to delete user', 'error');
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>User Directory & Access Control</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage student candidates, faculty instructors, and administrator privileges
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary"
          style={{ gap: '0.5rem' }}
        >
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      {/* Filters and Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'STUDENT', 'FACULTY', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`btn ${roleFilter === r ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              {r}
            </button>
          ))}
        </div>

        <div style={{ width: '320px', position: 'relative' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading user records...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No users found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            No accounts matching the selected criteria.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Candidate</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {u.email}
                    </div>
                  </td>
                  <td><Badge status={u.role} /></td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: u.active ? '#10B981' : '#EF4444',
                        fontWeight: '600',
                        fontSize: '0.825rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                      title="Click to toggle account status"
                    >
                      {u.active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {u.active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => setDeleteTarget(u)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#EF4444' }}
                      title="Delete User"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision New System User"
      >
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Dr. Robert Vance"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@university.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              className="form-input"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">System Role *</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="STUDENT">Student Candidate</option>
              <option value="FACULTY">Faculty Instructor</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Provision User
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm User Account Deletion"
      >
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Are you sure you want to permanently delete user <strong>"{deleteTarget?.name}" ({deleteTarget?.email})</strong>?
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleDeleteUser} className="btn btn-danger">
              Delete User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
