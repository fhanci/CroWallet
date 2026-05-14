package com.crowallet.backend.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crowallet.backend.entity.MoneyAccount;
import com.crowallet.backend.entity.Transfer;
import com.crowallet.backend.entity.User;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {
    List<Transfer> findByMoneyAccount(MoneyAccount moneyAccount);

    List<Transfer> findByUser(User user);
}
