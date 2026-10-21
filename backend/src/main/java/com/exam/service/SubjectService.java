package com.exam.service;

import com.exam.dto.SubjectRequest;
import com.exam.entity.Course;
import com.exam.entity.Subject;
import com.exam.repository.CourseRepository;
import com.exam.repository.SubjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final CourseRepository courseRepository;

    public SubjectService(SubjectRepository subjectRepository, CourseRepository courseRepository) {
        this.subjectRepository = subjectRepository;
        this.courseRepository = courseRepository;
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public List<Subject> getSubjectsByCourse(Long courseId) {
        return subjectRepository.findByCourseId(courseId);
    }

    public Subject getSubjectById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
    }

    public Subject createSubject(SubjectRequest request) {
        if (subjectRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Subject code already exists");
        }
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        Subject subject = new Subject();
        subject.setName(request.getName());
        subject.setCode(request.getCode());
        subject.setDescription(request.getDescription());
        subject.setCourse(course);
        return subjectRepository.save(subject);
    }

    public Subject updateSubject(Long id, SubjectRequest request) {
        Subject subject = getSubjectById(id);
        subjectRepository.findByCode(request.getCode()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Subject code already exists");
            }
        });
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        subject.setName(request.getName());
        subject.setCode(request.getCode());
        subject.setDescription(request.getDescription());
        subject.setCourse(course);
        return subjectRepository.save(subject);
    }

    public void deleteSubject(Long id) {
        Subject subject = getSubjectById(id);
        subjectRepository.delete(subject);
    }
}
