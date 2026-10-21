package com.exam.repository;

import com.exam.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {
    List<Result> findByStudentId(Long studentId);
    List<Result> findByExamId(Long examId);
    Optional<Result> findByExamAttemptId(Long examAttemptId);
    Optional<Result> findByExamIdAndStudentId(Long examId, Long studentId);
}
