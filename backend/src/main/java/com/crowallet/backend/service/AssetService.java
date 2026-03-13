package com.crowallet.backend.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.crowallet.backend.dto.AssetDTO;
import com.crowallet.backend.dto.AssetResponse;
import com.crowallet.backend.dto.PositionDTO;
import com.crowallet.backend.dto.TransactionDTO;
import com.crowallet.backend.entity.Asset;
import com.crowallet.backend.entity.Positions;
import com.crowallet.backend.entity.RelatedTransactions;
import com.crowallet.backend.entity.TransactionType;
import com.crowallet.backend.entity.Transactions;
import com.crowallet.backend.entity.User;
import com.crowallet.backend.mapper.AssetMapper;
import com.crowallet.backend.mapper.PositionsMapper;
import com.crowallet.backend.mapper.TransactionMapper;
import com.crowallet.backend.repository.*;
import com.crowallet.backend.requests.SellInvestmentRequest;
import com.crowallet.backend.requests.UpdateTransaction;
import com.crowallet.backend.security.CustomUserDetails;

import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AssetService {

    private final AccountRepository accountRepository;
    private AssetRepository assetRepository;
    private TransactionRepository transactionRepository;
    private PositionRepository positionRepository;
    private UserRepository userRepository;
    private TransactionMapper transactionMapper;
    private RelatedTransactionsRepository relatedTransactionsRepository;

    public AssetService(AssetRepository assetRepository, TransactionRepository transactionRepository,
            PositionRepository positionRepository, UserRepository userRepository, TransactionMapper transactionMapper,
            AccountRepository accountRepository, RelatedTransactionsRepository relatedTransactionsRepository) {
        this.assetRepository = assetRepository;
        this.transactionRepository = transactionRepository;
        this.positionRepository = positionRepository;
        this.userRepository = userRepository;
        this.transactionMapper = transactionMapper;
        this.accountRepository = accountRepository;
        this.relatedTransactionsRepository = relatedTransactionsRepository;
    }

    @Transactional
    public Long createAsset(AssetDTO asset) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Asset assetEntity = AssetMapper.INSTANCE.toAsset(asset);
        assetEntity.setUser(user);

        Asset savedAsset = assetRepository.save(assetEntity);
        return savedAsset.getId();
    }

    @Transactional
    public List<TransactionDTO> createTransaction(List<TransactionDTO> transactions) {
        List<TransactionDTO> transactionDTOList = new ArrayList<>();
        for (TransactionDTO transactionDTO : transactions) {
            Long assetId = transactionDTO.getAssetId();
            if (assetId == null) {
                throw new RuntimeException("İlgili Hesap ID Bulunamadı. Transaction");
            }
            Asset asset = assetRepository.findById(assetId)
                    .orElseThrow(() -> new RuntimeException("Asset not found"));

            Transactions transactionEntity = transactionMapper.toTransaction(transactionDTO);
            transactionEntity.setAsset(asset);

            transactionRepository.save(transactionEntity);

            TransactionDTO savedDTO = transactionMapper.toTransactionDTO(transactionEntity);
            transactionDTOList.add(savedDTO);
        }
        return transactionDTOList;
    }

    @Transactional
    public PositionDTO createPosition(PositionDTO position) {
        Long assetId = (Long) position.getAssetId();
        if (assetId == null) {
            throw new RuntimeException("İlgili Hesap ID Bulunamadı. Position");
        }
        Asset asset = assetRepository.findById(assetId).orElseThrow(() -> new RuntimeException("Asset not found"));
        BigDecimal calculatedCostBasisBigDecimal = this.calculateCostBasis(position);
        position.setCostBasis(calculatedCostBasisBigDecimal);

        Positions positionEntity = PositionsMapper.INSTANCE.toPosition(position);
        positionEntity.setAsset(asset);

        Positions savedPosition = positionRepository.save(positionEntity);
        return PositionsMapper.INSTANCE.toPositionDTO(savedPosition);
    }

    public BigDecimal calculateCostBasis(PositionDTO positionDTO) {
        Optional<Asset> asset = assetRepository.findById(positionDTO.getAssetId());
        if (!asset.isPresent()) {
            return null;
        }

        List<Transactions> allByAsset = transactionRepository.findAllByAsset(asset.get());
        BigDecimal sumBigDecimal = BigDecimal.ZERO;

        for (Transactions transactions : allByAsset) {
            sumBigDecimal = sumBigDecimal.add(transactions.getQuantity().multiply(transactions.getUnitPrice()));
        }
        return sumBigDecimal;
    }

    @Transactional
    public List<AssetResponse> getAssetsByUserId() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<AssetResponse> rListAssetResponse = new ArrayList<AssetResponse>();
        List<Asset> assets = assetRepository.findAllByUser(user);
        Long countId = Long.parseLong("0");
        for (Asset asset : assets) {
            List<Positions> positions = positionRepository.findAllByAssetOrderByIdAsc(asset);
            List<Transactions> transactions = transactionRepository.findByAsset(asset);
            System.out.println("Tüm TRANSACTIONLAR");
            System.out.println(transactions);
            for (Transactions transaction : transactions) {
                AssetResponse rAssetResponse = new AssetResponse();
                List<RelatedTransactions> bySourceTransactions = relatedTransactionsRepository
                        .findBySourceTransactions(transaction);
                System.out.println(bySourceTransactions);
                System.out.println("BUNU NET GÖRMEM LAZIM 1");

                //Bu transaction ile ilgili işlem yapıldı mı? Evet yapıldı
                if (bySourceTransactions.size() > 0) {
                    System.out.println("Ana Yerdeiz");

                    BigDecimal quantity = BigDecimal.ZERO;

                    //Toplam Satılma Adedi
                    for (RelatedTransactions sellingData : bySourceTransactions) {
                        quantity = quantity.add(sellingData.getTargetTransactions().getQuantity());
                        System.out.println("Toplam Quantity Bu Çıktı");
                    }
                    System.out.println("Toplam Quantity Bu Çıktı " + quantity );

                    // Long bigId = 0L;

                    rAssetResponse.setAccountId(asset.getId());
                    rAssetResponse.setAccountName(asset.getAssetName());
                    rAssetResponse.setAssetName(transaction.getAssetName());
                    rAssetResponse.setAssetSymbol(transaction.getAssetSymbol());
                    rAssetResponse.setAssetType(asset.getAssetType());
                    rAssetResponse.setCurrentPrice(bySourceTransactions.get(bySourceTransactions.size() - 1)
                            .getTargetTransactions().getUnitPrice());
                    countId = countId + Long.parseLong("1");
                    rAssetResponse.setId(countId);
                    rAssetResponse.setQuantity(transaction.getQuantity().subtract(quantity));
                    System.out.println("İşlem Yapılınca Çıkan Quantity: " + rAssetResponse.getQuantity());
                    rAssetResponse.setPurchasePrice(transaction.getUnitPrice());     
                    rAssetResponse.setTotalValue(rAssetResponse.getCurrentPrice().multiply(rAssetResponse.getQuantity()));
                    rAssetResponse.setProfitLoss(positions.get(0).getProfitLoss());  //Bu değişecek                                     
                    rAssetResponse.setTransactionId(transaction.getId());
                    rListAssetResponse.add(rAssetResponse);
                } else {

                    //Bu Transaction Selling Datası. Bunu Listelemeye Dahil Etme
                    List<RelatedTransactions> byTargetTransactionsSelling = relatedTransactionsRepository.findByTargetTransactions(transaction);
                    if (byTargetTransactionsSelling.size() > 0){
                        System.out.println("BUNU NET GÖRMEM LAZIM 2");
                        continue;
                    }
                    System.out.println("BUNU NET görmemem LAZIM 1");
                        

                    //İlgili Transaction da herhangi bir işlem yapılmamış
                    rAssetResponse.setAccountId(asset.getId());
                    rAssetResponse.setAccountName(asset.getAssetName());
                    rAssetResponse.setAssetName(transaction.getAssetName());
                    rAssetResponse.setAssetSymbol(transaction.getAssetSymbol());
                    rAssetResponse.setAssetType(asset.getAssetType());
                    rAssetResponse.setCurrentPrice(transaction.getUnitPrice());
                    countId = countId + Long.parseLong("1");
                    rAssetResponse.setId(countId);
                    rAssetResponse.setProfitLoss(positions.get(0).getProfitLoss());
                    rAssetResponse.setPurchasePrice(transaction.getUnitPrice());
                    rAssetResponse.setQuantity(transaction.getQuantity());
                    rAssetResponse.setTotalValue(transaction.getUnitPrice().multiply(transaction.getQuantity()));
                    rAssetResponse.setTransactionId(transaction.getId());
                    rListAssetResponse.add(rAssetResponse);
                }

            }

        }
        return rListAssetResponse;
    }

    @Transactional
    public UpdateTransaction updateAssetResponse(UpdateTransaction updateTransaction) {
        Optional<Transactions> byId = transactionRepository.findById(updateTransaction.getTransactionId());
        if (!byId.isPresent())
            return null;

        // Transaction Güncellemesi
        byId.get().setQuantity(updateTransaction.getUpdatedQuantity());
        byId.get().setUnitPrice(updateTransaction.getUpdatedPurchasePrice());
        byId.get().setTotalValue(byId.get().getQuantity().multiply(byId.get().getUnitPrice()));
        byId.get().setTransactionType(TransactionType.UPDATE);
        transactionRepository.save(byId.get());

        // Position Güncellemesi
        List<Transactions> byAssets = transactionRepository.findByAsset(byId.get().getAsset());
        BigDecimal totalCostBasis = BigDecimal.ZERO;
        for (Transactions transactions : byAssets) {
            totalCostBasis = totalCostBasis.add(transactions.getTotalValue());
        }
        Positions position = positionRepository.findByAsset(byId.get().getAsset());
        position.setCostBasis(totalCostBasis);
        position.setCurrentValue(totalCostBasis);
        positionRepository.save(position);

        updateTransaction.setQuantity(byId.get().getQuantity());
        updateTransaction.setPurchasePrice(byId.get().getUnitPrice());
        updateTransaction.setTotalValue(updateTransaction.getQuantity().add(updateTransaction.getPurchasePrice()));
        return updateTransaction;
    }

    @Transactional
    public Boolean deleteTransaction(AssetResponse assetResponse, Long transactionId) {
        Optional<Transactions> byId = transactionRepository.findById(transactionId);
        System.out.println("\n\nPAT1\n\n");
        if (!byId.isPresent())
            return false;
        System.out.println("\n\nPAT2\n\n");
        Transactions transaction = byId.get();
        transactionRepository.delete(transaction);
        System.out.println("\n\nPAT3\n\n");

        System.out.println("AccountID: " + assetResponse.getAccountId());
        Optional<Asset> findAsset = assetRepository.findById(assetResponse.getAccountId());
        if (!findAsset.isPresent())
            return false;
        System.out.println("\n\nPAT4\n\n");

        List<Transactions> allTransactions = transactionRepository.findAllByAsset(findAsset.get());
        BigDecimal sum = BigDecimal.ZERO;
        System.out.println("\n\nPAT5\n\n");

        for (Transactions transactions : allTransactions) {
            sum = sum.add(transactions.getTotalValue());
        }

        System.out.println("\n\nPAT6\n\n");

        Positions position = positionRepository.findByAsset(findAsset.get());
        position.setCostBasis(sum);
        position.setCurrentValue(sum);
        Positions savedPositions = positionRepository.save(position);
        if (savedPositions.getCostBasis() == BigDecimal.ZERO) {
            assetRepository.delete(findAsset.get());
            positionRepository.delete(savedPositions);
        }
        System.out.println("\n\nPAT7\n\n");
        return true;
    }

    @Transactional
    public List<TransactionDTO> addTransaction(List<TransactionDTO> listTransactionDTOs) {
        Optional<Asset> assetOptional = assetRepository.findById(listTransactionDTOs.get(0).getAssetId());
        if (!assetOptional.isPresent())
            return null;
        for (TransactionDTO transactionDTO : listTransactionDTOs) {
            Transactions transaction = TransactionMapper.INSTANCE.toTransaction(transactionDTO);
            transaction.setAsset(assetOptional.get());
            transactionRepository.save(transaction);
        }
        List<Transactions> allTransactionByAsset = transactionRepository.findAllByAsset(assetOptional.get());
        BigDecimal sum = BigDecimal.ZERO;
        for (Transactions transactions : allTransactionByAsset) {
            sum = sum.add(transactions.getTotalValue());
        }
        Positions positionByAsset = positionRepository.findByAsset(assetOptional.get());
        positionByAsset.setCostBasis(sum);
        positionByAsset.setCurrentValue(sum);
        positionRepository.save(positionByAsset);
        return listTransactionDTOs;
    }

    @Transactional
    public List<SellInvestmentRequest> sellInvestments(List<SellInvestmentRequest> sellInvestmentRequestsList) {
        for (SellInvestmentRequest sellInvestmentRequest : sellInvestmentRequestsList) {
            Optional<Transactions> optionalTransaction = transactionRepository
                    .findById(sellInvestmentRequest.getTransactionId());
            if (!optionalTransaction.isPresent())
                return null;
            Transactions transactions = new Transactions();
            transactions.setAsset(optionalTransaction.get().getAsset());
            transactions.setAssetName(optionalTransaction.get().getAssetName());
            transactions.setAssetSymbol(optionalTransaction.get().getAssetSymbol());
            transactions.setQuantity(sellInvestmentRequest.getSellCount());
            transactions.setTotalValue(sellInvestmentRequest.getTotalPrice());
            transactions.setTransactionType(TransactionType.SELL);
            transactions.setUnitPrice(sellInvestmentRequest.getUnitPrice());
            Transactions savedTransactions = transactionRepository.save(transactions);

            RelatedTransactions relatedTransactions = new RelatedTransactions();
            relatedTransactions.setSourceTransactions(optionalTransaction.get());
            relatedTransactions.setTargetTransactions(savedTransactions);
            relatedTransactions.setTransactionType(TransactionType.SELL);
            relatedTransactionsRepository.save(relatedTransactions);

        }
        return sellInvestmentRequestsList;

    }

}
