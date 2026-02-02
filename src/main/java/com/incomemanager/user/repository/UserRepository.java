package com.incomemanager.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import com.incomemanager.user.entity.AppUser;

public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
