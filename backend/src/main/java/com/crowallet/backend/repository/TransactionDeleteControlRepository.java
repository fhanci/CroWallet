package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.crowallet.backend.entity.Asset;
import com.crowallet.backend.entity.TransactionDeleteControl;


public interface TransactionDeleteControlRepository extends JpaRepository<TransactionDeleteControl, Long>{

    TransactionDeleteControl findByAsset(Asset asset);
    
}
