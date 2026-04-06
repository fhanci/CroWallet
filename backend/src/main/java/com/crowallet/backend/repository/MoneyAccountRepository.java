package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.crowallet.backend.dto.UserBalanceDTO;
import com.crowallet.backend.entity.MoneyAccount;
import com.crowallet.backend.entity.User;

import java.math.BigDecimal;
import java.util.List;


public interface MoneyAccountRepository extends JpaRepository<MoneyAccount,Long> {

    List<MoneyAccount> findByUser(User user);


    @Query("SELECT new com.crowallet.backend.dto.UserBalanceDTO(" +
       "SUM(CASE WHEN m.currency = 'USD' THEN m.balance ELSE 0 END), " +
       "SUM(CASE WHEN m.currency = 'EUR' THEN m.balance ELSE 0 END), " +
       "SUM(CASE WHEN m.currency = 'TRY' THEN m.balance ELSE 0 END)) " +
       "FROM MoneyAccount m WHERE m.user = :user")
    UserBalanceDTO findTotalBalancesByUser(User user);


    @Query("SELECT CASE m.currency WHEN 'USD' THEN SUM(m.balance) ELSE 0 END FROM MoneyAccount m WHERE m.user = :user")
    BigDecimal findTotalBalanceByUserAndCurrencyUSD(User user);

    @Query("SELECT CASE m.currency WHEN 'EUR' THEN SUM(m.balance) ELSE 0 END FROM MoneyAccount m WHERE m.user = :user")
    BigDecimal findTotalBalanceByUserAndCurrencyEUR(User user);

    @Query("SELECT CASE m.currency WHEN 'TRY' THEN SUM(m.balance) ELSE 0 END FROM MoneyAccount m WHERE m.user = :user")
    BigDecimal findTotalBalanceByUserAndCurrencyTRY(User user);


}
