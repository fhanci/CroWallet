package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.crowallet.backend.entity.RelatedTransactions;
import com.crowallet.backend.entity.Transactions;

import java.util.List;


public interface RelatedTransactionsRepository extends JpaRepository<RelatedTransactions,Long>{
    List<RelatedTransactions> findBySourceTransactions(Transactions sourceTransactions);
    List<RelatedTransactions> findByTargetTransactions(Transactions targetTransactions);
}
