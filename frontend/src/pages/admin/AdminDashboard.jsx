import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import Badge from '../../components/Badge';
import {
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  FileText,
  Shield,
  Server,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await adminService.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const recentUsers = data?.recentUsers || [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Administrator Console</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            System-wide analytics, user authorization, and academic course catalogs
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/admin/users')} className="btn btn-secondary">
            <Users size={16} /> Directory
          </button>
          <button onClick={() => navigate('/admin/academics')} className="btn btn-primary">
            <Layers size={16} /> Course Management
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <StatsCard
          title="Total Users"
          value={data?.totalUsers || 0}
          subtitle="Registered accounts"
          icon={<Users size={24} />}
          color="var(--primary)"
        />
        <StatsCard
          title="Students"
          value={data?.totalStudents || 0}
          subtitle="Active candidates"
          icon={<GraduationCap size={24} />}
          color="var(--accent-emerald)"
        />
        <StatsCard
          title="Faculty Members"
          value={data?.totalFaculty || 0}
          subtitle="Instructors & proctors"
          icon={<BookOpen size={24} />}
          color="var(--accent-amber)"
        />
        <StatsCard
          title="Academic Courses"
          value={data?.totalCourses || 0}
          subtitle={`${data?.totalSubjects || 0} subjects enrolled`}
          icon={<Layers size={24} />}
          color="var(--accent-cyan)"
        />
      </div>

      {/* Recent Users List */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Recent User Registrations</h2>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Latest accounts created in the system
            </span>
          </div>
          <button
            onClick={() => navigate('/admin/users')}
            className="btn btn-secondary btn-sm"
          >
            Manage All Users <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading users data...
          </div>
        ) : recentUsers.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No accounts registered yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Full Name</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><Badge status={u.role} /></td>
                    <td>
                      <span style={{ color: u.active ? '#10B981' : '#EF4444', fontWeight: '600', fontSize: '0.85rem' }}>
                        {u.active ? '● Active' : '○ Disabled'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
