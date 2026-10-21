import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import Badge from '../../components/Badge';
import {
  FileText,
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Play,
  RotateCcw,
} from 'lucide-react';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(false);
      const res = await studentService.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Loading student dashboard...
      </div>
    );
  }

  const ongoingAttempt = data?.ongoingAttempt;
  const availableExams = data?.availableExams || [];
  const recentResults = data?.recentResults || [];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>
          Student Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Monitor your ongoing tests, upcoming assessments, and past performance.
        </p>
      </div>

      {/* Ongoing Attempt Recovery Banner */}
      {ongoingAttempt && (
        <div
          className="glass-card"
          style={{
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                animation: 'pulse 2s infinite',
              }}
            >
              <RotateCcw size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#FFF' }}>
                  In-Progress Exam: {ongoingAttempt.examTitle}
                </h3>
                <Badge status="IN_PROGRESS" />
              </div>
              <span style={{ fontSize: '0.85rem', color: '#C7D2FE' }}>
                Started at {new Date(ongoingAttempt.startTime).toLocaleTimeString()} • Answers saved automatically
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/student/exam/${ongoingAttempt.examId}/live`)}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', gap: '0.5rem' }}
          >
            <Play size={16} /> Resume Examination
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="stats-grid">
        <StatsCard
          title="Total Attempts"
          value={data?.totalAttempts || 0}
          subtitle="All examinations completed"
          icon={<FileText size={24} />}
          color="var(--primary)"
        />
        <StatsCard
          title="Exams Passed"
          value={data?.passedAttempts || 0}
          subtitle="Passed passing criteria"
          icon={<CheckCircle size={24} />}
          color="var(--accent-emerald)"
        />
        <StatsCard
          title="Average Score"
          value={`${data?.averageScore ? Math.round(data.averageScore) : 0}%`}
          subtitle="Overall performance index"
          icon={<Award size={24} />}
          color="var(--accent-amber)"
        />
        <StatsCard
          title="Available Exams"
          value={availableExams.length}
          subtitle="Ready to be taken"
          icon={<Clock size={24} />}
          color="var(--accent-cyan)"
        />
      </div>

      {/* Available Exams Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Available Examinations</h2>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Select an exam to read instructions and begin
            </span>
          </div>
          <button
            onClick={() => navigate('/student/exams')}
            className="btn btn-secondary btn-sm"
          >
            View All ({availableExams.length}) <ArrowRight size={14} />
          </button>
        </div>

        {availableExams.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>No examinations scheduled</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Check back later when faculty schedules new assessments.
            </p>
          </div>
        ) : (
          <div className="card-grid">
            {availableExams.slice(0, 3).map((exam) => (
              <div key={exam.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#818CF8' }}>
                      {exam.subjectCode || 'ACADEMIC'}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', marginTop: '0.2rem' }}>{exam.title}</h3>
                  </div>
                  <Badge status={exam.status} />
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flex: 1, marginBottom: '1.25rem' }}>
                  {exam.description || 'Comprehensive evaluation of subject matter.'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                  }}
                >
                  <span>Duration: <strong>{exam.durationMinutes} mins</strong></span>
                  <span>Total Marks: <strong>{exam.totalMarks}</strong></span>
                </div>

                <button
                  onClick={() => navigate(`/student/exam/${exam.id}/instructions`)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', gap: '0.5rem' }}
                >
                  <Play size={14} /> Take Exam
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Results Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Recent Results</h2>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Your latest graded assessments
            </span>
          </div>
          <button
            onClick={() => navigate('/student/results')}
            className="btn btn-secondary btn-sm"
          >
            All Results <ArrowRight size={14} />
          </button>
        </div>

        {recentResults.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              You haven't completed any examinations yet.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exam Title</th>
                  <th>Submitted At</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentResults.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.examTitle}</strong></td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>{r.marksObtained} / {r.totalMarks}</td>
                    <td><strong>{Math.round(r.percentage)}%</strong></td>
                    <td><Badge status={r.passed ? 'PASSED' : 'FAILED'} /></td>
                    <td>
                      <button
                        onClick={() => navigate(`/student/results/${r.id}`)}
                        className="btn btn-secondary btn-sm"
                      >
                        Review
                      </button>
                    </td>
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

export default StudentDashboard;
