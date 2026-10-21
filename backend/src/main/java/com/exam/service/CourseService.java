package com.exam.service;

import com.exam.dto.CourseRequest;
import com.exam.entity.Course;
import com.exam.repository.CourseRepository;
import com.exam.repository.SubjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;

    public CourseService(CourseRepository courseRepository, SubjectRepository subjectRepository) {
        this.courseRepository = courseRepository;
        this.subjectRepository = subjectRepository;
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
    }

    public Course createCourse(CourseRequest request) {
        if (courseRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Course code already exists");
        }
        Course course = new Course();
        course.setName(request.getName());
        course.setCode(request.getCode());
        course.setDescription(request.getDescription());
        return courseRepository.save(course);
    }

    public Course updateCourse(Long id, CourseRequest request) {
        Course course = getCourseById(id);
        courseRepository.findByCode(request.getCode()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Course code already exists");
            }
        });
        course.setName(request.getName());
        course.setCode(request.getCode());
        course.setDescription(request.getDescription());
        return courseRepository.save(course);
    }

    public void deleteCourse(Long id) {
        Course course = getCourseById(id);
        if (!subjectRepository.findByCourseId(id).isEmpty()) {
            throw new IllegalStateException("Cannot delete course with existing subjects. Remove subjects first.");
        }
        courseRepository.delete(course);
    }
}
