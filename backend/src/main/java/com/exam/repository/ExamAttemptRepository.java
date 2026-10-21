package com.exam.repository;

import com.exam.entity.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    Optional<ExamAttempt> findByExamIdAndStudentId(Long examId, Long studentId);
    List<ExamAttempt> findByStudentId(Long studentId);
    List<ExamAttempt> findByExamId(Long examId);
    List<ExamAttempt> findByExamIdAndSubmitted(Long examId, boolean submitted);
    boolean existsByExamIdAndStudentId(Long examId, Long studentId);
    long countByExamIdAndSubmitted(Long examId, boolean submitted);
}
