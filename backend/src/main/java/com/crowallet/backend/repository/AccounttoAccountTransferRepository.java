package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.crowallet.backend.entity.AccounttoAccountTransfer;
import com.crowallet.backend.entity.Transfer;

import java.util.List;


public interface AccounttoAccountTransferRepository extends JpaRepository<AccounttoAccountTransfer, Long>{

    List<AccounttoAccountTransfer> findByTransfer(Transfer transfer);
    
}
