import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import axios from 'axios';
import {
  Server,
  Database,
  ShieldCheck,
  Cpu,
  Activity,
  CheckCircle2,
  RefreshCw,
  Terminal,
} from 'lucide-react';

const SystemOverview = () => {
  const [data, setData] = useState(null);
  const [healthStatus, setHealthStatus] = useState('Checking...');
  const [pingTime, setPingTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
    pingBackend();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await adminService.getSystemOverview();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pingBackend = async () => {
    const start = performance.now();
    try {
      const res = await axios.get('/api/test/health');
      const diff = Math.round(performance.now() - start);
      setHealthStatus(res.data?.status || 'ONLINE');
      setPingTime(diff);
    } catch (err) {
      setHealthStatus('DEGRADED / CONNECTING');
      setPingTime(null);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>System Architecture & Health</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Infrastructure telemetry, microservice connectivity, and security configuration
          </p>
        </div>

        <button onClick={pingBackend} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
          <RefreshCw size={14} /> Ping Microservices
        </button>
      </div>

      {/* Health Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Server size={20} color="#10B981" />
            <h4 style={{ fontSize: '0.95rem' }}>Spring Web API</h4>
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: '700', color: '#10B981', display: 'block' }}>
            {healthStatus}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Port 8080 • Latency: {pingTime !== null ? `${pingTime}ms` : 'Local'}
          </span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Database size={20} color="#06B6D4" />
            <h4 style={{ fontSize: '0.95rem' }}>MySQL Database</h4>
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: '700', color: '#06B6D4', display: 'block' }}>
            {data?.databaseStatus || 'CONNECTED'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Hibernate DDL: update • Port 3306
          </span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <ShieldCheck size={20} color="#818CF8" />
            <h4 style={{ fontSize: '0.95rem' }}>Security Protocol</h4>
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: '700', color: '#818CF8', display: 'block' }}>
            JWT HS256
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            BCrypt 10 rounds • Stateless Auth
          </span>
        </div>
      </div>

      {/* System Telemetry Specifications */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={20} color="#818CF8" /> Application Stack Specifications
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Frontend Framework:</span>
              <strong>React 19 + Vite (ESM)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Routing & Navigation:</span>
              <strong>React Router v7</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>HTTP Client:</span>
              <strong>Axios (with JWT Interceptors)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Design System:</span>
              <strong>CSS3 Custom Properties & Glassmorphism</strong>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Backend Engine:</span>
              <strong>Java 22 + Spring Boot 3.3.4</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>ORM Layer:</span>
              <strong>Spring Data JPA (Hibernate 6)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Proctoring Engine:</span>
              <strong>Full-screen & Tab Blur Tracker</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Build Automator:</span>
              <strong>Apache Maven 3.9.6</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;
