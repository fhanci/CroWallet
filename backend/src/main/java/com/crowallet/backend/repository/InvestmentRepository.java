package com.crowallet.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crowallet.backend.entity.Investment;

@Repository
public interface InvestmentRepository extends JpaRepository<Investment, Long>{

    List<Investment> findAll();

    Investment findByAssetSymbol(String assetSymbol);
    
}
