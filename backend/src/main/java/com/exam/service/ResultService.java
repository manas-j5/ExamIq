package com.exam.service;

import com.exam.entity.*;
import com.exam.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResultService {

    private final ResultRepository resultRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final AnswerRepository answerRepository;
    private final ExamAttemptRepository attemptRepository;

    public ResultService(ResultRepository resultRepository,
                         ExamQuestionRepository examQuestionRepository,
                         AnswerRepository answerRepository,
                         ExamAttemptRepository attemptRepository) {
        this.resultRepository = resultRepository;
        this.examQuestionRepository = examQuestionRepository;
        this.answerRepository = answerRepository;
        this.attemptRepository = attemptRepository;
    }

    public List<Map<String, Object>> getStudentResults(Long studentId) {
        return resultRepository.findByStudentId(studentId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getExamResults(Long examId) {
        return resultRepository.findByExamId(examId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getResult(Long resultId) {
        Result result = resultRepository.findById(resultId)
                .orElseThrow(() -> new IllegalArgumentException("Result not found"));
        Map<String, Object> response = toResponse(result);

        // Fetch questions and answers for detailed review
        Exam exam = result.getExam();
        Optional<ExamAttempt> attemptOpt = attemptRepository.findByExamIdAndStudentId(exam.getId(), result.getStudent().getId());
        List<Answer> answers = attemptOpt.map(a -> answerRepository.findByExamAttemptId(a.getId())).orElse(Collections.emptyList());
        Map<Long, Answer> answerMap = answers.stream()
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a, (a, b) -> a));

        List<ExamQuestion> examQuestions = examQuestionRepository.findByExamIdOrderByQuestionOrderAsc(exam.getId());
        List<Map<String, Object>> questionReview = examQuestions.stream().map(eq -> {
            Question q = eq.getQuestion();
            Map<String, Object> qMap = new HashMap<>();
            qMap.put("id", q.getId());
            qMap.put("questionText", q.getText());
            qMap.put("optionA", q.getOptionA());
            qMap.put("optionB", q.getOptionB());
            qMap.put("optionC", q.getOptionC());
            qMap.put("optionD", q.getOptionD());
            qMap.put("correctOption", q.getCorrectOption());
            qMap.put("marks", q.getMarks());
            qMap.put("explanation", "The correct answer is Option " + q.getCorrectOption());

            Answer ans = answerMap.get(q.getId());
            String selected = ans != null ? ans.getSelectedOption() : null;
            qMap.put("selectedOption", selected);
            qMap.put("isCorrect", selected != null && selected.equalsIgnoreCase(q.getCorrectOption()));
            return qMap;
        }).collect(Collectors.toList());

        response.put("questions", questionReview);
        return response;
    }

    public Map<String, Object> getResultByAttempt(Long attemptId) {
        Result result = resultRepository.findByExamAttemptId(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Result not found"));
        return getResult(result.getId());
    }

    private Map<String, Object> toResponse(Result r) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", r.getId());
        map.put("examId", r.getExam().getId());
        map.put("examTitle", r.getExam().getTitle());
        map.put("subjectName", r.getExam().getSubject().getName());
        map.put("subjectCode", r.getExam().getSubject().getCode());
        map.put("studentId", r.getStudent().getId());
        map.put("studentName", r.getStudent().getName());
        map.put("studentEmail", r.getStudent().getEmail());
        map.put("marksObtained", r.getMarksObtained());
        map.put("totalMarks", r.getTotalMarks());
        map.put("percentage", r.getPercentage());
        map.put("passed", r.getPassed());
        map.put("correctCount", r.getCorrectCount());
        map.put("incorrectCount", r.getIncorrectCount());
        map.put("unansweredCount", r.getUnansweredCount());
        map.put("calculatedAt", r.getCalculatedAt());
        map.put("createdAt", r.getCalculatedAt());
        double passPct = r.getExam().getPassingMarks() != null && r.getExam().getTotalMarks() > 0
                ? (r.getExam().getPassingMarks() * 100.0 / r.getExam().getTotalMarks())
                : 50.0;
        map.put("passingPercentage", Math.round(passPct));
        return map;
    }
}
