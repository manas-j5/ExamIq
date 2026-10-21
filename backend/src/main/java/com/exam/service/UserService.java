package com.exam.service;

import com.exam.dto.UserResponse;
import com.exam.entity.Role;
import com.exam.entity.User;
import com.exam.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getUsersByRole(String role) {
        return userRepository.findByRole(Role.valueOf(role.toUpperCase())).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> searchUsers(String query) {
        return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toResponse(user);
    }

    public UserResponse updateUserRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(Role.valueOf(role.toUpperCase()));
        user = userRepository.save(user);
        return toResponse(user);
    }

    public UserResponse toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setActive(!user.isActive());
        user = userRepository.save(user);
        return toResponse(user);
    }

    public UserResponse updateProfile(Long id, String name) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (name != null && !name.isBlank()) {
            user.setName(name);
        }
        user = userRepository.save(user);
        return toResponse(user);
    }

    public void changePassword(Long id, String currentPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public Map<String, Long> getUserStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("studentCount", userRepository.countByRole(Role.STUDENT));
        stats.put("facultyCount", userRepository.countByRole(Role.FACULTY));
        stats.put("adminCount", userRepository.countByRole(Role.ADMIN));
        return stats;
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
