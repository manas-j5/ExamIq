import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Award,
  User,
  PlusCircle,
  HelpCircle,
  Activity,
  Users,
  Layers,
  Server,
  BookOpen,
} from 'lucide-react';

const Sidebar = () => {
  const { role } = useAuth();

  const getNavLinks = () => {
    if (role === 'ADMIN') {
      return [
        { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { to: '/admin/users', label: 'User Directory', icon: <Users size={18} /> },
        { to: '/admin/academics', label: 'Courses & Subjects', icon: <Layers size={18} /> },
        { to: '/admin/overview', label: 'System Overview', icon: <Server size={18} /> },
      ];
    }
    if (role === 'FACULTY') {
      return [
        { to: '/faculty/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { to: '/faculty/exams', label: 'Manage Exams', icon: <FileText size={18} /> },
        { to: '/faculty/questions', label: 'Question Bank', icon: <HelpCircle size={18} /> },
        { to: '/faculty/monitoring', label: 'Live Monitoring', icon: <Activity size={18} /> },
      ];
    }
    // Student
    return [
      { to: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { to: '/student/exams', label: 'Available Exams', icon: <FileText size={18} /> },
      { to: '/student/results', label: 'My Results', icon: <Award size={18} /> },
      { to: '/student/profile', label: 'My Profile', icon: <User size={18} /> },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        flexShrink: 0,
      }}
    >
      <div style={{ marginBottom: '1.5rem', padding: '0 0.75rem' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
          }}
        >
          Navigation Menu
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        {navLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`
            }
            style={({ isActive }) => ({
              justifyContent: 'flex-start',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: isActive ? '600' : '500',
              color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
              backgroundColor: isActive
                ? 'var(--primary)'
                : 'transparent',
              border: isActive ? 'none' : '1px solid transparent',
              transition: 'all 0.2s ease',
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Role Notice at bottom */}
      <div
        style={{
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          lineHeight: '1.4',
        }}
      >
        <span style={{ display: 'block', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
          Role: {role}
        </span>
        Authorized session under academic security protocols.
      </div>
    </aside>
  );
};

export default Sidebar;
