package com.example.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.api.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}
