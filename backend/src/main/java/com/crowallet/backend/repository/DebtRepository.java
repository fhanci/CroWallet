package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crowallet.backend.entity.Debt;

@Repository
public interface DebtRepository extends JpaRepository<Debt, Long> {
    
}
