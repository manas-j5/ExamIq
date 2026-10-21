package com.exam.controller;

import com.exam.dto.SaveAnswerRequest;
import com.exam.dto.ViolationRequest;
import com.exam.entity.Exam;
import com.exam.entity.ExamStatus;
import com.exam.security.JwtUtil;
import com.exam.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final ExamService examService;
    private final ExamAttemptService attemptService;
    private final ResultService resultService;
    private final ViolationService violationService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public StudentController(ExamService examService, ExamAttemptService attemptService,
                             ResultService resultService, ViolationService violationService,
                             UserService userService, JwtUtil jwtUtil) {
        this.examService = examService;
        this.attemptService = attemptService;
        this.resultService = resultService;
        this.violationService = violationService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    private Long getStudentId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }

    // ---- Dashboard ----
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@RequestHeader("Authorization") String authHeader) {
        Long studentId = getStudentId(authHeader);
        Map<String, Object> dashboard = new HashMap<>();

        // Get all published/active exams
        List<Exam> allExams = examService.getAllPublishedExams();
        List<Map<String, Object>> attempts = attemptService.getStudentAttempts(studentId);

        Set<Long> attemptedExamIds = attempts.stream()
                .map(a -> (Long) a.get("examId"))
                .collect(Collectors.toSet());

        Set<Long> submittedExamIds = attempts.stream()
                .filter(a -> (Boolean) a.get("submitted"))
                .map(a -> (Long) a.get("examId"))
                .collect(Collectors.toSet());

        LocalDateTime now = LocalDateTime.now();

        // Available exams (published, active, scheduled - not yet submitted)
        List<Map<String, Object>> availableExams = allExams.stream()
                .filter(e -> (e.getStatus() == ExamStatus.PUBLISHED || e.getStatus() == ExamStatus.ACTIVE || e.getStatus() == ExamStatus.SCHEDULED))
                .filter(e -> !submittedExamIds.contains(e.getId()))
                .map(this::examToMap)
                .collect(Collectors.toList());

        // Upcoming exams
        List<Map<String, Object>> upcomingExams = allExams.stream()
                .filter(e -> e.getStatus() == ExamStatus.PUBLISHED || e.getStatus() == ExamStatus.SCHEDULED)
                .map(this::examToMap)
                .collect(Collectors.toList());

        // Completed exams (submitted)
        List<Map<String, Object>> completedExams = attempts.stream()
                .filter(a -> (Boolean) a.get("submitted"))
                .collect(Collectors.toList());

        // Recent results
        List<Map<String, Object>> results = resultService.getStudentResults(studentId);

        dashboard.put("availableExams", availableExams);
        dashboard.put("upcomingExams", upcomingExams);
        dashboard.put("completedExams", completedExams);
        dashboard.put("recentResults", results.size() > 5 ? results.subList(0, 5) : results);
        dashboard.put("totalAttempts", attempts.size());
        dashboard.put("passedAttempts", results.stream().filter(r -> Boolean.TRUE.equals(r.get("passed"))).count());
        dashboard.put("averageScore", results.isEmpty() ? 0.0 :
                results.stream().mapToDouble(r -> {
                    Object p = r.get("percentage");
                    return p instanceof Number ? ((Number) p).doubleValue() : 0.0;
                }).average().orElse(0.0));

        Optional<Map<String, Object>> ongoing = attempts.stream()
                .filter(a -> !Boolean.TRUE.equals(a.get("submitted")))
                .findFirst();
        ongoing.ifPresent(a -> dashboard.put("ongoingAttempt", a));

        return ResponseEntity.ok(dashboard);
    }

    // ---- Exams ----
    @GetMapping("/exams")
    public ResponseEntity<List<Map<String, Object>>> getExams(@RequestHeader("Authorization") String authHeader) {
        Long studentId = getStudentId(authHeader);
        List<Exam> allExams = examService.getAllPublishedExams();
        List<Map<String, Object>> attempts = attemptService.getStudentAttempts(studentId);
        Map<Long, Map<String, Object>> attemptMap = attempts.stream()
                .collect(Collectors.toMap(a -> (Long) a.get("examId"), a -> a, (a, b) -> a));

        List<Map<String, Object>> exams = allExams.stream().map(exam -> {
            Map<String, Object> map = examToMap(exam);
            Map<String, Object> attempt = attemptMap.get(exam.getId());
            if (attempt != null) {
                map.put("attempted", true);
                map.put("submitted", attempt.get("submitted"));
                map.put("marksObtained", attempt.get("marksObtained"));
                map.put("totalMarksObtained", attempt.get("totalMarks"));
            } else {
                map.put("attempted", false);
                map.put("submitted", false);
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(exams);
    }

    @GetMapping({"/exams/{id}", "/exam/{id}/instructions"})
    public ResponseEntity<Map<String, Object>> getExamDetails(@PathVariable Long id) {
        Map<String, Object> details = examService.getExamDetailsForStudent(id);
        Exam exam = examService.getExamById(id);
        details.put("durationMinutes", exam.getDuration());
        details.put("totalMarks", exam.getTotalMarks());
        details.put("passingPercentage", exam.getPassingMarks() != null && exam.getTotalMarks() > 0 ? (exam.getPassingMarks() * 100.0 / exam.getTotalMarks()) : 50.0);
        details.put("instructions", exam.getInstructions());
        return ResponseEntity.ok(details);
    }

    // ---- Attempts ----
    @PostMapping({"/exams/{examId}/start", "/exam/{examId}/start"})
    public ResponseEntity<Map<String, Object>> startExam(@PathVariable Long examId,
                                                          @RequestHeader("Authorization") String authHeader) {
        Long studentId = getStudentId(authHeader);
        return ResponseEntity.ok(attemptService.startExam(examId, studentId));
    }

    @PostMapping("/attempts/{attemptId}/answer")
    public ResponseEntity<Map<String, Object>> saveAnswerByPath(@PathVariable Long attemptId,
                                                                 @RequestBody SaveAnswerRequest request,
                                                                 @RequestHeader("Authorization") String authHeader) {
        Long studentId = getStudentId(authHeader);
        return ResponseEntity.ok(attemptService.saveAnswer(attemptId, request, studentId));
    }

    @PostMapping("/exam/save-answer")
    public ResponseEntity<Map<String, Object>> saveAnswerByBody(@RequestBody SaveAnswerRequest request,
                                                                 @RequestHeader("Authorization") String authHeader) {
        Long studentId = getStudentId(authHeader);
        return ResponseEntity.ok(attemptService.saveAnswer(request.getAttemptId(), request, studentId));
    }

    @PostMapping({"/attempts/{attemptId}/submit", "/exam/{attemptId}/submit"})
    public ResponseEntity<Map<String, Object>> submitExam(@PathVariable Long attemptId,
                                                           @RequestHeader("Authorization") String authHeader) {
        Long studentId = getStudentId(authHeader);
        return ResponseEntity.ok(attemptService.submitExam(attemptId, studentId));
    }

    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<Map<String, Object>> getAttemptStatus(@PathVariable Long attemptId,
                                                                 @RequestHeader("Authorization") String authHeader) {
        Long studentId = getStudentId(authHeader);
        return ResponseEntity.ok(attemptService.getAttemptStatus(attemptId, studentId));
    }

    // ---- Results ----
    @GetMapping("/results")
    public ResponseEntity<List<Map<String, Object>>> getResults(@RequestHeader("Authorization") String authHeader) {
        Long studentId = getStudentId(authHeader);
        return ResponseEntity.ok(resultService.getStudentResults(studentId));
    }

    @GetMapping({"/results/{resultId}", "/result/{resultId}"})
    public ResponseEntity<Map<String, Object>> getResult(@PathVariable Long resultId) {
        return ResponseEntity.ok(resultService.getResult(resultId));
    }

    // ---- Violations ----
    @PostMapping({"/violations", "/exam/violation"})
    public ResponseEntity<Map<String, Object>> recordViolation(@RequestBody ViolationRequest request,
                                                                @RequestHeader("Authorization") String authHeader) {
        Long studentId = getStudentId(authHeader);
        return ResponseEntity.ok(violationService.recordViolation(request, studentId));
    }

    // ---- Profile ----
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        Long studentId = getStudentId(authHeader);
        return ResponseEntity.ok(userService.getUserById(studentId));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String authHeader,
                                            @RequestBody Map<String, String> body) {
        Long studentId = getStudentId(authHeader);
        return ResponseEntity.ok(userService.updateProfile(studentId, body.get("name")));
    }

    @PutMapping("/profile/password")
    public ResponseEntity<?> changePassword(@RequestHeader("Authorization") String authHeader,
                                             @RequestBody Map<String, String> body) {
        Long studentId = getStudentId(authHeader);
        userService.changePassword(studentId, body.get("currentPassword"), body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    private Map<String, Object> examToMap(Exam e) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", e.getId());
        map.put("title", e.getTitle());
        map.put("description", e.getDescription());
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
        map.put("status", e.getStatus().name());
        map.put("instructions", e.getInstructions());
        return map;
    }
}
