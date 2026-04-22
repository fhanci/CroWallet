package com.crowallet.backend.repository;

import jakarta.transaction.Transactional;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.crowallet.backend.entity.MoneyAccount;
import com.crowallet.backend.entity.Transfer;
import com.crowallet.backend.entity.User;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {
    // @Transactional
    // @Modifying
    // void deleteByAccountId(Long id);

    List<Transfer> findByMoneyAccount(MoneyAccount moneyAccount);

    List<Transfer> findByUser(User user);
}
