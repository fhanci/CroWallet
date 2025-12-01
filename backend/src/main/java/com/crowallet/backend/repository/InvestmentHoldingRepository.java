package com.crowallet.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crowallet.backend.entity.InvestmentHolding;

@Repository
public interface InvestmentHoldingRepository extends JpaRepository<InvestmentHolding, Long> {
    List<InvestmentHolding> findByAccountId(Long accountId);
    void deleteByAccountId(Long accountId);
}

