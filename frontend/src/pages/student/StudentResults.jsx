import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import Badge from '../../components/Badge';
import { Award, ArrowRight, FileText, Calendar, CheckCircle } from 'lucide-react';

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await studentService.getResults();
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Assessment Results</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Historical record of all evaluated examinations and performance metrics
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading assessment records...
        </div>
      ) : results.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Award size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No evaluation records found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Complete scheduled tests to generate your performance transcripts.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Exam Title</th>
                <th>Subject</th>
                <th>Completion Date</th>
                <th>Marks Scored</th>
                <th>Percentage</th>
                <th>Result</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.examTitle}</strong>
                  </td>
                  <td>{r.subjectCode || 'ACADEMIC'}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    {r.marksObtained} / {r.totalMarks}
                  </td>
                  <td>
                    <strong style={{ color: r.passed ? '#10B981' : '#EF4444' }}>
                      {Math.round(r.percentage)}%
                    </strong>
                  </td>
                  <td>
                    <Badge status={r.passed ? 'PASSED' : 'FAILED'} />
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/student/results/${r.id}`)}
                      className="btn btn-secondary btn-sm"
                    >
                      View Report <ArrowRight size={14} />
                    </button>
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

export default StudentResults;
