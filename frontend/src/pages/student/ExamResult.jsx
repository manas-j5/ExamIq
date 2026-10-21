import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import Badge from '../../components/Badge';
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  FileText,
} from 'lucide-react';

const ExamResult = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [resultId]);

  const fetchResult = async () => {
    try {
      const res = await studentService.getResultDetail(resultId);
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Generating examination report...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Report Not Found</h3>
        <button onClick={() => navigate('/student/results')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Back to Results
        </button>
      </div>
    );
  }

  const passed = result.passed;
  const questions = result.questions || [];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/student/results')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem', gap: '0.4rem' }}
      >
        <ArrowLeft size={14} /> Back to Results
      </button>

      {/* Hero Performance Card */}
      <div
        className="glass-card"
        style={{
          padding: '2.5rem',
          textAlign: 'center',
          marginBottom: '2rem',
          background: passed
            ? 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.15), transparent 70%), var(--bg-card)'
            : 'radial-gradient(ellipse at 50% 0%, rgba(239, 68, 68, 0.15), transparent 70%), var(--bg-card)',
          border: `1px solid ${passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: passed ? '#10B981' : '#EF4444',
            marginBottom: '1rem',
          }}
        >
          {passed ? <CheckCircle size={36} /> : <XCircle size={36} />}
        </div>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
          {result.examTitle || 'Examination Assessment'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Completed on {new Date(result.createdAt).toLocaleDateString()} at {new Date(result.createdAt).toLocaleTimeString()}
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Badge status={passed ? 'PASSED' : 'FAILED'} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Passing criteria: {result.passingPercentage}%
          </span>
        </div>

        {/* Score Breakdown Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Marks Scored</span>
            <strong style={{ fontSize: '1.75rem', color: '#FFFFFF' }}>
              {result.marksObtained} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {result.totalMarks}</span>
            </strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Percentage</span>
            <strong style={{ fontSize: '1.75rem', color: passed ? '#10B981' : '#EF4444' }}>
              {Math.round(result.percentage)}%
            </strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Questions</span>
            <strong style={{ fontSize: '1.75rem', color: '#818CF8' }}>
              {questions.length}
            </strong>
          </div>
        </div>
      </div>

      {/* Detailed Question Review */}
      <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BookOpen size={20} color="#818CF8" />
        Question-by-Question Breakdown
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
        {questions.map((q, idx) => {
          const isCorrect = q.isCorrect;
          return (
            <div
              key={q.id || idx}
              className="glass-card"
              style={{
                borderLeft: `4px solid ${isCorrect ? '#10B981' : '#EF4444'}`,
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge badge-secondary">Question {idx + 1}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: isCorrect ? '#10B981' : '#EF4444' }}>
                  {isCorrect ? `+${q.marks || 1} Marks` : '0 Marks'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: '500', marginBottom: '1rem', lineHeight: '1.5' }}>
                {q.questionText}
              </h3>

              {/* Options Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                {['A', 'B', 'C', 'D'].map((key) => {
                  const optText = q[`option${key}`];
                  if (!optText) return null;
                  const isUserSelected = q.selectedOption === key;
                  const isCorrectOption = q.correctOption === key;

                  let optBorder = 'var(--border-color)';
                  let optBg = 'rgba(255, 255, 255, 0.02)';
                  let labelColor = 'var(--text-muted)';

                  if (isCorrectOption) {
                    optBorder = '#10B981';
                    optBg = 'rgba(16, 185, 129, 0.15)';
                    labelColor = '#34D399';
                  } else if (isUserSelected && !isCorrect) {
                    optBorder = '#EF4444';
                    optBg = 'rgba(239, 68, 68, 0.15)';
                    labelColor = '#F87171';
                  }

                  return (
                    <div
                      key={key}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        background: optBg,
                        border: `1px solid ${optBorder}`,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <strong style={{ color: labelColor }}>{key}:</strong>
                      <span style={{ color: '#E5E7EB', flex: 1 }}>{optText}</span>
                      {isCorrectOption && <CheckCircle size={14} color="#10B981" />}
                      {isUserSelected && !isCorrect && <XCircle size={14} color="#EF4444" />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Note */}
              {q.explanation && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(99, 102, 241, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    fontSize: '0.8rem',
                    color: '#C7D2FE',
                  }}
                >
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExamResult;
