package com.exam.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "results")
@Getter
@Setter
@NoArgsConstructor
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_attempt_id", nullable = false, unique = true)
    private ExamAttempt examAttempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @Column(name = "marks_obtained", nullable = false)
    private Integer marksObtained;

    @Column(name = "total_marks", nullable = false)
    private Integer totalMarks;

    @Column(nullable = false)
    private Double percentage;

    @Column(nullable = false)
    private Boolean passed;

    @Column(name = "correct_count", nullable = false)
    private Integer correctCount;

    @Column(name = "incorrect_count", nullable = false)
    private Integer incorrectCount;

    @Column(name = "unanswered_count", nullable = false)
    private Integer unansweredCount;

    @Column(name = "calculated_at", updatable = false)
    private LocalDateTime calculatedAt;

    @PrePersist
    protected void onCreate() {
        calculatedAt = LocalDateTime.now();
    }
}
