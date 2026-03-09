package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crowallet.backend.entity.Positions;

@Repository
public interface PositionRepository extends JpaRepository<Positions, Long> {

}
