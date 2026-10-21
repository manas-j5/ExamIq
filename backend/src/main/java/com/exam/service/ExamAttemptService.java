package com.exam.service;

import com.exam.dto.SaveAnswerRequest;
import com.exam.entity.*;
import com.exam.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExamAttemptService {

    private final ExamAttemptRepository attemptRepository;
    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final AnswerRepository answerRepository;
    private final ResultRepository resultRepository;
    private final UserRepository userRepository;

    public ExamAttemptService(ExamAttemptRepository attemptRepository, ExamRepository examRepository,
                              ExamQuestionRepository examQuestionRepository, AnswerRepository answerRepository,
                              ResultRepository resultRepository, UserRepository userRepository) {
        this.attemptRepository = attemptRepository;
        this.examRepository = examRepository;
        this.examQuestionRepository = examQuestionRepository;
        this.answerRepository = answerRepository;
        this.resultRepository = resultRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Map<String, Object> startExam(Long examId, Long studentId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));

        // Check if exam is available
        LocalDateTime now = LocalDateTime.now();
        if (exam.getStatus() != ExamStatus.PUBLISHED && exam.getStatus() != ExamStatus.ACTIVE && exam.getStatus() != ExamStatus.SCHEDULED) {
            throw new IllegalStateException("This exam is not available");
        }
        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
            throw new IllegalStateException("This exam has not started yet");
        }
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
            throw new IllegalStateException("This exam has ended");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        // Check for existing attempt
        Optional<ExamAttempt> existingAttempt = attemptRepository.findByExamIdAndStudentId(examId, studentId);
        if (existingAttempt.isPresent()) {
            ExamAttempt attempt = existingAttempt.get();
            if (attempt.isSubmitted()) {
                throw new IllegalStateException("You have already submitted this exam");
            }
            // Resume existing attempt
            return buildAttemptResponse(attempt, exam);
        }

        // Create new attempt
        ExamAttempt attempt = new ExamAttempt();
        attempt.setExam(exam);
        attempt.setStudent(student);
        attempt.setStartTime(LocalDateTime.now());
        // Calculate end time based on exam duration
        attempt.setEndTime(LocalDateTime.now().plusMinutes(exam.getDuration()));
        attempt = attemptRepository.save(attempt);

        // Update exam status to ACTIVE if first attempt
        if (exam.getStatus() == ExamStatus.PUBLISHED || exam.getStatus() == ExamStatus.SCHEDULED) {
            exam.setStatus(ExamStatus.ACTIVE);
            examRepository.save(exam);
        }

        return buildAttemptResponse(attempt, exam);
    }

    @Transactional
    public Map<String, Object> saveAnswer(Long attemptId, SaveAnswerRequest request, Long studentId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));

        if (!attempt.getStudent().getId().equals(studentId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        if (attempt.isSubmitted()) {
            throw new IllegalStateException("Exam already submitted");
        }

        // Check time
        if (attempt.getEndTime() != null && LocalDateTime.now().isAfter(attempt.getEndTime())) {
            return submitExam(attemptId, studentId); // Auto-submit
        }

        // Find or create answer
        Optional<Answer> existingAnswer = answerRepository.findByExamAttemptIdAndQuestionId(
                attemptId, request.getQuestionId());

        Answer answer;
        if (existingAnswer.isPresent()) {
            answer = existingAnswer.get();
        } else {
            answer = new Answer();
            answer.setExamAttempt(attempt);
            answer.setQuestion(new Question());
            answer.getQuestion().setId(request.getQuestionId());
        }

        answer.setSelectedOption(request.getSelectedOption());
        answer.setMarkedForReview(request.isMarkedForReview());
        answerRepository.save(answer);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Answer saved");
        response.put("questionId", request.getQuestionId());
        response.put("selectedOption", request.getSelectedOption());
        response.put("markedForReview", request.isMarkedForReview());
        return response;
    }

    @Transactional
    public Map<String, Object> submitExam(Long attemptId, Long studentId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));

        if (!attempt.getStudent().getId().equals(studentId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        if (attempt.isSubmitted()) {
            throw new IllegalStateException("Exam already submitted");
        }

        attempt.setSubmitted(true);
        attempt.setSubmittedAt(LocalDateTime.now());
        attemptRepository.save(attempt);

        // Calculate result
        return calculateAndSaveResult(attempt);
    }

    public Map<String, Object> getAttemptStatus(Long attemptId, Long studentId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));
        if (!attempt.getStudent().getId().equals(studentId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        return buildAttemptResponse(attempt, attempt.getExam());
    }

    public List<Map<String, Object>> getStudentAttempts(Long studentId) {
        List<ExamAttempt> attempts = attemptRepository.findByStudentId(studentId);
        return attempts.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("examId", a.getExam().getId());
            map.put("examTitle", a.getExam().getTitle());
            map.put("subjectName", a.getExam().getSubject().getName());
            map.put("startTime", a.getStartTime());
            map.put("submitted", a.isSubmitted());
            map.put("submittedAt", a.getSubmittedAt());
            if (a.getResult() != null) {
                map.put("marksObtained", a.getResult().getMarksObtained());
                map.put("totalMarks", a.getResult().getTotalMarks());
                map.put("percentage", a.getResult().getPercentage());
                map.put("passed", a.getResult().getPassed());
            }
            return map;
        }).collect(Collectors.toList());
    }

    // -- Monitoring --
    public List<Map<String, Object>> getActiveAttempts(Long examId) {
        List<ExamAttempt> attempts = attemptRepository.findByExamId(examId);
        return attempts.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("studentName", a.getStudent().getName());
            map.put("studentEmail", a.getStudent().getEmail());
            map.put("startTime", a.getStartTime());
            map.put("submitted", a.isSubmitted());
            map.put("submittedAt", a.getSubmittedAt());

            // Progress
            List<ExamQuestion> questions = examQuestionRepository.findByExamIdOrderByQuestionOrderAsc(a.getExam().getId());
            List<Answer> answers = answerRepository.findByExamAttemptId(a.getId());
            long answered = answers.stream().filter(ans -> ans.getSelectedOption() != null).count();
            map.put("totalQuestions", questions.size());
            map.put("answeredQuestions", answered);
            map.put("violationCount", a.getViolations().size());
            return map;
        }).collect(Collectors.toList());
    }

    private Map<String, Object> calculateAndSaveResult(ExamAttempt attempt) {
        Exam exam = attempt.getExam();
        List<ExamQuestion> examQuestions = examQuestionRepository.findByExamIdOrderByQuestionOrderAsc(exam.getId());
        List<Answer> answers = answerRepository.findByExamAttemptId(attempt.getId());

        int correctCount = 0;
        int incorrectCount = 0;
        int unansweredCount = 0;
        int marksObtained = 0;

        Map<Long, Answer> answerMap = answers.stream()
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a));

        for (ExamQuestion eq : examQuestions) {
            Question q = eq.getQuestion();
            Answer answer = answerMap.get(q.getId());

            if (answer == null || answer.getSelectedOption() == null || answer.getSelectedOption().isEmpty()) {
                unansweredCount++;
                if (answer != null) {
                    answer.setIsCorrect(false);
                    answerRepository.save(answer);
                }
            } else if (answer.getSelectedOption().equalsIgnoreCase(q.getCorrectOption())) {
                correctCount++;
                marksObtained += q.getMarks();
                answer.setIsCorrect(true);
                answerRepository.save(answer);
            } else {
                incorrectCount++;
                answer.setIsCorrect(false);
                answerRepository.save(answer);
            }
        }

        int totalMarks = exam.getTotalMarks();
        double percentage = totalMarks > 0 ? (marksObtained * 100.0) / totalMarks : 0;
        boolean passed = exam.getPassingMarks() != null && marksObtained >= exam.getPassingMarks();

        Result result = new Result();
        result.setExamAttempt(attempt);
        result.setStudent(attempt.getStudent());
        result.setExam(exam);
        result.setMarksObtained(marksObtained);
        result.setTotalMarks(totalMarks);
        result.setPercentage(Math.round(percentage * 100.0) / 100.0);
        result.setPassed(passed);
        result.setCorrectCount(correctCount);
        result.setIncorrectCount(incorrectCount);
        result.setUnansweredCount(unansweredCount);
        result = resultRepository.save(result);

        Map<String, Object> response = new HashMap<>();
        response.put("id", result.getId());
        response.put("resultId", result.getId());
        response.put("message", "Exam submitted successfully");
        response.put("marksObtained", marksObtained);
        response.put("totalMarks", totalMarks);
        response.put("percentage", result.getPercentage());
        response.put("passed", passed);
        response.put("correctCount", correctCount);
        response.put("incorrectCount", incorrectCount);
        response.put("unansweredCount", unansweredCount);
        return response;
    }

    private Map<String, Object> buildAttemptResponse(ExamAttempt attempt, Exam exam) {
        List<ExamQuestion> examQuestions = examQuestionRepository.findByExamIdOrderByQuestionOrderAsc(exam.getId());
        List<Answer> existingAnswers = answerRepository.findByExamAttemptId(attempt.getId());
        Map<Long, Answer> answerMap = existingAnswers.stream()
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a));

        List<Map<String, Object>> questions = examQuestions.stream().map(eq -> {
            Question q = eq.getQuestion();
            Map<String, Object> qMap = new HashMap<>();
            qMap.put("id", q.getId());
            qMap.put("text", q.getText());
            qMap.put("questionText", q.getText());
            qMap.put("optionA", q.getOptionA());
            qMap.put("optionB", q.getOptionB());
            qMap.put("optionC", q.getOptionC());
            qMap.put("optionD", q.getOptionD());
            qMap.put("marks", q.getMarks());
            qMap.put("questionOrder", eq.getQuestionOrder());

            // Include student's answer if exists
            Answer answer = answerMap.get(q.getId());
            if (answer != null) {
                qMap.put("selectedOption", answer.getSelectedOption());
                qMap.put("markedForReview", answer.isMarkedForReview());
            } else {
                qMap.put("selectedOption", null);
                qMap.put("markedForReview", false);
            }
            return qMap;
        }).collect(Collectors.toList());

        long remainingSecs = 0;
        if (attempt.getEndTime() != null) {
            remainingSecs = Math.max(0, java.time.Duration.between(LocalDateTime.now(), attempt.getEndTime()).getSeconds());
        }

        Map<String, Object> attemptMap = new HashMap<>();
        attemptMap.put("id", attempt.getId());
        attemptMap.put("examId", exam.getId());
        attemptMap.put("examTitle", exam.getTitle());
        attemptMap.put("durationMinutes", exam.getDuration());
        attemptMap.put("remainingSeconds", remainingSecs);
        attemptMap.put("totalQuestions", questions.size());
        attemptMap.put("totalMarks", exam.getTotalMarks());
        attemptMap.put("startTime", attempt.getStartTime());
        attemptMap.put("status", attempt.isSubmitted() ? "COMPLETED" : "IN_PROGRESS");

        Map<String, Object> response = new HashMap<>();
        response.put("attempt", attemptMap);
        response.put("attemptId", attempt.getId());
        response.put("examId", exam.getId());
        response.put("examTitle", exam.getTitle());
        response.put("duration", exam.getDuration());
        response.put("totalMarks", exam.getTotalMarks());
        response.put("startTime", attempt.getStartTime());
        response.put("endTime", attempt.getEndTime());
        response.put("submitted", attempt.isSubmitted());
        response.put("questions", questions);
        return response;
    }
}
