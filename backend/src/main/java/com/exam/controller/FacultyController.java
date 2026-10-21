package com.exam.controller;

import com.exam.dto.ExamRequest;
import com.exam.dto.QuestionRequest;
import com.exam.entity.*;
import com.exam.repository.ExamQuestionRepository;
import com.exam.security.JwtUtil;
import com.exam.service.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    private final ExamService examService;
    private final QuestionService questionService;
    private final ExamAttemptService attemptService;
    private final ResultService resultService;
    private final ViolationService violationService;
    private final SubjectService subjectService;
    private final ExamQuestionRepository examQuestionRepository;
    private final JwtUtil jwtUtil;

    public FacultyController(ExamService examService, QuestionService questionService,
                             ExamAttemptService attemptService, ResultService resultService,
                             ViolationService violationService, SubjectService subjectService,
                             ExamQuestionRepository examQuestionRepository, JwtUtil jwtUtil) {
        this.examService = examService;
        this.questionService = questionService;
        this.attemptService = attemptService;
        this.resultService = resultService;
        this.violationService = violationService;
        this.subjectService = subjectService;
        this.examQuestionRepository = examQuestionRepository;
        this.jwtUtil = jwtUtil;
    }

    private Long getFacultyId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }

    // ---- Dashboard ----
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@RequestHeader("Authorization") String authHeader) {
        Long facultyId = getFacultyId(authHeader);
        return ResponseEntity.ok(examService.getFacultyDashboardStats(facultyId));
    }

    // ---- Exams ----
    @GetMapping("/exams")
    public ResponseEntity<List<Map<String, Object>>> getExams(@RequestHeader("Authorization") String authHeader) {
        Long facultyId = getFacultyId(authHeader);
        List<Exam> exams = examService.getExamsByFaculty(facultyId);
        return ResponseEntity.ok(exams.stream().map(this::examToMap).collect(Collectors.toList()));
    }

    @GetMapping("/exams/{id}")
    public ResponseEntity<Map<String, Object>> getExam(@PathVariable Long id) {
        Exam exam = examService.getExamById(id);
        Map<String, Object> map = examToMap(exam);
        // Include questions
        List<ExamQuestion> eqs = examQuestionRepository.findByExamIdOrderByQuestionOrderAsc(id);
        map.put("questions", eqs.stream().map(eq -> {
            Question q = eq.getQuestion();
            Map<String, Object> qMap = new HashMap<>();
            qMap.put("id", q.getId());
            qMap.put("text", q.getText());
            qMap.put("optionA", q.getOptionA());
            qMap.put("optionB", q.getOptionB());
            qMap.put("optionC", q.getOptionC());
            qMap.put("optionD", q.getOptionD());
            qMap.put("correctOption", q.getCorrectOption());
            qMap.put("marks", q.getMarks());
            qMap.put("subjectName", q.getSubject().getName());
            qMap.put("questionOrder", eq.getQuestionOrder());
            return qMap;
        }).collect(Collectors.toList()));
        return ResponseEntity.ok(map);
    }

    @PostMapping("/exams")
    public ResponseEntity<Map<String, Object>> createExam(@RequestHeader("Authorization") String authHeader,
                                                           @Valid @RequestBody ExamRequest request) {
        Long facultyId = getFacultyId(authHeader);
        Exam exam = examService.createExam(request, facultyId);
        return ResponseEntity.ok(examToMap(exam));
    }

    @PutMapping("/exams/{id}")
    public ResponseEntity<Map<String, Object>> updateExam(@PathVariable Long id,
                                                           @RequestHeader("Authorization") String authHeader,
                                                           @Valid @RequestBody ExamRequest request) {
        Long facultyId = getFacultyId(authHeader);
        Exam exam = examService.updateExam(id, request, facultyId);
        return ResponseEntity.ok(examToMap(exam));
    }

    @PutMapping("/exams/{id}/publish")
    public ResponseEntity<Map<String, Object>> publishExam(@PathVariable Long id,
                                                            @RequestHeader("Authorization") String authHeader) {
        Long facultyId = getFacultyId(authHeader);
        Exam exam = examService.publishExam(id, facultyId);
        return ResponseEntity.ok(examToMap(exam));
    }

    @PutMapping("/exams/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelExam(@PathVariable Long id,
                                                           @RequestHeader("Authorization") String authHeader) {
        Long facultyId = getFacultyId(authHeader);
        Exam exam = examService.cancelExam(id, facultyId);
        return ResponseEntity.ok(examToMap(exam));
    }

    @DeleteMapping("/exams/{id}")
    public ResponseEntity<Map<String, String>> deleteExam(@PathVariable Long id,
                                                           @RequestHeader("Authorization") String authHeader) {
        Long facultyId = getFacultyId(authHeader);
        examService.deleteExam(id, facultyId);
        return ResponseEntity.ok(Map.of("message", "Exam deleted successfully"));
    }

    // ---- Questions ----
    @GetMapping("/questions")
    public ResponseEntity<List<Map<String, Object>>> getQuestions(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Long subjectId) {
        Long facultyId = getFacultyId(authHeader);
        List<Question> questions;
        if (subjectId != null) {
            questions = questionService.getQuestionsBySubjectAndFaculty(subjectId, facultyId);
        } else {
            questions = questionService.getQuestionsByFaculty(facultyId);
        }
        return ResponseEntity.ok(questions.stream().map(this::questionToMap).collect(Collectors.toList()));
    }

    @GetMapping("/questions/{id}")
    public ResponseEntity<Map<String, Object>> getQuestion(@PathVariable Long id) {
        Question question = questionService.getQuestionById(id);
        return ResponseEntity.ok(questionToMap(question));
    }

    @PostMapping("/questions")
    public ResponseEntity<Map<String, Object>> createQuestion(@RequestHeader("Authorization") String authHeader,
                                                               @Valid @RequestBody QuestionRequest request) {
        Long facultyId = getFacultyId(authHeader);
        Question question = questionService.createQuestion(request, facultyId);
        return ResponseEntity.ok(questionToMap(question));
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<Map<String, Object>> updateQuestion(@PathVariable Long id,
                                                               @RequestHeader("Authorization") String authHeader,
                                                               @Valid @RequestBody QuestionRequest request) {
        Long facultyId = getFacultyId(authHeader);
        Question question = questionService.updateQuestion(id, request, facultyId);
        return ResponseEntity.ok(questionToMap(question));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Map<String, String>> deleteQuestion(@PathVariable Long id,
                                                               @RequestHeader("Authorization") String authHeader) {
        Long facultyId = getFacultyId(authHeader);
        questionService.deleteQuestion(id, facultyId);
        return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
    }

    // ---- Subjects (read-only for faculty) ----
    @GetMapping("/subjects")
    public ResponseEntity<List<Map<String, Object>>> getSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects().stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("name", s.getName());
            map.put("code", s.getCode());
            map.put("courseName", s.getCourse().getName());
            return map;
        }).collect(Collectors.toList()));
    }

    // ---- Monitoring ----
    @GetMapping({"/monitoring/exams/{examId}", "/exams/{examId}/monitoring"})
    public ResponseEntity<List<Map<String, Object>>> getActiveAttempts(@PathVariable Long examId) {
        return ResponseEntity.ok(attemptService.getActiveAttempts(examId));
    }

    @GetMapping({"/monitoring/violations/{examId}", "/exams/{examId}/violations"})
    public ResponseEntity<List<Map<String, Object>>> getViolations(@PathVariable Long examId) {
        return ResponseEntity.ok(violationService.getViolationsByExam(examId));
    }

    @PutMapping("/monitoring/violations/{id}/acknowledge")
    public ResponseEntity<Map<String, String>> acknowledgeViolation(@PathVariable Long id) {
        violationService.acknowledgeViolation(id);
        return ResponseEntity.ok(Map.of("message", "Violation acknowledged"));
    }

    // ---- Results ----
    @GetMapping({"/results/exam/{examId}", "/exams/{examId}/results"})
    public ResponseEntity<Map<String, Object>> getExamResults(@PathVariable Long examId) {
        List<Map<String, Object>> results = resultService.getExamResults(examId);
        Exam exam = examService.getExamById(examId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("examId", exam.getId());
        resp.put("examTitle", exam.getTitle());
        resp.put("results", results);
        return ResponseEntity.ok(resp);
    }

    private Map<String, Object> examToMap(Exam e) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", e.getId());
        map.put("title", e.getTitle());
        map.put("description", e.getDescription());
        map.put("subjectId", e.getSubject().getId());
        map.put("subjectName", e.getSubject().getName());
        map.put("subjectCode", e.getSubject().getCode());
        map.put("facultyName", e.getFaculty().getName());
        map.put("duration", e.getDuration());
        map.put("durationMinutes", e.getDuration());
        map.put("totalMarks", e.getTotalMarks());
        map.put("passingMarks", e.getPassingMarks());
        double passPct = e.getPassingMarks() != null && e.getTotalMarks() != null && e.getTotalMarks() > 0
                ? (e.getPassingMarks() * 100.0 / e.getTotalMarks())
                : 50.0;
        map.put("passingPercentage", Math.round(passPct));
        map.put("startTime", e.getStartTime());
        map.put("endTime", e.getEndTime());
        map.put("instructions", e.getInstructions());
        map.put("status", e.getStatus().name());
        map.put("questionCount", examQuestionRepository.countByExamId(e.getId()));
        map.put("createdAt", e.getCreatedAt());
        return map;
    }

    private Map<String, Object> questionToMap(Question q) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", q.getId());
        map.put("text", q.getText());
        map.put("questionText", q.getText());
        map.put("optionA", q.getOptionA());
        map.put("optionB", q.getOptionB());
        map.put("optionC", q.getOptionC());
        map.put("optionD", q.getOptionD());
        map.put("correctOption", q.getCorrectOption());
        map.put("marks", q.getMarks());
        map.put("difficulty", "MEDIUM");
        map.put("explanation", "The correct answer is Option " + q.getCorrectOption());
        map.put("subjectId", q.getSubject().getId());
        map.put("subjectName", q.getSubject().getName());
        map.put("subjectCode", q.getSubject().getCode());
        map.put("createdAt", q.getCreatedAt());
        return map;
    }
}
