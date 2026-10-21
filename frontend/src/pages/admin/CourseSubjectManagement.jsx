import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import {
  Layers,
  BookOpen,
  PlusCircle,
  Trash2,
  FolderPlus,
  FilePlus,
} from 'lucide-react';

const CourseSubjectManagement = () => {
  const [activeTab, setActiveTab] = useState('COURSES');
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [deleteCourseTarget, setDeleteCourseTarget] = useState(null);
  const [deleteSubjectTarget, setDeleteSubjectTarget] = useState(null);

  const [courseForm, setCourseForm] = useState({ code: '', name: '', description: '' });
  const [subjectForm, setSubjectForm] = useState({ code: '', name: '', courseId: '' });

  const { addToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, subjectsRes] = await Promise.all([
        adminService.getCourses(),
        adminService.getSubjects(),
      ]);
      setCourses(coursesRes.data);
      setSubjects(subjectsRes.data);
      if (coursesRes.data.length > 0 && !subjectForm.courseId) {
        setSubjectForm((prev) => ({ ...prev, courseId: String(coursesRes.data[0].id) }));
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load academic catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.code || !courseForm.name) {
      addToast('Please enter both course code and name', 'warning');
      return;
    }

    try {
      await adminService.createCourse(courseForm);
      addToast(`Course ${courseForm.name} created!`, 'success');
      setIsCourseModalOpen(false);
      setCourseForm({ code: '', name: '', description: '' });
      loadData();
    } catch (err) {
      console.error(err);
      addToast('Failed to create course', 'error');
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteCourseTarget) return;
    try {
      await adminService.deleteCourse(deleteCourseTarget.id);
      addToast('Course deleted', 'success');
      setCourses((prev) => prev.filter((c) => c.id !== deleteCourseTarget.id));
      setDeleteCourseTarget(null);
    } catch (err) {
      console.error(err);
      addToast('Failed to delete course', 'error');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.code || !subjectForm.name) {
      addToast('Please enter subject code and name', 'warning');
      return;
    }

    try {
      const payload = {
        ...subjectForm,
        courseId: subjectForm.courseId ? parseInt(subjectForm.courseId) : null,
      };
      await adminService.createSubject(payload);
      addToast(`Subject ${subjectForm.name} created!`, 'success');
      setIsSubjectModalOpen(false);
      setSubjectForm({ code: '', name: '', courseId: courses[0]?.id ? String(courses[0].id) : '' });
      loadData();
    } catch (err) {
      console.error(err);
      addToast('Failed to create subject', 'error');
    }
  };

  const handleDeleteSubject = async () => {
    if (!deleteSubjectTarget) return;
    try {
      await adminService.deleteSubject(deleteSubjectTarget.id);
      addToast('Subject deleted', 'success');
      setSubjects((prev) => prev.filter((s) => s.id !== deleteSubjectTarget.id));
      setDeleteSubjectTarget(null);
    } catch (err) {
      console.error(err);
      addToast('Failed to delete subject', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Academic Curriculum Structure</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Define department degree programs (Courses) and constituent modular units (Subjects)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {activeTab === 'COURSES' ? (
            <button onClick={() => setIsCourseModalOpen(true)} className="btn btn-primary" style={{ gap: '0.5rem' }}>
              <FolderPlus size={16} /> Add New Course
            </button>
          ) : (
            <button onClick={() => setIsSubjectModalOpen(true)} className="btn btn-primary" style={{ gap: '0.5rem' }}>
              <FilePlus size={16} /> Add New Subject
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.75rem' }}>
        <button
          onClick={() => setActiveTab('COURSES')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'COURSES' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'COURSES' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '1rem',
            padding: '0.75rem 1.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Layers size={18} /> Courses ({courses.length})
        </button>

        <button
          onClick={() => setActiveTab('SUBJECTS')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'SUBJECTS' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'SUBJECTS' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '1rem',
            padding: '0.75rem 1.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <BookOpen size={18} /> Subjects ({subjects.length})
        </button>
      </div>

      {/* Courses Tab View */}
      {activeTab === 'COURSES' && (
        <div>
          {courses.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
              <Layers size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>No courses added yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Create degree programs like B.Tech Computer Science, MBA, etc.
              </p>
              <button onClick={() => setIsCourseModalOpen(true)} className="btn btn-primary">
                <FolderPlus size={16} /> Add First Course
              </button>
            </div>
          ) : (
            <div className="card-grid">
              {courses.map((course) => (
                <div key={course.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="badge badge-primary">{course.code}</span>
                    <button
                      onClick={() => setDeleteCourseTarget(course)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#EF4444' }}
                      title="Delete Course"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', marginTop: '0.35rem', marginBottom: '0.5rem' }}>
                    {course.name}
                  </h3>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flex: 1, marginBottom: '1rem' }}>
                    {course.description || 'Undergraduate / Postgraduate academic program.'}
                  </p>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                    Created on {new Date(course.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subjects Tab View */}
      {activeTab === 'SUBJECTS' && (
        <div>
          {subjects.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
              <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>No subjects added yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Add academic subjects and link them to courses.
              </p>
              <button onClick={() => setIsSubjectModalOpen(true)} className="btn btn-primary">
                <FilePlus size={16} /> Add First Subject
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Subject Title</th>
                    <th>Enrolled Course</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub) => (
                    <tr key={sub.id}>
                      <td><span className="badge badge-primary">{sub.code}</span></td>
                      <td><strong>{sub.name}</strong></td>
                      <td>{sub.courseName || 'General Program'}</td>
                      <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => setDeleteSubjectTarget(sub)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#EF4444' }}
                          title="Delete Subject"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Course Modal */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title="Add Academic Course"
      >
        <form onSubmit={handleCreateCourse}>
          <div className="form-group">
            <label className="form-label">Course Code *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. CS101 or BTECH-CSE"
              value={courseForm.code}
              onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Course Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Bachelor of Technology in Computer Science"
              value={courseForm.name}
              onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Course syllabus scope and accreditation..."
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsCourseModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Course
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title="Add Academic Subject"
      >
        <form onSubmit={handleCreateSubject}>
          <div className="form-group">
            <label className="form-label">Parent Course</label>
            <select
              className="form-select"
              value={subjectForm.courseId}
              onChange={(e) => setSubjectForm({ ...subjectForm, courseId: e.target.value })}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Subject Code *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. CS201 or DATA-STRUCT"
              value={subjectForm.code}
              onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Subject Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Data Structures and Algorithms"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Subject
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Course Confirmation */}
      <Modal
        isOpen={!!deleteCourseTarget}
        onClose={() => setDeleteCourseTarget(null)}
        title="Delete Course Program"
      >
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Are you sure you want to delete course <strong>"{deleteCourseTarget?.name}"</strong>?
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setDeleteCourseTarget(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleDeleteCourse} className="btn btn-danger">
              Delete Course
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Subject Confirmation */}
      <Modal
        isOpen={!!deleteSubjectTarget}
        onClose={() => setDeleteSubjectTarget(null)}
        title="Delete Subject Unit"
      >
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Are you sure you want to delete subject <strong>"{deleteSubjectTarget?.name}"</strong>?
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setDeleteSubjectTarget(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleDeleteSubject} className="btn btn-danger">
              Delete Subject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseSubjectManagement;
