import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { facultyService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  HelpCircle,
  CheckCircle,
  FileText,
  Award,
} from 'lucide-react';

const ExamQuestionsManager = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [exam, setExam] = useState(null);
  const [assignedQuestions, setAssignedQuestions] = useState([]);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [examId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examsRes, assignedRes, bankRes] = await Promise.all([
        facultyService.getExams(),
        facultyService.getExamQuestions(examId),
        facultyService.getQuestions(),
      ]);

      const foundExam = examsRes.data.find((e) => e.id === parseInt(examId));
      setExam(foundExam);
      setAssignedQuestions(assignedRes.data);
      setBankQuestions(bankRes.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load examination question roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestionToExam = async (q) => {
    try {
      await facultyService.addExamQuestion(examId, {
        questionId: q.id,
        orderIndex: assignedQuestions.length + 1,
        marks: q.marks || 1,
      });
      addToast(`Added question to ${exam?.title}`, 'success');
      // Refresh assigned questions
      const res = await facultyService.getExamQuestions(examId);
      setAssignedQuestions(res.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to add question to exam', 'error');
    }
  };

  const handleRemoveQuestion = async (qId) => {
    try {
      await facultyService.removeExamQuestion(examId, qId);
      addToast('Question removed from examination', 'success');
      setAssignedQuestions((prev) => prev.filter((q) => q.id !== qId));
    } catch (err) {
      console.error(err);
      addToast('Failed to remove question', 'error');
    }
  };

  const assignedIds = new Set(assignedQuestions.map((q) => q.id));
  const availableFromBank = bankQuestions.filter((q) => !assignedIds.has(q.id));
  const totalAssignedMarks = assignedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/faculty/exams')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem', gap: '0.4rem' }}
      >
        <ArrowLeft size={14} /> Back to Exams
      </button>

      {/* Header Info */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          padding: '2rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#818CF8' }}>
            EXAM QUESTION CURATION
          </span>
          <h1 style={{ fontSize: '1.85rem', marginTop: '0.2rem' }}>
            {exam?.title || 'Examination'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Attach questions from the centralized repository to this assessment
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
              Assigned Items
            </span>
            <strong style={{ fontSize: '1.5rem', color: '#FFF' }}>
              {assignedQuestions.length} Questions
            </strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
              Allocated Marks
            </span>
            <strong style={{ fontSize: '1.5rem', color: '#10B981' }}>
              {totalAssignedMarks} / {exam?.totalMarks || 50}
            </strong>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary"
            style={{ gap: '0.5rem' }}
          >
            <PlusCircle size={16} /> Add Questions
          </button>
        </div>
      </div>

      {/* Assigned Questions List */}
      <div>
        <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Assigned Questions</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading questions...
          </div>
        ) : assignedQuestions.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <HelpCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3>No questions attached to this exam</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Students will have no test items until you attach questions from the bank.
            </p>
            <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
              <PlusCircle size={16} /> Choose from Question Bank
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {assignedQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem',
                }}
              >
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <span className="badge badge-primary">Q{idx + 1}</span>
                    <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: '600' }}>
                      +{q.marks || 1} Marks
                    </span>
                    <span className="badge badge-secondary">{q.difficulty || 'MEDIUM'}</span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '500', color: '#FFF' }}>
                    {q.questionText}
                  </h4>
                </div>

                <button
                  onClick={() => handleRemoveQuestion(q.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#EF4444' }}
                  title="Remove from this exam"
                >
                  <Trash2 size={15} /> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add from Bank Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Questions from Repository"
        maxWidth="750px"
      >
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Select questions to attach to <strong>{exam?.title}</strong>:
          </p>

          {availableFromBank.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              All existing questions in the bank are already attached to this exam, or no questions exist yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
              {availableFromBank.map((q) => (
                <div
                  key={q.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1.25rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.subjectCode || 'General'}</span>
                      <span style={{ fontSize: '0.75rem', color: '#10B981' }}>{q.marks || 1} Marks</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#E5E7EB' }}>{q.questionText}</div>
                  </div>

                  <button
                    onClick={() => handleAddQuestionToExam(q)}
                    className="btn btn-primary btn-sm"
                  >
                    Add to Exam
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExamQuestionsManager;
