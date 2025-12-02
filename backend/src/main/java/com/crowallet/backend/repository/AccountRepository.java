package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crowallet.backend.entity.Account;
import com.crowallet.backend.entity.AccountType;

import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    
    List<Account> findByUserId(Long userId);
    
    List<Account> findByUserIdAndAccountType(Long userId, AccountType accountType);
}
