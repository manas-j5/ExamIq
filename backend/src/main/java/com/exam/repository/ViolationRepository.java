package com.exam.repository;

import com.exam.entity.Violation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ViolationRepository extends JpaRepository<Violation, Long> {
    List<Violation> findByExamAttemptId(Long examAttemptId);
    List<Violation> findByExamId(Long examId);
    List<Violation> findByStudentId(Long studentId);
    long countByExamAttemptId(Long examAttemptId);
    long countByExamAttemptIdAndAcknowledged(Long examAttemptId, boolean acknowledged);
}
