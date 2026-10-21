package com.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ExamRequest {

    @NotBlank(message = "Exam title is required")
    private String title;

    private String description;

    @NotNull(message = "Subject is required")
    private Long subjectId;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Integer duration;

    @NotNull(message = "Total marks is required")
    @Positive(message = "Total marks must be positive")
    private Integer totalMarks;

    private Integer passingMarks;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String instructions;

    private String status; // "DRAFT" or "PUBLISHED"

    private List<Long> questionIds;
}
