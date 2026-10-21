package com.exam.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "answers", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"exam_attempt_id", "question_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_attempt_id", nullable = false)
    private ExamAttempt examAttempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "selected_option")
    private String selectedOption; // "A", "B", "C", "D" or null

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "marked_for_review")
    private boolean markedForReview = false;
}
