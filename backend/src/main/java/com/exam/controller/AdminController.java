package com.exam.controller;

import com.exam.dto.CourseRequest;
import com.exam.dto.SubjectRequest;
import com.exam.dto.UserResponse;
import com.exam.entity.Course;
import com.exam.entity.Subject;
import com.exam.service.CourseService;
import com.exam.service.SubjectService;
import com.exam.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final CourseService courseService;
    private final SubjectService subjectService;

    public AdminController(UserService userService, CourseService courseService, SubjectService subjectService) {
        this.userService = userService;
        this.courseService = courseService;
        this.subjectService = subjectService;
    }

    // ---- Dashboard ----
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Long>> getDashboard() {
        return ResponseEntity.ok(userService.getUserStats());
    }

    // ---- Users ----
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers(@RequestParam(required = false) String role,
                                                          @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(userService.searchUsers(search));
        }
        if (role != null && !role.isBlank()) {
            return ResponseEntity.ok(userService.getUsersByRole(role));
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.updateUserRole(id, body.get("role")));
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<UserResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }

    // ---- Courses ----
    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, Object>>> getAllCourses() {
        List<Map<String, Object>> courses = courseService.getAllCourses().stream()
                .map(this::courseToMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/courses")
    public ResponseEntity<Map<String, Object>> createCourse(@Valid @RequestBody CourseRequest request) {
        Course course = courseService.createCourse(request);
        return ResponseEntity.ok(courseToMap(course));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<Map<String, Object>> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        Course course = courseService.updateCourse(id, request);
        return ResponseEntity.ok(courseToMap(course));
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Map<String, String>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
    }

    // ---- Subjects ----
    @GetMapping("/subjects")
    public ResponseEntity<List<Map<String, Object>>> getAllSubjects(@RequestParam(required = false) Long courseId) {
        List<Subject> subjects;
        if (courseId != null) {
            subjects = subjectService.getSubjectsByCourse(courseId);
        } else {
            subjects = subjectService.getAllSubjects();
        }
        return ResponseEntity.ok(subjects.stream().map(this::subjectToMap).collect(Collectors.toList()));
    }

    @PostMapping("/subjects")
    public ResponseEntity<Map<String, Object>> createSubject(@Valid @RequestBody SubjectRequest request) {
        Subject subject = subjectService.createSubject(request);
        return ResponseEntity.ok(subjectToMap(subject));
    }

    @PutMapping("/subjects/{id}")
    public ResponseEntity<Map<String, Object>> updateSubject(@PathVariable Long id, @Valid @RequestBody SubjectRequest request) {
        Subject subject = subjectService.updateSubject(id, request);
        return ResponseEntity.ok(subjectToMap(subject));
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<Map<String, String>> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok(Map.of("message", "Subject deleted successfully"));
    }

    // ---- System overview ----
    @GetMapping("/system")
    public ResponseEntity<Map<String, Object>> getSystemOverview() {
        Map<String, Object> info = new HashMap<>();
        info.put("application", "Digital Exam Management System");
        info.put("version", "1.0.0");
        info.put("database", "MySQL");
        info.put("framework", "Spring Boot 3.1.5");
        info.putAll(userService.getUserStats());
        info.put("totalCourses", (long) courseService.getAllCourses().size());
        info.put("totalSubjects", (long) subjectService.getAllSubjects().size());
        return ResponseEntity.ok(info);
    }

    private Map<String, Object> courseToMap(Course c) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", c.getId());
        map.put("name", c.getName());
        map.put("code", c.getCode());
        map.put("description", c.getDescription());
        map.put("subjectCount", c.getSubjects() != null ? c.getSubjects().size() : 0);
        map.put("createdAt", c.getCreatedAt());
        return map;
    }

    private Map<String, Object> subjectToMap(Subject s) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", s.getId());
        map.put("name", s.getName());
        map.put("code", s.getCode());
        map.put("description", s.getDescription());
        map.put("courseId", s.getCourse().getId());
        map.put("courseName", s.getCourse().getName());
        map.put("createdAt", s.getCreatedAt());
        return map;
    }
}
