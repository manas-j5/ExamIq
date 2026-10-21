import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { facultyService } from '../../services/api';
import Badge from '../../components/Badge';
import {
  Activity,
  ShieldAlert,
  Users,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  FileText,
} from 'lucide-react';

const LiveMonitoring = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(searchParams.get('examId') || '');
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchMonitoringData(selectedExamId);
    }
  }, [selectedExamId]);

  // Polling Interval
  useEffect(() => {
    if (!autoRefresh || !selectedExamId) return;

    const interval = setInterval(() => {
      fetchMonitoringData(selectedExamId);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedExamId]);

  const fetchExams = async () => {
    try {
      const res = await facultyService.getExams();
      setExams(res.data);
      if (res.data.length > 0 && !selectedExamId) {
        setSelectedExamId(String(res.data[0].id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMonitoringData = async (examId) => {
    try {
      const res = await facultyService.getExamMonitoring(examId);
      setAttempts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExamChange = (e) => {
    const id = e.target.value;
    setSelectedExamId(id);
    setSearchParams({ examId: id });
  };

  const selectedExam = exams.find((e) => String(e.id) === String(selectedExamId));
  const activeCount = attempts.filter((a) => a.status === 'IN_PROGRESS').length;
  const violationAlertsCount = attempts.filter((a) => (a.violationCount || 0) > 0).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '1.85rem' }}>Live Proctoring Console</h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#06B6D4',
                fontSize: '0.75rem',
                fontWeight: '700',
              }}
            >
              <Activity size={12} className="pulse" /> LIVE STREAM
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Real-time telemetry, focus detection, and anti-cheating supervision of examinees
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select
            className="form-select"
            style={{ width: '260px' }}
            value={selectedExamId}
            onChange={handleExamChange}
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`btn ${autoRefresh ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={autoRefresh ? 'spin' : ''} />
            {autoRefresh ? 'Auto-Polling: ON' : 'Auto-Polling: PAUSED'}
          </button>
        </div>
      </div>

      {/* Stats Telemetry Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Active Examinees
          </span>
          <h3 style={{ fontSize: '1.75rem', color: '#06B6D4', marginTop: '0.2rem' }}>
            {activeCount} Students
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Currently in examination</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Flagged Violations
          </span>
          <h3 style={{ fontSize: '1.75rem', color: violationAlertsCount > 0 ? '#EF4444' : '#10B981', marginTop: '0.2rem' }}>
            {violationAlertsCount} Candidates
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Triggered tab switches / blur</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Submissions
          </span>
          <h3 style={{ fontSize: '1.75rem', color: '#818CF8', marginTop: '0.2rem' }}>
            {attempts.filter((a) => a.status === 'COMPLETED').length}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Finished & evaluated</span>
        </div>
      </div>

      {/* Examinees Live Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Establishing proctoring stream...
        </div>
      ) : attempts.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No active student sessions</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            When students begin <strong>{selectedExam?.title}</strong>, their live session cards will appear here.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Candidate</th>
                <th>Session Start</th>
                <th>Progress (Answered)</th>
                <th>Anti-Cheating Violations</th>
                <th>Session State</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => {
                const vCount = attempt.violationCount || 0;
                let vBadgeClass = 'badge-success';
                if (vCount >= 3) vBadgeClass = 'badge-danger';
                else if (vCount > 0) vBadgeClass = 'badge-warning';

                return (
                  <tr key={attempt.id}>
                    <td>
                      <div>
                        <strong>{attempt.studentName || 'Student Candidate'}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {attempt.studentEmail || `ID #${attempt.studentId}`}
                        </div>
                      </div>
                    </td>
                    <td>{new Date(attempt.startTime).toLocaleTimeString()}</td>
                    <td>
                      <span style={{ fontWeight: '600' }}>
                        {attempt.answeredCount || 0}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {' '}/ {attempt.totalQuestions || 'All'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${vBadgeClass}`} style={{ gap: '0.35rem' }}>
                        <ShieldAlert size={12} />
                        {vCount === 0 ? '0 (Clean)' : `${vCount} Violations`}
                      </span>
                    </td>
                    <td>
                      <Badge status={attempt.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LiveMonitoring;
