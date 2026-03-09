package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.crowallet.backend.entity.Positions;

public interface PositionRepository extends JpaRepository<Positions, Long>{
    
}
