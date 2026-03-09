package com.crowallet.backend.service;

import java.util.ArrayList;
import java.util.List;

import com.crowallet.backend.dto.AssetDTO;
import com.crowallet.backend.dto.PositionDTO;
import com.crowallet.backend.dto.TransactionDTO;
import com.crowallet.backend.entity.Asset;
import com.crowallet.backend.entity.Positions;
import com.crowallet.backend.entity.Transactions;
import com.crowallet.backend.entity.User;
import com.crowallet.backend.mapper.AssetMapper;
import com.crowallet.backend.mapper.PositionsMapper;
import com.crowallet.backend.mapper.TransactionMapper;
import com.crowallet.backend.repository.AssetRepository;
import com.crowallet.backend.repository.PositionRepository;
import com.crowallet.backend.repository.TransactionRepository;
import com.crowallet.backend.repository.UserRepository;
import com.crowallet.backend.security.CustomUserDetails;

import jakarta.transaction.Transactional;

import org.aspectj.weaver.Position;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AssetService {

    private AssetRepository assetRepository;
    private TransactionRepository transactionRepository;
    private PositionRepository positionRepository;
    private UserRepository userRepository;
    private TransactionMapper transactionMapper;

    public AssetService(AssetRepository assetRepository,TransactionRepository transactionRepository,PositionRepository positionRepository, UserRepository userRepository,TransactionMapper transactionMapper){
        this.assetRepository = assetRepository;
        this.transactionRepository = transactionRepository;
        this.positionRepository = positionRepository;
        this.userRepository = userRepository;
        this.transactionMapper = transactionMapper;
    }

    @Transactional
    public Long createAsset(AssetDTO asset){
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));

        Asset assetEntity = AssetMapper.INSTANCE.toAsset(asset);
        assetEntity.setUser(user);

        Asset savedAsset = assetRepository.save(assetEntity);
        return savedAsset.getId();
    }

    @Transactional
    public List<TransactionDTO> createTransaction(List<TransactionDTO> transactions){
        List<TransactionDTO> transactionDTOList = new ArrayList<>();
        for(TransactionDTO transactionDTO : transactions){
            Long assetId = transactionDTO.getAssetId();
            if (assetId == null) {
                throw new RuntimeException("İlgili Hesap ID Bulunamadı. Transaction");
            }
            Asset asset = assetRepository.findById(assetId)
                    .orElseThrow(() -> new RuntimeException("Asset not found"));

            Transactions transactionEntity = transactionMapper.toTransaction(transactionDTO);
            transactionEntity.setAsset(asset);

            transactionRepository.save(transactionEntity);

            // Entity'yi DTO'ya çevir
            TransactionDTO savedDTO = transactionMapper.toTransactionDTO(transactionEntity);
            transactionDTOList.add(savedDTO);
        }
        return transactionDTOList;
    }

    @Transactional
    public PositionDTO createPosition(PositionDTO position){
        Long assetId = (Long) position.getAssetId();
        if (assetId == null) {
            throw new RuntimeException("İlgili Hesap ID Bulunamadı. Position");
        }
        Asset asset = assetRepository.findById(assetId).orElseThrow(() -> new RuntimeException("Asset not found"));

        Positions positionEntity = PositionsMapper.INSTANCE.toPosition(position);
        positionEntity.setAsset(asset);

        Positions savedPosition = positionRepository.save(positionEntity);
        return PositionsMapper.INSTANCE.toPositionDTO(savedPosition);
    }
    
    
}
