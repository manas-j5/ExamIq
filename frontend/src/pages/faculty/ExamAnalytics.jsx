import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { facultyService } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import Badge from '../../components/Badge';
import {
  ArrowLeft,
  Award,
  Users,
  CheckCircle,
  TrendingUp,
  BarChart2,
  FileSpreadsheet,
} from 'lucide-react';

const ExamAnalytics = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [examId]);

  const fetchResults = async () => {
    try {
      const res = await facultyService.getExamResults(examId);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Generating assessment analytics...
      </div>
    );
  }

  const results = data?.results || [];
  const totalSubmissions = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const passRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;

  const avgScore = totalSubmissions > 0
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalSubmissions)
    : 0;

  const highestScore = totalSubmissions > 0
    ? Math.round(Math.max(...results.map((r) => r.percentage)))
    : 0;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/faculty/exams')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem', gap: '0.4rem' }}
      >
        <ArrowLeft size={14} /> Back to Exams
      </button>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#818CF8' }}>
          PERFORMANCE INTELLIGENCE & EVALUATION
        </span>
        <h1 style={{ fontSize: '1.85rem', marginTop: '0.2rem' }}>
          {data?.examTitle || 'Examination Results'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Summary metrics and student-level grade distribution
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="stats-grid">
        <StatsCard
          title="Submissions"
          value={totalSubmissions}
          subtitle="Students evaluated"
          icon={<Users size={24} />}
          color="var(--primary)"
        />
        <StatsCard
          title="Pass Rate"
          value={`${passRate}%`}
          subtitle={`${passedCount} of ${totalSubmissions} passed`}
          icon={<CheckCircle size={24} />}
          color="var(--accent-emerald)"
        />
        <StatsCard
          title="Class Average"
          value={`${avgScore}%`}
          subtitle="Mean percentage score"
          icon={<TrendingUp size={24} />}
          color="var(--accent-amber)"
        />
        <StatsCard
          title="Highest Score"
          value={`${highestScore}%`}
          subtitle="Top performer score"
          icon={<Award size={24} />}
          color="var(--accent-cyan)"
        />
      </div>

      {/* Results Table */}
      <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Student Evaluation Roster</h2>

      {results.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <BarChart2 size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No submissions recorded yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Results will appear here automatically when students submit their tests.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Candidate</th>
                <th>Submission Time</th>
                <th>Marks Scored</th>
                <th>Percentage</th>
                <th>Evaluation</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.studentName}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {r.studentEmail}
                    </div>
                  </td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>
                    <strong>{r.marksObtained}</strong> / {r.totalMarks}
                  </td>
                  <td>
                    <strong style={{ color: r.passed ? '#10B981' : '#EF4444' }}>
                      {Math.round(r.percentage)}%
                    </strong>
                  </td>
                  <td>
                    <Badge status={r.passed ? 'PASSED' : 'FAILED'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExamAnalytics;
