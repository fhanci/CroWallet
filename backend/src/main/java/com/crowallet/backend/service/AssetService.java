package com.crowallet.backend.service;

import java.util.List;
import java.util.Optional;

import org.aspectj.weaver.Position;

import com.crowallet.backend.entity.Asset;
import com.crowallet.backend.entity.Positions;
import com.crowallet.backend.entity.Transactions;
import com.crowallet.backend.repository.AssetRepository;
import com.crowallet.backend.repository.PositionRepository;
import com.crowallet.backend.repository.TransactionRepository;

public class AssetService {

    private AssetRepository assetRepository;
    private TransactionRepository transactionRepository;
    private PositionRepository positionRepository;

    public AssetService(AssetRepository assetRepository,TransactionRepository transactionRepository,PositionRepository positionRepository){
        this.assetRepository = assetRepository;
        this.transactionRepository = transactionRepository;
        this.positionRepository = positionRepository;
    }

    public Long createAsset(Asset asset){
        Asset savedAsset = assetRepository.save(asset);
        return savedAsset.getId();
    }

    public List<Transactions> createTransaction(List<Transactions> transactions){
        List<Transactions> transactionList = transactionRepository.saveAll(transactions);
        return transactionList;
    }

    public Positions createPosition(Positions position){
        Positions savedPosition = positionRepository.save(position);
        return savedPosition;
    }
    
    
}
