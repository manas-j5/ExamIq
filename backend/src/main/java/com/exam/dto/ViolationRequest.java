package com.exam.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ViolationRequest {

    private Long examAttemptId;
    private Long attemptId;
    private String type;
    private String violationType;
    private String description;
    private String details;

    public Long getExamAttemptId() {
        return examAttemptId != null ? examAttemptId : attemptId;
    }

    public String getType() {
        if (type != null && !type.isBlank()) return type;
        if (violationType != null && !violationType.isBlank()) return violationType;
        return "TAB_SWITCH";
    }

    public String getDescription() {
        if (description != null && !description.isBlank()) return description;
        if (details != null && !details.isBlank()) return details;
        return "Proctoring integrity event recorded";
    }
}
