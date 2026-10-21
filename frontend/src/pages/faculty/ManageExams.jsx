import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { facultyService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import {
  FileText,
  PlusCircle,
  Search,
  Activity,
  Edit2,
  Trash2,
  HelpCircle,
  BarChart3,
  Calendar,
  Clock,
  Award,
} from 'lucide-react';

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await facultyService.getExams();
      setExams(res.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load examinations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!deleteTarget) return;
    try {
      await facultyService.deleteExam(deleteTarget.id);
      addToast('Examination deleted successfully', 'success');
      setExams((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      addToast('Failed to delete examination', 'error');
    }
  };

  const filteredExams = exams.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.subjectName && e.subjectName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Curriculum Examinations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Author, schedule, and oversee all examinations in your assigned subjects
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

      {/* Filters Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'DRAFT', 'SCHEDULED', 'ONGOING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn ${statusFilter === st ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              {st}
            </button>
          ))}
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
            placeholder="Search by title or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Examinations Cards / Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading examinations...
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No examinations found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try adjusting your search criteria or filter tabs.'
              : 'Create your first exam to begin.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.5rem',
              }}
            >
              <div style={{ flex: 1, paddingRight: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>{exam.title}</h3>
                  <Badge status={exam.status} />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#818CF8',
                      background: 'rgba(99, 102, 241, 0.1)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {exam.subjectCode || 'ACADEMIC'}
                  </span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  {exam.description || 'Standard evaluation assessment.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} color="#818CF8" /> Duration: <strong>{exam.durationMinutes} mins</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Award size={14} color="#10B981" /> Total Marks: <strong>{exam.totalMarks}</strong>
                  </span>
                  <span>Pass Threshold: <strong>{exam.passingPercentage}%</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                <button
                  onClick={() => navigate(`/faculty/exams/${exam.id}/questions`)}
                  className="btn btn-secondary btn-sm"
                  title="Questions Bank attachment"
                  style={{ gap: '0.4rem' }}
                >
                  <HelpCircle size={15} /> Questions
                </button>

                <button
                  onClick={() => navigate(`/faculty/monitoring?examId=${exam.id}`)}
                  className="btn btn-secondary btn-sm"
                  title="Real-time Proctoring Monitor"
                  style={{ gap: '0.4rem', color: '#06B6D4' }}
                >
                  <Activity size={15} /> Live Monitor
                </button>

                <button
                  onClick={() => navigate(`/faculty/exams/${exam.id}/analytics`)}
                  className="btn btn-secondary btn-sm"
                  title="Performance analytics"
                  style={{ gap: '0.4rem', color: '#10B981' }}
                >
                  <BarChart3 size={15} /> Results
                </button>

                <button
                  onClick={() => navigate(`/faculty/exams/edit/${exam.id}`)}
                  className="btn btn-secondary btn-sm"
                  title="Edit exam settings"
                >
                  <Edit2 size={14} />
                </button>

                <button
                  onClick={() => setDeleteTarget(exam)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#EF4444' }}
                  title="Delete Exam"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Examination Deletion"
      >
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Are you sure you want to delete examination <strong>"{deleteTarget?.title}"</strong>? All associated attempts and questions will be permanently removed.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleDeleteExam} className="btn btn-danger">
              Delete Examination
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageExams;
