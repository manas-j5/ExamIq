package com.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuestionRequest {

    @NotBlank(message = "Question text is required")
    private String text;

    @NotBlank(message = "Option A is required")
    private String optionA;

    @NotBlank(message = "Option B is required")
    private String optionB;

    @NotBlank(message = "Option C is required")
    private String optionC;

    @NotBlank(message = "Option D is required")
    private String optionD;

    @NotBlank(message = "Correct option is required")
    private String correctOption;

    @NotNull(message = "Marks are required")
    @Positive(message = "Marks must be positive")
    private Integer marks;

    @NotNull(message = "Subject is required")
    private Long subjectId;
}
