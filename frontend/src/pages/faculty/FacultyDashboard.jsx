import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { facultyService } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import Badge from '../../components/Badge';
import {
  FileText,
  HelpCircle,
  Users,
  Activity,
  PlusCircle,
  ArrowRight,
  Eye,
  Calendar,
} from 'lucide-react';

const FacultyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await facultyService.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exams = data?.recentExams || [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Faculty Control Center</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage curriculum assessments, supervise live attempts, and analyze student performances
          </p>
        </div>

        <button
          onClick={() => navigate('/faculty/exams/create')}
          className="btn btn-primary"
          style={{ gap: '0.5rem' }}
        >
          <PlusCircle size={18} /> Create New Exam
        </button>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <StatsCard
          title="Total Exams"
          value={data?.totalExams || 0}
          subtitle="Curated by you"
          icon={<FileText size={24} />}
          color="var(--primary)"
        />
        <StatsCard
          title="Active Exams"
          value={data?.activeExams || 0}
          subtitle="Currently published / ongoing"
          icon={<Activity size={24} />}
          color="var(--accent-emerald)"
        />
        <StatsCard
          title="Question Bank"
          value={data?.totalQuestions || 0}
          subtitle="Available test items"
          icon={<HelpCircle size={24} />}
          color="var(--accent-amber)"
        />
        <StatsCard
          title="Total Submissions"
          value={data?.totalSubmissions || 0}
          subtitle="Student evaluations completed"
          icon={<Users size={24} />}
          color="var(--accent-cyan)"
        />
      </div>

      {/* Recent Exams Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Your Examinations</h2>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Recent tests created under your supervision
            </span>
          </div>
          <button
            onClick={() => navigate('/faculty/exams')}
            className="btn btn-secondary btn-sm"
          >
            View All Exams <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading exams data...
          </div>
        ) : exams.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem' }}>
            <FileText size={42} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h3 style={{ marginBottom: '0.35rem' }}>No exams created yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Create your first examination and start populating it with questions.
            </p>
            <button onClick={() => navigate('/faculty/exams/create')} className="btn btn-primary">
              <PlusCircle size={16} /> Create First Exam
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exam Title</th>
                  <th>Subject</th>
                  <th>Duration</th>
                  <th>Total Marks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id}>
                    <td><strong>{exam.title}</strong></td>
                    <td>{exam.subjectCode || exam.subjectName || 'General'}</td>
                    <td>{exam.durationMinutes} mins</td>
                    <td>{exam.totalMarks}</td>
                    <td><Badge status={exam.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => navigate(`/faculty/exams/${exam.id}/questions`)}
                          className="btn btn-secondary btn-sm"
                          title="Manage Questions"
                        >
                          Questions
                        </button>
                        <button
                          onClick={() => navigate(`/faculty/monitoring?examId=${exam.id}`)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#06B6D4' }}
                          title="Live Monitor"
                        >
                          <Activity size={14} /> Monitor
                        </button>
                        <button
                          onClick={() => navigate(`/faculty/exams/${exam.id}/analytics`)}
                          className="btn btn-secondary btn-sm"
                          title="Analytics & Results"
                        >
                          Results
                        </button>
                      </div>
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

export default FacultyDashboard;
