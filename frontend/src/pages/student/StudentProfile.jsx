import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/StatsCard';
import { User, Mail, Shield, Calendar, Award, CheckCircle, FileText } from 'lucide-react';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await studentService.getProfile();
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Academic Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Personal credentials and student progress telemetry
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: '800',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>

          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{user?.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={15} /> {user?.email}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Shield size={15} color="#818CF8" /> Role: {user?.role}
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Account ID</span>
            <strong>#STU-{user?.id || 100}</strong>
          </div>
          <div>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>System Status</span>
            <strong style={{ color: '#10B981' }}>Active & Enrolled</strong>
          </div>
          <div>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Security Protocol</span>
            <strong>JWT + BCrypt Encrypted</strong>
          </div>
        </div>
      </div>

      {/* Progress Telemetry */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Academic Performance Summary</h3>
      <div className="stats-grid">
        <StatsCard
          title="Total Attempts"
          value={profile?.totalAttempts || 0}
          subtitle="Tests completed"
          icon={<FileText size={24} />}
          color="var(--primary)"
        />
        <StatsCard
          title="Exams Passed"
          value={profile?.passedAttempts || 0}
          subtitle="Passed passing score"
          icon={<CheckCircle size={24} />}
          color="var(--accent-emerald)"
        />
        <StatsCard
          title="Average Score"
          value={`${profile?.averageScore ? Math.round(profile.averageScore) : 0}%`}
          subtitle="Overall weighted average"
          icon={<Award size={24} />}
          color="var(--accent-amber)"
        />
      </div>
    </div>
  );
};

export default StudentProfile;
