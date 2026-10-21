package com.exam.service;

import com.exam.dto.ViolationRequest;
import com.exam.entity.*;
import com.exam.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ViolationService {

    private final ViolationRepository violationRepository;
    private final ExamAttemptRepository attemptRepository;

    public ViolationService(ViolationRepository violationRepository, ExamAttemptRepository attemptRepository) {
        this.violationRepository = violationRepository;
        this.attemptRepository = attemptRepository;
    }

    public Map<String, Object> recordViolation(ViolationRequest request, Long studentId) {
        ExamAttempt attempt = attemptRepository.findById(request.getExamAttemptId())
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));

        if (!attempt.getStudent().getId().equals(studentId)) {
            throw new IllegalArgumentException("Unauthorized");
        }

        Violation violation = new Violation();
        violation.setExamAttempt(attempt);
        violation.setStudent(attempt.getStudent());
        violation.setExam(attempt.getExam());
        violation.setType(request.getType());
        violation.setDescription(request.getDescription());
        violation.setTimestamp(LocalDateTime.now());
        violationRepository.save(violation);

        long count = violationRepository.findByExamAttemptId(attempt.getId()).size();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Violation recorded");
        response.put("id", violation.getId());
        response.put("violationCount", count);
        return response;
    }

    public List<Map<String, Object>> getViolationsByAttempt(Long attemptId) {
        return violationRepository.findByExamAttemptId(attemptId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getViolationsByExam(Long examId) {
        return violationRepository.findByExamId(examId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void acknowledgeViolation(Long violationId) {
        Violation violation = violationRepository.findById(violationId)
                .orElseThrow(() -> new IllegalArgumentException("Violation not found"));
        violation.setAcknowledged(true);
        violationRepository.save(violation);
    }

    private Map<String, Object> toResponse(Violation v) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", v.getId());
        map.put("attemptId", v.getExamAttempt().getId());
        map.put("studentId", v.getStudent().getId());
        map.put("studentName", v.getStudent().getName());
        map.put("examId", v.getExam().getId());
        map.put("examTitle", v.getExam().getTitle());
        map.put("type", v.getType());
        map.put("description", v.getDescription());
        map.put("timestamp", v.getTimestamp());
        map.put("acknowledged", v.isAcknowledged());
        return map;
    }
}
