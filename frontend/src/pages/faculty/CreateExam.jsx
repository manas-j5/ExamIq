import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { facultyService, adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Save, FileText, CheckCircle2 } from 'lucide-react';

const CreateExam = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    durationMinutes: 60,
    totalMarks: 50,
    passingPercentage: 40,
    status: 'SCHEDULED',
    instructions: '1. Maintain full screen at all times.\n2. Tab switching is strictly recorded as a violation.\n3. Automatic submission will occur if timer runs out.',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    fetchSubjects();
    if (isEditMode) {
      loadExamData();
    }
  }, [id]);

  const fetchSubjects = async () => {
    try {
      const res = await adminService.getSubjects();
      setSubjects(res.data);
      if (res.data.length > 0 && !formData.subjectId) {
        setFormData((prev) => ({ ...prev, subjectId: res.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load subjects', err);
    }
  };

  const loadExamData = async () => {
    try {
      const res = await facultyService.getExams();
      const existing = res.data.find((e) => e.id === parseInt(id));
      if (existing) {
        setFormData({
          title: existing.title || '',
          description: existing.description || '',
          subjectId: existing.subjectId || '',
          durationMinutes: existing.durationMinutes || 60,
          totalMarks: existing.totalMarks || 50,
          passingPercentage: existing.passingPercentage || 40,
          status: existing.status || 'SCHEDULED',
          instructions: existing.instructions || '',
          startTime: existing.startTime ? existing.startTime.substring(0, 16) : '',
          endTime: existing.endTime ? existing.endTime.substring(0, 16) : '',
        });
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load existing exam data', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      addToast('Examination title is required', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        subjectId: formData.subjectId ? parseInt(formData.subjectId) : null,
        durationMinutes: parseInt(formData.durationMinutes),
        totalMarks: parseInt(formData.totalMarks),
        passingPercentage: parseFloat(formData.passingPercentage),
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
      };

      if (isEditMode) {
        await facultyService.updateExam(id, payload);
        addToast('Examination updated successfully!', 'success');
      } else {
        await facultyService.createExam(payload);
        addToast('Examination created successfully!', 'success');
      }
      navigate('/faculty/exams');
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to save examination', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/faculty/exams')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem', gap: '0.4rem' }}
      >
        <ArrowLeft size={14} /> Back to Exams
      </button>

      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>
            {isEditMode ? 'Modify Examination Settings' : 'Create New Examination'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Configure assessment parameters, schedule, and proctoring guidelines
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Examination Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Midterm Evaluation: Data Structures & Algorithms"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              rows="3"
              placeholder="Overview of syllabus or objectives covered..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
                name="subjectId"
                className="form-select"
                value={formData.subjectId}
                onChange={handleChange}
              >
                {subjects.length === 0 && <option value="">No subjects found</option>}
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Examination Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="DRAFT">DRAFT (Hidden from students)</option>
                <option value="SCHEDULED">SCHEDULED (Visible on student portal)</option>
                <option value="ONGOING">ONGOING (Accepting attempts)</option>
                <option value="COMPLETED">COMPLETED (Concluded)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Duration (Minutes) *</label>
              <input
                type="number"
                name="durationMinutes"
                className="form-input"
                min="5"
                max="360"
                value={formData.durationMinutes}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Marks *</label>
              <input
                type="number"
                name="totalMarks"
                className="form-input"
                min="1"
                value={formData.totalMarks}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Passing Percentage (%) *</label>
              <input
                type="number"
                name="passingPercentage"
                className="form-input"
                min="1"
                max="100"
                value={formData.passingPercentage}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Start Window (Optional)</label>
              <input
                type="datetime-local"
                name="startTime"
                className="form-input"
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Window (Optional)</label>
              <input
                type="datetime-local"
                name="endTime"
                className="form-input"
                value={formData.endTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Instructions & Proctoring Rules</label>
            <textarea
              name="instructions"
              className="form-textarea"
              rows="4"
              placeholder="Candidate instructions displayed before test begins..."
              value={formData.instructions}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={() => navigate('/faculty/exams')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ gap: '0.5rem' }}
            >
              <Save size={16} />
              {loading ? 'Saving Examination...' : isEditMode ? 'Update Examination' : 'Create Examination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;
