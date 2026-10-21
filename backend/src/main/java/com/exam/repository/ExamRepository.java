package com.exam.repository;

import com.exam.entity.Exam;
import com.exam.entity.ExamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByFacultyId(Long facultyId);
    List<Exam> findByStatus(ExamStatus status);
    List<Exam> findByFacultyIdAndStatus(Long facultyId, ExamStatus status);

    @Query("SELECT e FROM Exam e WHERE e.status = :status AND e.startTime <= :now AND e.endTime >= :now")
    List<Exam> findActiveExams(@Param("status") ExamStatus status, @Param("now") LocalDateTime now);

    @Query("SELECT e FROM Exam e WHERE e.status IN :statuses AND e.startTime <= :now AND e.endTime >= :now")
    List<Exam> findAvailableExams(@Param("statuses") List<ExamStatus> statuses, @Param("now") LocalDateTime now);

    long countByFacultyId(Long facultyId);
    long countByFacultyIdAndStatus(Long facultyId, ExamStatus status);
}
