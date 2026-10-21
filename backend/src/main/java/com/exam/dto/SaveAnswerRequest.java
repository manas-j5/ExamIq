package com.exam.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SaveAnswerRequest {
    private Long attemptId;
    private Long questionId;
    private String selectedOption; // "A", "B", "C", "D" or null
    private boolean markedForReview;
    private String answerText;
}
