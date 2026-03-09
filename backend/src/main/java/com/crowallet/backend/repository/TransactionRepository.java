package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.crowallet.backend.entity.Transactions;

public interface TransactionRepository extends JpaRepository<Transactions, Long>{
    
    
}
