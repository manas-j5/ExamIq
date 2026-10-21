package com.exam.service;

import com.exam.dto.QuestionRequest;
import com.exam.entity.Question;
import com.exam.entity.Subject;
import com.exam.entity.User;
import com.exam.repository.QuestionRepository;
import com.exam.repository.SubjectRepository;
import com.exam.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    public QuestionService(QuestionRepository questionRepository,
                           SubjectRepository subjectRepository,
                           UserRepository userRepository) {
        this.questionRepository = questionRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
    }

    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    public List<Question> getQuestionsByFaculty(Long facultyId) {
        return questionRepository.findByCreatedById(facultyId);
    }

    public List<Question> getQuestionsBySubject(Long subjectId) {
        return questionRepository.findBySubjectId(subjectId);
    }

    public List<Question> getQuestionsBySubjectAndFaculty(Long subjectId, Long facultyId) {
        return questionRepository.findBySubjectIdAndCreatedById(subjectId, facultyId);
    }

    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));
    }

    public Question createQuestion(QuestionRequest request, Long facultyId) {
        validateCorrectOption(request.getCorrectOption());

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> new IllegalArgumentException("Faculty not found"));

        Question question = new Question();
        question.setText(request.getText());
        question.setOptionA(request.getOptionA());
        question.setOptionB(request.getOptionB());
        question.setOptionC(request.getOptionC());
        question.setOptionD(request.getOptionD());
        question.setCorrectOption(request.getCorrectOption().toUpperCase());
        question.setMarks(request.getMarks());
        question.setSubject(subject);
        question.setCreatedBy(faculty);
        return questionRepository.save(question);
    }

    public Question updateQuestion(Long id, QuestionRequest request, Long facultyId) {
        Question question = getQuestionById(id);
        if (!question.getCreatedBy().getId().equals(facultyId)) {
            throw new IllegalArgumentException("You can only edit your own questions");
        }
        validateCorrectOption(request.getCorrectOption());

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));

        question.setText(request.getText());
        question.setOptionA(request.getOptionA());
        question.setOptionB(request.getOptionB());
        question.setOptionC(request.getOptionC());
        question.setOptionD(request.getOptionD());
        question.setCorrectOption(request.getCorrectOption().toUpperCase());
        question.setMarks(request.getMarks());
        question.setSubject(subject);
        return questionRepository.save(question);
    }

    public void deleteQuestion(Long id, Long facultyId) {
        Question question = getQuestionById(id);
        if (!question.getCreatedBy().getId().equals(facultyId)) {
            throw new IllegalArgumentException("You can only delete your own questions");
        }
        questionRepository.delete(question);
    }

    private void validateCorrectOption(String option) {
        if (option == null || !List.of("A", "B", "C", "D").contains(option.toUpperCase())) {
            throw new IllegalArgumentException("Correct option must be A, B, C, or D");
        }
    }
}
