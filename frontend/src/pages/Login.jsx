import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GraduationCap, Lock, Mail, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'warning');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      addToast(`Welcome back, ${user.name}!`, 'success');

      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'FACULTY') navigate('/faculty/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      console.error(err);
      let msg = 'Invalid email or password';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.response?.status === 404 || err.code === 'ERR_NETWORK' || !err.response) {
        msg = 'Backend server not connected! Please deploy your backend on Render and set VITE_API_URL.';
      }
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.15), transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(6, 182, 212, 0.1), transparent 50%), #0A0E17',
      }}
    >
      {/* Left Hero Graphic Section */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem 5rem',
          borderRight: '1px solid var(--border-color)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <GraduationCap size={28} color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
            Exami<span style={{ color: '#818CF8' }}>Q</span>
          </h1>
        </div>

        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: 1.2, marginBottom: '1.25rem' }}>
          Secure, Dynamic & <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #818CF8 0%, #C084FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Intelligent Examination
          </span>
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '480px', marginBottom: '2.5rem' }}>
          Conduct academic tests with full anti-cheating proctoring, instant automated grading, question banks, and live attempt monitoring.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '440px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#E5E7EB' }}>
            <CheckCircle2 size={18} color="#10B981" />
            <span style={{ fontSize: '0.9rem' }}>Real-time full-screen & tab-switch violation tracking</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#E5E7EB' }}>
            <CheckCircle2 size={18} color="#10B981" />
            <span style={{ fontSize: '0.9rem' }}>Auto-save answers with live countdown synchronization</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#E5E7EB' }}>
            <CheckCircle2 size={18} color="#10B981" />
            <span style={{ fontSize: '0.9rem' }}>Instant score computation and question-level review</span>
          </div>
        </div>

        <div
          style={{
            marginTop: '3.5rem',
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            maxWidth: '460px',
          }}
        >
          <ShieldCheck size={28} color="#818CF8" />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: '#FFFFFF', display: 'block' }}>Enterprise Security Standard</strong>
            JWT token-based authorization and BCrypt encryption.
          </div>
        </div>
      </div>

      {/* Right Login Form Section */}
      <div
        style={{
          width: '540px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3.5rem',
        }}
      >
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Sign In</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Access your academic examination dashboard
          </p>

          {/* Quick Fill Demo Accounts */}
          <div style={{ marginBottom: '1.75rem' }}>
            <span
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
              }}
            >
              Quick-Fill Demo Credentials:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickFill('admin@exam.com', 'admin123')}
                style={{ flex: 1, fontSize: '0.75rem' }}
              >
                Admin
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickFill('faculty@exam.com', 'faculty123')}
                style={{ flex: 1, fontSize: '0.75rem' }}
              >
                Faculty
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickFill('student@exam.com', 'student123')}
                style={{ flex: 1, fontSize: '0.75rem' }}
              >
                Student
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
