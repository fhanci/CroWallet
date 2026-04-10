package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.crowallet.backend.entity.AccounttoAccountTransfer;

public interface AccounttoAccountTransferRepository extends JpaRepository<AccounttoAccountTransfer, Long>{
    
}
