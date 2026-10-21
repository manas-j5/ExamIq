import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  ShieldAlert,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowLeft,
  Monitor,
} from 'lucide-react';

const ExamInstructions = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    fetchInstructions();
  }, [examId]);

  const fetchInstructions = async () => {
    try {
      const res = await studentService.getExamInstructions(examId);
      setExam(res.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load examination instructions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    if (!agreed) {
      addToast('Please read and agree to the exam rules before proceeding', 'warning');
      return;
    }
    navigate(`/student/exam/${examId}/live`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Loading examination regulations...
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Exam Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
          This examination may have concluded or is currently inactive.
        </p>
        <button onClick={() => navigate('/student/exams')} className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Exams
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/student/exams')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem', gap: '0.4rem' }}
      >
        <ArrowLeft size={14} /> Back to Exams
      </button>

      <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#818CF8', letterSpacing: '0.05em' }}>
              EXAMINATION REGULATIONS
            </span>
            <h1 style={{ fontSize: '2rem', marginTop: '0.35rem' }}>{exam.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
              {exam.description || 'Formal assessment evaluating your subject knowledge.'}
            </p>
          </div>
        </div>

        {/* Highlights Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            marginBottom: '2rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Duration</span>
            <strong style={{ fontSize: '1.1rem', color: '#FFF' }}>{exam.durationMinutes} Minutes</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Marks</span>
            <strong style={{ fontSize: '1.1rem', color: '#10B981' }}>{exam.totalMarks} Marks</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Passing Score</span>
            <strong style={{ fontSize: '1.1rem', color: '#F59E0B' }}>{exam.passingPercentage}% Required</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Questions</span>
            <strong style={{ fontSize: '1.1rem', color: '#818CF8' }}>{exam.totalQuestions || 'Multiple'} MCQs</strong>
          </div>
        </div>

        {/* Proctoring Rules */}
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={20} color="#F43F5E" />
          Proctoring & Anti-Cheating Protocol
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <Monitor size={18} color="#818CF8" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: '#FFF' }}>Full Screen Environment:</strong> The test must be completed in full screen. Exiting full screen or resizing the browser window is monitored.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertTriangle size={18} color="#F59E0B" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: '#FFF' }}>Tab Switching & Inactivity:</strong> Switching tabs, opening new windows, or losing window focus is strictly recorded as a violation.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertTriangle size={18} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: '#FFF' }}>Violation Limit:</strong> Accumulating 3 violations will result in immediate termination and automatic submission of your examination.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <CheckCircle2 size={18} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: '#FFF' }}>Real-Time Auto Save:</strong> Every selected answer is automatically dispatched to the server immediately.
            </div>
          </div>
        </div>

        {/* Custom Instructions if provided */}
        {exam.instructions && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '1rem', color: '#E5E7EB', marginBottom: '0.5rem' }}>Faculty Instructions:</h4>
            <div
              style={{
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                lineHeight: '1.6',
              }}
            >
              {exam.instructions}
            </div>
          </div>
        )}

        {/* Agreement Checkbox */}
        <div
          style={{
            padding: '1.25rem',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.9rem', color: '#E5E7EB', fontWeight: '500' }}>
              I have read, understood, and agree to strictly abide by all the examination rules and anti-cheating guidelines.
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={() => navigate('/student/exams')} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleStartExam}
            disabled={!agreed}
            className="btn btn-primary btn-lg"
            style={{ opacity: agreed ? 1 : 0.6, cursor: agreed ? 'pointer' : 'not-allowed', gap: '0.6rem' }}
          >
            <Play size={18} /> Enter Exam Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamInstructions;
