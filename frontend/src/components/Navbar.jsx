import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Shield, GraduationCap, BookOpen } from 'lucide-react';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    if (role === 'ADMIN') {
      return (
        <span className="badge badge-danger">
          <Shield size={12} /> Admin
        </span>
      );
    }
    if (role === 'FACULTY') {
      return (
        <span className="badge badge-warning">
          <BookOpen size={12} /> Faculty
        </span>
      );
    }
    return (
      <span className="badge badge-primary">
        <GraduationCap size={12} /> Student
      </span>
    );
  };

  return (
    <header
      style={{
        height: '70px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'rgba(13, 19, 31, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <GraduationCap size={24} color="#FFFFFF" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', lineHeight: 1.1 }}>
            Exami<span style={{ color: '#818CF8' }}>Q</span>
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            DIGITAL EXAM PORTAL
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {getRoleBadge()}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.4rem 0.8rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.85rem',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              {user?.name || 'User'}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {user?.email}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-secondary btn-sm"
          title="Sign out"
          style={{ gap: '0.4rem' }}
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
