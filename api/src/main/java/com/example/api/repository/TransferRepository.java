package com.example.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.api.entity.Transfer;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {
}
