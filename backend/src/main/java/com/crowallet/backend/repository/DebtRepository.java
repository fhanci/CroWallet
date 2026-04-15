package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crowallet.backend.entity.Debt;
import java.util.List;
import com.crowallet.backend.entity.User;


@Repository
public interface DebtRepository extends JpaRepository<Debt, Long> {

    List<Debt> findByUser(User user);
    
}
