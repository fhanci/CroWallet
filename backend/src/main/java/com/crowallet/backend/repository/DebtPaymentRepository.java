package com.crowallet.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.crowallet.backend.entity.DebtPayment;

@Repository
public interface DebtPaymentRepository extends JpaRepository<DebtPayment, Long> {
    
    List<DebtPayment> findByDebtId(Long debtId);
    
    List<DebtPayment> findByDebtIdAndStatus(Long debtId, String status);
    
    @Query("SELECT dp FROM DebtPayment dp WHERE dp.debt.id = :debtId AND dp.status = 'PENDING' ORDER BY dp.paymentDate ASC")
    List<DebtPayment> findPendingPaymentsByDebtId(@Param("debtId") Long debtId);

    @Query("SELECT dp FROM DebtPayment dp WHERE dp.debt.user.id = :userId AND dp.status = 'PENDING' ORDER BY dp.paymentDate ASC")
    List<DebtPayment> findPendingPaymentsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT dp FROM DebtPayment dp WHERE dp.debt.user.id = :userId AND dp.status = 'PENDING' AND dp.paymentDate <= :date ORDER BY dp.paymentDate ASC")
    List<DebtPayment> findUpcomingPaymentsByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
    
    @Query("SELECT dp FROM DebtPayment dp WHERE dp.debt.user.id = :userId AND dp.status = 'PENDING' ORDER BY dp.paymentDate ASC")
    List<DebtPayment> findAllPendingPaymentsByUserId(@Param("userId") Long userId);
    
    @Modifying
    @Query("DELETE FROM DebtPayment dp WHERE dp.debt.id = :debtId")
    void deleteByDebtId(@Param("debtId") Long debtId);
}

