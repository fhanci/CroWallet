package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crowallet.backend.entity.Asset;
import com.crowallet.backend.entity.Transactions;
import java.util.List;



@Repository
public interface TransactionRepository extends JpaRepository<Transactions, Long>{
    List<Transactions> findByAsset(Asset asset);

    List<Transactions> findAllByAsset(Asset asset);


    List<Transactions> findByAssetSymbolOrderByIdDesc(String assetSymbol);
    
}
