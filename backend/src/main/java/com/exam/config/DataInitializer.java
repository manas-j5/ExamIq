package com.exam.config;

import com.exam.entity.*;
import com.exam.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            CourseRepository courseRepository,
            SubjectRepository subjectRepository,
            ExamRepository examRepository,
            QuestionRepository questionRepository,
            ExamQuestionRepository examQuestionRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.subjectRepository = subjectRepository;
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.examQuestionRepository = examQuestionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Create Default Admin
        if (userRepository.findByEmail("admin@exam.com").isEmpty()) {
            User admin = new User();
            admin.setName("System Administrator");
            admin.setEmail("admin@exam.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
            System.out.println(">>> Default admin initialized: admin@exam.com / admin123");
        }

        // 2. Create Default Faculty
        User faculty = userRepository.findByEmail("faculty@exam.com").orElse(null);
        if (faculty == null) {
            faculty = new User();
            faculty.setName("Prof. Alistair Vance");
            faculty.setEmail("faculty@exam.com");
            faculty.setPassword(passwordEncoder.encode("faculty123"));
            faculty.setRole(Role.FACULTY);
            faculty.setActive(true);
            faculty = userRepository.save(faculty);
            System.out.println(">>> Default faculty initialized: faculty@exam.com / faculty123");
        }

        // 3. Create Default Student
        if (userRepository.findByEmail("student@exam.com").isEmpty()) {
            User student = new User();
            student.setName("Jane Student");
            student.setEmail("student@exam.com");
            student.setPassword(passwordEncoder.encode("student123"));
            student.setRole(Role.STUDENT);
            student.setActive(true);
            userRepository.save(student);
            System.out.println(">>> Default student initialized: student@exam.com / student123");
        }

        // 4. Seed Course and Subject
        Course course = courseRepository.findByCode("BTECH-CS").orElse(null);
        if (course == null) {
            course = new Course();
            course.setCode("BTECH-CS");
            course.setName("Computer Science & Engineering");
            course.setDescription("Undergraduate curriculum focusing on software algorithms, systems, and network architecture.");
            course = courseRepository.save(course);
        }

        Subject subject = subjectRepository.findByCode("CS201").orElse(null);
        if (subject == null) {
            subject = new Subject();
            subject.setCode("CS201");
            subject.setName("Data Structures & Algorithms");
            subject.setCourse(course);
            subject = subjectRepository.save(subject);
        }

        // 5. Seed Sample Questions
        if (questionRepository.count() == 0) {
            Question q1 = new Question();
            q1.setSubject(subject);
            q1.setCreatedBy(faculty);
            q1.setText("What is the time complexity of searching for an element in a balanced Binary Search Tree (AVL/Red-Black)?");
            q1.setOptionA("O(1)");
            q1.setOptionB("O(log n)");
            q1.setOptionC("O(n)");
            q1.setOptionD("O(n log n)");
            q1.setCorrectOption("B");
            q1.setMarks(2);
            q1 = questionRepository.save(q1);

            Question q2 = new Question();
            q2.setSubject(subject);
            q2.setCreatedBy(faculty);
            q2.setText("Which data structure follows the Last-In-First-Out (LIFO) access principle?");
            q2.setOptionA("Queue");
            q2.setOptionB("Stack");
            q2.setOptionC("Array");
            q2.setOptionD("Graph");
            q2.setCorrectOption("B");
            q2.setMarks(2);
            q2 = questionRepository.save(q2);

            Question q3 = new Question();
            q3.setSubject(subject);
            q3.setCreatedBy(faculty);
            q3.setText("Which algorithmic paradigm is employed by Dijkstra's Shortest Path algorithm?");
            q3.setOptionA("Dynamic Programming");
            q3.setOptionB("Greedy Approach");
            q3.setOptionC("Divide and Conquer");
            q3.setOptionD("Backtracking");
            q3.setCorrectOption("B");
            q3.setMarks(2);
            q3 = questionRepository.save(q3);

            // 6. Seed Sample Examination
            Exam exam = new Exam();
            exam.setTitle("Midterm Assessment: Data Structures & Algorithms");
            exam.setDescription("Mandatory mid-semester proctored test evaluating core data structures and algorithmic complexity.");
            exam.setSubject(subject);
            exam.setFaculty(faculty);
            exam.setDuration(30);
            exam.setTotalMarks(6);
            exam.setPassingMarks(3);
            exam.setStatus(ExamStatus.SCHEDULED);
            exam.setInstructions("1. Strict full-screen mode is required.\n2. Tab switching or losing window focus counts as a violation.\n3. Automatic submission triggers upon 3 violations.");
            exam.setStartTime(LocalDateTime.now().minusHours(1));
            exam.setEndTime(LocalDateTime.now().plusDays(7));
            exam = examRepository.save(exam);

            // Attach questions to exam
            ExamQuestion eq1 = new ExamQuestion();
            eq1.setExam(exam);
            eq1.setQuestion(q1);
            eq1.setQuestionOrder(1);
            examQuestionRepository.save(eq1);

            ExamQuestion eq2 = new ExamQuestion();
            eq2.setExam(exam);
            eq2.setQuestion(q2);
            eq2.setQuestionOrder(2);
            examQuestionRepository.save(eq2);

            ExamQuestion eq3 = new ExamQuestion();
            eq3.setExam(exam);
            eq3.setQuestion(q3);
            eq3.setQuestionOrder(3);
            examQuestionRepository.save(eq3);

            System.out.println(">>> Sample examination and question bank initialized successfully!");
        }
    }
}
