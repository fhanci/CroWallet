package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crowallet.backend.entity.Account;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
}
