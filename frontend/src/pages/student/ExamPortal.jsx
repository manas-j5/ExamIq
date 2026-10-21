import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import {
  Clock,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Send,
  Maximize2,
} from 'lucide-react';

const ExamPortal = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOption }
  const [reviews, setReviews] = useState({}); // { [questionId]: boolean }
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [violations, setViolations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [violationWarning, setViolationWarning] = useState(null);

  const attemptIdRef = useRef(null);
  const timerRef = useRef(null);
  const submittingRef = useRef(false);

  // Initialize Exam Session
  useEffect(() => {
    startExamSession();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examId]);

  const startExamSession = async () => {
    try {
      const res = await studentService.startExam(examId);
      const data = res.data;
      setAttempt(data.attempt);
      attemptIdRef.current = data.attempt.id;

      const qList = data.questions || [];
      setQuestions(qList);

      // Prepopulate existing answers
      const initialAnswers = {};
      const initialReviews = {};
      qList.forEach((q) => {
        if (q.selectedOption) initialAnswers[q.id] = q.selectedOption;
        if (q.markedForReview) initialReviews[q.id] = true;
      });
      setAnswers(initialAnswers);
      setReviews(initialReviews);

      // Initialize timer
      const secs = data.attempt.remainingSeconds || (data.attempt.durationMinutes * 60) || 1800;
      setRemainingSeconds(secs);

      // Request Fullscreen
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (e) {}

      setLoading(false);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to initialize exam attempt', 'error');
      navigate('/student/exams');
    }
  };

  // Timer Tick
  useEffect(() => {
    if (loading || remainingSeconds <= 0) return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit('Time has expired!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, remainingSeconds]);

  // Anti-Cheating: Tab Switch & Window Blur Listeners
  const recordViolation = useCallback(async (type, details) => {
    if (!attemptIdRef.current || submittingRef.current) return;

    try {
      const res = await studentService.recordViolation({
        attemptId: attemptIdRef.current,
        violationType: type,
        details: details,
      });

      const count = res.data?.violationCount || violations + 1;
      setViolations(count);

      if (count >= 3) {
        setViolationWarning(`Maximum violations reached (${count}/3). Terminating examination immediately.`);
        setTimeout(() => {
          handleAutoSubmit('Terminated due to multiple proctoring violations.');
        }, 2000);
      } else {
        setViolationWarning(`Security Alert: Tab change or unfocus detected! (Violation ${count}/3). 3 violations will auto-submit the exam.`);
      }
    } catch (err) {
      console.error('Failed to log violation:', err);
    }
  }, [violations]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !submittingRef.current) {
        recordViolation('TAB_SWITCH', 'Student switched tabs or minimized the browser window.');
      }
    };

    const handleWindowBlur = () => {
      if (!submittingRef.current) {
        recordViolation('WINDOW_BLUR', 'Examination window lost user focus.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [recordViolation]);

  // Save Answer on selection
  const handleSelectOption = async (optionKey) => {
    const currentQ = questions[currentIndex];
    if (!currentQ || submitting) return;

    const updatedAnswers = { ...answers, [currentQ.id]: optionKey };
    setAnswers(updatedAnswers);

    try {
      await studentService.saveAnswer({
        attemptId: attempt.id,
        questionId: currentQ.id,
        selectedOption: optionKey,
      });
    } catch (err) {
      console.error('Failed to auto-save answer:', err);
    }
  };

  const handleClearChoice = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ || submitting) return;

    const updated = { ...answers };
    delete updated[currentQ.id];
    setAnswers(updated);

    try {
      await studentService.saveAnswer({
        attemptId: attempt.id,
        questionId: currentQ.id,
        selectedOption: null,
      });
    } catch (err) {
      console.error('Failed to clear answer:', err);
    }
  };

  const handleToggleReview = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setReviews((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const handleAutoSubmit = (reason) => {
    if (submittingRef.current) return;
    addToast(reason, 'warning');
    performSubmit();
  };

  const performSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);

    try {
      const res = await studentService.submitExam(attemptIdRef.current);
      addToast('Examination submitted successfully!', 'success');
      const result = res.data;
      if (result && result.id) {
        navigate(`/student/results/${result.id}`);
      } else {
        navigate('/student/results');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to submit exam. Please try again.', 'error');
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  // Format Timer
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0E17', color: '#FFF' }}>
        <h3>Loading examination environment...</h3>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const reviewCount = Object.values(reviews).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0A0E17', color: '#FFF' }}>
      {/* Top Bar */}
      <header
        style={{
          height: '65px',
          background: 'rgba(17, 24, 39, 0.95)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700' }}>
            {attempt?.examTitle || 'Examination'}
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: remainingSeconds < 300 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.15)',
              border: `1px solid ${remainingSeconds < 300 ? '#EF4444' : 'rgba(99, 102, 241, 0.4)'}`,
              color: remainingSeconds < 300 ? '#EF4444' : '#818CF8',
              fontWeight: '700',
              fontSize: '1.1rem',
              fontFamily: 'monospace',
            }}
          >
            <Clock size={18} />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          {/* Violation Indicator */}
          {violations > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#F87171',
                fontSize: '0.8rem',
                fontWeight: '600',
              }}
            >
              <ShieldAlert size={16} />
              <span>Violations: {violations}/3</span>
            </div>
          )}

          <button
            onClick={() => setShowSubmitModal(true)}
            className="btn btn-success"
            style={{ padding: '0.5rem 1.25rem' }}
          >
            <Send size={15} /> Submit Test
          </button>
        </div>
      </header>

      {/* Main Examination Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Question Content Area */}
        <div style={{ flex: 1, padding: '2.5rem 3.5rem', overflowY: 'auto' }}>
          {currentQ ? (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span className="badge badge-primary">
                  Question {currentIndex + 1}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Marks: <strong>{currentQ.marks || 1}</strong>
                </span>
              </div>

              <h2
                style={{
                  fontSize: '1.35rem',
                  fontWeight: '500',
                  lineHeight: '1.6',
                  marginBottom: '2rem',
                  color: '#FFFFFF',
                }}
              >
                {currentQ.questionText}
              </h2>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2.5rem' }}>
                {['A', 'B', 'C', 'D'].map((key) => {
                  const optText = currentQ[`option${key}`];
                  if (!optText) return null;
                  const isSelected = answers[currentQ.id] === key;

                  return (
                    <div
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(31, 41, 55, 0.4)',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                          background: isSelected ? 'var(--primary)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                          flexShrink: 0,
                        }}
                      >
                        {key}
                      </div>
                      <span style={{ fontSize: '0.95rem', color: isSelected ? '#FFFFFF' : 'var(--text-secondary)' }}>
                        {optText}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={handleToggleReview}
                    className={`btn ${reviews[currentQ.id] ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  >
                    <Bookmark size={15} />
                    {reviews[currentQ.id] ? 'Flagged for Review' : 'Mark for Review'}
                  </button>

                  {answers[currentQ.id] && (
                    <button
                      onClick={handleClearChoice}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#EF4444' }}
                    >
                      <RotateCcw size={14} /> Clear Response
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="btn btn-secondary btn-sm"
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="btn btn-primary btn-sm"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem' }}>No questions available.</div>
          )}
        </div>

        {/* Right: Question Palette */}
        <div
          style={{
            width: '320px',
            borderLeft: '1px solid var(--border-color)',
            background: 'var(--bg-sidebar)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Question Palette</h3>

          {/* Legend */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              fontSize: '0.725rem',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10B981' }} />
              <span>Answered ({answeredCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#F59E0B' }} />
              <span>Review ({reviewCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#374151' }} />
              <span>Unanswered ({unansweredCount})</span>
            </div>
          </div>

          {/* Question Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0.6rem',
              overflowY: 'auto',
              flex: 1,
            }}
          >
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isReviewed = !!reviews[q.id];
              const isCurrent = idx === currentIndex;

              let bgColor = '#1F2937';
              let borderColor = 'var(--border-color)';

              if (isReviewed) {
                bgColor = '#F59E0B';
              } else if (isAnswered) {
                bgColor = '#10B981';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    height: '42px',
                    borderRadius: 'var(--radius-sm)',
                    background: bgColor,
                    border: isCurrent ? '2px solid #818CF8' : `1px solid ${borderColor}`,
                    color: isAnswered || isReviewed ? '#FFFFFF' : 'var(--text-secondary)',
                    fontWeight: isCurrent ? '700' : '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCurrent ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Quick Submit button at bottom */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="btn btn-success"
              style={{ width: '100%' }}
            >
              Finish & Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* Violation Alert Modal */}
      {violationWarning && (
        <Modal
          isOpen={true}
          onClose={() => setViolationWarning(null)}
          title="PROCTORING VIOLATION DETECTED"
        >
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444',
                marginBottom: '1rem',
              }}
            >
              <AlertTriangle size={32} />
            </div>
            <p style={{ color: '#F87171', fontSize: '1rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              {violationWarning}
            </p>
            <button
              onClick={() => setViolationWarning(null)}
              className="btn btn-danger"
              style={{ width: '100%' }}
            >
              Acknowledge & Return to Test
            </button>
          </div>
        </Modal>
      )}

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Confirm Examination Submission"
      >
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Are you sure you want to conclude and submit your examination? Once submitted, you cannot change your answers.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '0.75rem',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Answered</span>
              <strong style={{ fontSize: '1.25rem', color: '#10B981' }}>{answeredCount}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Unanswered</span>
              <strong style={{ fontSize: '1.25rem', color: '#EF4444' }}>{unansweredCount}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Review</span>
              <strong style={{ fontSize: '1.25rem', color: '#F59E0B' }}>{reviewCount}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              onClick={() => setShowSubmitModal(false)}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Continue Test
            </button>
            <button
              onClick={performSubmit}
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Yes, Submit Test'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExamPortal;
