package com.exam.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @NotBlank
    @Column(name = "option_a", nullable = false)
    private String optionA;

    @NotBlank
    @Column(name = "option_b", nullable = false)
    private String optionB;

    @NotBlank
    @Column(name = "option_c", nullable = false)
    private String optionC;

    @NotBlank
    @Column(name = "option_d", nullable = false)
    private String optionD;

    @NotBlank
    @Column(name = "correct_option", nullable = false)
    private String correctOption; // "A", "B", "C", or "D"

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer marks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
