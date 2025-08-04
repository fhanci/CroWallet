package com.example.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.api.entity.Debt;

@Repository
public interface DebtRepository extends JpaRepository<Debt, Long> {
    
}
