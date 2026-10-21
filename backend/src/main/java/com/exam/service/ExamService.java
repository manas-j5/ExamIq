package com.exam.service;

import com.exam.dto.ExamRequest;
import com.exam.entity.*;
import com.exam.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final ExamAttemptRepository examAttemptRepository;

    public ExamService(ExamRepository examRepository, SubjectRepository subjectRepository,
                       UserRepository userRepository, QuestionRepository questionRepository,
                       ExamQuestionRepository examQuestionRepository,
                       ExamAttemptRepository examAttemptRepository) {
        this.examRepository = examRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.questionRepository = questionRepository;
        this.examQuestionRepository = examQuestionRepository;
        this.examAttemptRepository = examAttemptRepository;
    }

    @Transactional
    public Exam createExam(ExamRequest request, Long facultyId) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> new IllegalArgumentException("Faculty not found"));

        Exam exam = new Exam();
        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        exam.setSubject(subject);
        exam.setFaculty(faculty);
        exam.setDuration(request.getDuration());
        exam.setTotalMarks(request.getTotalMarks());
        exam.setPassingMarks(request.getPassingMarks());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setInstructions(request.getInstructions());

        ExamStatus status = ExamStatus.DRAFT;
        if (request.getStatus() != null) {
            try {
                status = ExamStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }
        exam.setStatus(status);

        exam = examRepository.save(exam);

        // Add questions if provided
        if (request.getQuestionIds() != null && !request.getQuestionIds().isEmpty()) {
            addQuestionsToExam(exam, request.getQuestionIds());
        }

        return exam;
    }

    @Transactional
    public Exam updateExam(Long examId, ExamRequest request, Long facultyId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));

        if (!exam.getFaculty().getId().equals(facultyId)) {
            throw new IllegalArgumentException("You can only edit your own exams");
        }

        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new IllegalStateException("Only draft exams can be edited");
        }

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));

        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        exam.setSubject(subject);
        exam.setDuration(request.getDuration());
        exam.setTotalMarks(request.getTotalMarks());
        exam.setPassingMarks(request.getPassingMarks());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setInstructions(request.getInstructions());

        if (request.getStatus() != null) {
            try {
                exam.setStatus(ExamStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
            }
        }

        exam = examRepository.save(exam);

        // Update questions
        if (request.getQuestionIds() != null) {
            examQuestionRepository.deleteByExamId(examId);
            addQuestionsToExam(exam, request.getQuestionIds());
        }

        return exam;
    }

    public Exam publishExam(Long examId, Long facultyId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
        if (!exam.getFaculty().getId().equals(facultyId)) {
            throw new IllegalArgumentException("You can only publish your own exams");
        }
        if (exam.getStartTime() == null || exam.getEndTime() == null) {
            throw new IllegalArgumentException("Set start and end times before publishing");
        }
        if (examQuestionRepository.countByExamId(examId) == 0) {
            throw new IllegalArgumentException("Add at least one question before publishing");
        }
        exam.setStatus(ExamStatus.PUBLISHED);
        return examRepository.save(exam);
    }

    public Exam cancelExam(Long examId, Long facultyId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
        if (!exam.getFaculty().getId().equals(facultyId)) {
            throw new IllegalArgumentException("You can only cancel your own exams");
        }
        exam.setStatus(ExamStatus.CANCELLED);
        return examRepository.save(exam);
    }

    public void deleteExam(Long examId, Long facultyId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
        if (!exam.getFaculty().getId().equals(facultyId)) {
            throw new IllegalArgumentException("You can only delete your own exams");
        }
        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new IllegalStateException("Only draft exams can be deleted");
        }
        examRepository.delete(exam);
    }

    public Exam getExamById(Long examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
    }

    public List<Exam> getExamsByFaculty(Long facultyId) {
        return examRepository.findByFacultyId(facultyId);
    }

    public List<Exam> getAvailableExamsForStudent() {
        LocalDateTime now = LocalDateTime.now();
        List<ExamStatus> statuses = List.of(ExamStatus.SCHEDULED, ExamStatus.PUBLISHED, ExamStatus.ACTIVE);
        return examRepository.findAvailableExams(statuses, now);
    }

    public List<Exam> getAllPublishedExams() {
        List<Exam> exams = new ArrayList<>();
        exams.addAll(examRepository.findByStatus(ExamStatus.SCHEDULED));
        exams.addAll(examRepository.findByStatus(ExamStatus.PUBLISHED));
        exams.addAll(examRepository.findByStatus(ExamStatus.ACTIVE));
        exams.addAll(examRepository.findByStatus(ExamStatus.COMPLETED));
        return exams;
    }

    public Map<String, Object> getExamDetailsForStudent(Long examId) {
        Exam exam = getExamById(examId);
        List<ExamQuestion> examQuestions = examQuestionRepository.findByExamIdOrderByQuestionOrderAsc(examId);

        Map<String, Object> details = new HashMap<>();
        details.put("id", exam.getId());
        details.put("title", exam.getTitle());
        details.put("description", exam.getDescription());
        details.put("subjectName", exam.getSubject().getName());
        details.put("facultyName", exam.getFaculty().getName());
        details.put("duration", exam.getDuration());
        details.put("totalMarks", exam.getTotalMarks());
        details.put("passingMarks", exam.getPassingMarks());
        details.put("startTime", exam.getStartTime());
        details.put("endTime", exam.getEndTime());
        details.put("instructions", exam.getInstructions());
        details.put("status", exam.getStatus().name());
        details.put("totalQuestions", examQuestions.size());
        return details;
    }

    public Map<String, Object> getFacultyDashboardStats(Long facultyId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalExams", examRepository.countByFacultyId(facultyId));
        stats.put("draftExams", examRepository.countByFacultyIdAndStatus(facultyId, ExamStatus.DRAFT));
        stats.put("publishedExams", examRepository.countByFacultyIdAndStatus(facultyId, ExamStatus.PUBLISHED));
        stats.put("activeExams", examRepository.countByFacultyIdAndStatus(facultyId, ExamStatus.ACTIVE));
        stats.put("completedExams", examRepository.countByFacultyIdAndStatus(facultyId, ExamStatus.COMPLETED));

        // Count unique students who attempted faculty's exams
        List<Exam> facultyExams = examRepository.findByFacultyId(facultyId);
        long totalStudents = facultyExams.stream()
                .flatMap(e -> examAttemptRepository.findByExamId(e.getId()).stream())
                .map(a -> a.getStudent().getId())
                .distinct()
                .count();
        stats.put("totalStudents", totalStudents);

        return stats;
    }

    private void addQuestionsToExam(Exam exam, List<Long> questionIds) {
        for (int i = 0; i < questionIds.size(); i++) {
            Question question = questionRepository.findById(questionIds.get(i))
                    .orElseThrow(() -> new IllegalArgumentException("Question not found"));
            ExamQuestion eq = new ExamQuestion();
            eq.setExam(exam);
            eq.setQuestion(question);
            eq.setQuestionOrder(i + 1);
            examQuestionRepository.save(eq);
        }
    }
}
