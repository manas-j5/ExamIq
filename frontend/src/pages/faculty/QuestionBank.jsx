import React, { useState, useEffect } from 'react';
import { facultyService, adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import {
  HelpCircle,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  BookOpen,
} from 'lucide-react';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    subjectId: '',
    questionText: '',
    type: 'MCQ',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    marks: 1,
    explanation: '',
    difficulty: 'MEDIUM',
  });

  const { addToast } = useToast();

  useEffect(() => {
    fetchSubjects();
    fetchQuestions();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await adminService.getSubjects();
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async (subjectId = '') => {
    setLoading(true);
    try {
      const res = await facultyService.getQuestions(subjectId || undefined);
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load questions from repository', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectFilterChange = (e) => {
    const val = e.target.value;
    setSelectedSubject(val);
    fetchQuestions(val);
  };

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormData({
      subjectId: selectedSubject || (subjects[0]?.id ? String(subjects[0].id) : ''),
      questionText: '',
      type: 'MCQ',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      marks: 1,
      explanation: '',
      difficulty: 'MEDIUM',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setFormData({
      subjectId: q.subjectId ? String(q.subjectId) : '',
      questionText: q.questionText || '',
      type: q.type || 'MCQ',
      optionA: q.optionA || '',
      optionB: q.optionB || '',
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      correctOption: q.correctOption || 'A',
      marks: q.marks || 1,
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'MEDIUM',
    });
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!formData.questionText || !formData.optionA || !formData.optionB) {
      addToast('Please provide question text and at least options A and B', 'warning');
      return;
    }

    try {
      const payload = {
        ...formData,
        subjectId: formData.subjectId ? parseInt(formData.subjectId) : null,
        marks: parseInt(formData.marks),
      };

      if (editingQuestion) {
        await facultyService.updateQuestion(editingQuestion.id, payload);
        addToast('Question updated successfully!', 'success');
      } else {
        await facultyService.createQuestion(payload);
        addToast('Question added to bank successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchQuestions(selectedSubject);
    } catch (err) {
      console.error(err);
      addToast('Failed to save question', 'error');
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteTarget) return;
    try {
      await facultyService.deleteQuestion(deleteTarget.id);
      addToast('Question deleted successfully', 'success');
      setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      addToast('Failed to delete question', 'error');
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Question Bank</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Central repository of multiple choice assessment questions categorized by subject
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <PlusCircle size={18} /> Add New Question
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '260px' }}>
          <select
            className="form-select"
            value={selectedSubject}
            onChange={handleSubjectFilterChange}
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search questions by keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading question bank...
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <HelpCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No questions found in this repository</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Click "Add New Question" above to start populating this subject.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredQuestions.map((q, idx) => (
            <div key={q.id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="badge badge-primary">Q{idx + 1}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {q.subjectCode || 'General'}
                  </span>
                  <span className="badge badge-secondary">{q.difficulty || 'MEDIUM'}</span>
                  <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: '600' }}>
                    +{q.marks || 1} Marks
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="btn btn-secondary btn-sm"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(q)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#EF4444' }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                {q.questionText}
              </h3>

              {/* Options Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
                {['A', 'B', 'C', 'D'].map((key) => {
                  const optText = q[`option${key}`];
                  if (!optText) return null;
                  const isCorrect = q.correctOption === key;

                  return (
                    <div
                      key={key}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${isCorrect ? '#10B981' : 'var(--border-color)'}`,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <strong style={{ color: isCorrect ? '#34D399' : 'var(--text-muted)' }}>{key}:</strong>
                      <span style={{ color: '#E5E7EB', flex: 1 }}>{optText}</span>
                      {isCorrect && <CheckCircle size={14} color="#10B981" />}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    padding: '0.6rem 0.85rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <strong style={{ color: '#C7D2FE' }}>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add Question to Repository'}
        maxWidth="680px"
      >
        <form onSubmit={handleSaveQuestion}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select
                className="form-select"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Question Text *</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="State the examination question clearly..."
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Option A *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Option A description"
                value={formData.optionA}
                onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Option B *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Option B description"
                value={formData.optionB}
                onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Option C</label>
              <input
                type="text"
                className="form-input"
                placeholder="Option C description"
                value={formData.optionC}
                onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Option D</label>
              <input
                type="text"
                className="form-input"
                placeholder="Option D description"
                value={formData.optionD}
                onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Correct Option *</label>
              <select
                className="form-select"
                value={formData.correctOption}
                onChange={(e) => setFormData({ ...formData, correctOption: e.target.value })}
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Marks *</label>
              <input
                type="number"
                className="form-input"
                min="1"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Answer Explanation / Notes</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="Why this answer is correct (revealed after submission)..."
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingQuestion ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Question Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Question Deletion"
      >
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Are you sure you want to delete this question? It will be removed from future exams.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleDeleteQuestion} className="btn btn-danger">
              Delete Question
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuestionBank;
