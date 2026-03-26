package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.crowallet.backend.entity.MoneyAccount;
import com.crowallet.backend.entity.User;

import java.util.List;


public interface MoneyAccountRepository extends JpaRepository<MoneyAccount,Long> {

    List<MoneyAccount> findByUser(User user);
    
    
}
