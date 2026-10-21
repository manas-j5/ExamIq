import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import Badge from '../../components/Badge';
import { FileText, Search, Clock, Award, Play } from 'lucide-react';

const AvailableExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await studentService.getExams();
      setExams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.subjectName && e.subjectName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Available Examinations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Browse and take assessments assigned to your enrolled courses
          </p>
        </div>

        <div style={{ width: '320px', position: 'relative' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search by exam or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading available exams...
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No examinations found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {searchTerm ? 'No exams matched your search criteria.' : 'There are currently no active or scheduled exams.'}
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#818CF8' }}>
                    {exam.subjectCode || 'ACADEMIC'}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', marginTop: '0.2rem' }}>{exam.title}</h3>
                </div>
                <Badge status={exam.status} />
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flex: 1, marginBottom: '1.25rem' }}>
                {exam.description || 'Standard academic examination.'}
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  padding: '0.75rem 0',
                  borderTop: '1px solid var(--border-color)',
                  borderBottom: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={14} color="#818CF8" />
                  <span>Duration: <strong>{exam.durationMinutes}m</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Award size={14} color="#10B981" />
                  <span>Marks: <strong>{exam.totalMarks}</strong></span>
                </div>
                <div style={{ gridColumn: 'span 2', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Passing criteria: {exam.passingPercentage}%
                </div>
              </div>

              <button
                onClick={() => navigate(`/student/exam/${exam.id}/instructions`)}
                className="btn btn-primary"
                style={{ width: '100%', gap: '0.5rem' }}
              >
                <Play size={16} /> Instructions & Begin
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableExams;
