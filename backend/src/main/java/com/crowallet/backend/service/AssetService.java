package com.crowallet.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collector;
import java.util.stream.Collectors;

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
        position.setCostBasis(calculatedCostBasisBigDecimal); // Yanlış Hesaplıyor.
        // costBasis: 0, currentValue: 600000

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

        Map<String, BigDecimal> investmentLastPrices = this.getInvestmentLastPrices();

        for (Asset asset : assets) {
            List<Positions> positions = positionRepository.findAllByAssetOrderByIdAsc(asset);
            List<Transactions> transactions = transactionRepository.findByAsset(asset);

            for (Transactions transaction : transactions) {
                AssetResponse rAssetResponse = new AssetResponse();
                List<RelatedTransactions> bySourceTransactions = relatedTransactionsRepository
                        .findBySourceTransactions(transaction);

                // Bu transaction ile ilgili işlem yapıldı mı? Evet yapıldı
                if (bySourceTransactions.size() > 0) {

                    BigDecimal quantity = BigDecimal.ZERO;

                    // Toplam Satılma Adedi
                    for (RelatedTransactions sellingData : bySourceTransactions) {
                        quantity = quantity.add(sellingData.getTargetTransactions().getQuantity());

                    }

                    if (transaction.getQuantity().subtract(quantity) == BigDecimal.ZERO) {

                        continue;
                    }

                    // Long bigId = 0L;

                    rAssetResponse.setAccountId(asset.getId());
                    rAssetResponse.setAccountName(asset.getAssetName());
                    rAssetResponse.setAssetName(transaction.getAssetName());
                    rAssetResponse.setAssetSymbol(transaction.getAssetSymbol());
                    rAssetResponse.setAssetType(asset.getAssetType());
                    rAssetResponse.setCurrentPrice(investmentLastPrices.get(rAssetResponse.getAssetSymbol()));
                    countId = countId + Long.parseLong("1");
                    rAssetResponse.setId(countId);
                    rAssetResponse.setQuantity(transaction.getQuantity().subtract(quantity));
                    rAssetResponse.setPurchasePrice(transaction.getUnitPrice());
                    rAssetResponse
                            .setTotalValue(rAssetResponse.getCurrentPrice().multiply(rAssetResponse.getQuantity()));
                    rAssetResponse.setProfitLoss(positions.get(0).getProfitLoss()); // Bu değişecek
                    rAssetResponse.setTransactionId(transaction.getId());
                    rListAssetResponse.add(rAssetResponse);
                } else {

                    // Bu Transaction Selling Datası. Bunu Listelemeye Dahil Etme
                    List<RelatedTransactions> byTargetTransactionsSelling = relatedTransactionsRepository
                            .findByTargetTransactions(transaction);
                    if (byTargetTransactionsSelling.size() > 0) {
                        continue;
                    }

                    // İlgili Transaction da herhangi bir işlem yapılmamış
                    rAssetResponse.setAccountId(asset.getId());
                    rAssetResponse.setAccountName(asset.getAssetName());
                    rAssetResponse.setAssetName(transaction.getAssetName());
                    rAssetResponse.setAssetSymbol(transaction.getAssetSymbol());
                    rAssetResponse.setAssetType(asset.getAssetType());
                    rAssetResponse.setCurrentPrice(investmentLastPrices.get(rAssetResponse.getAssetSymbol()));
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

    public Map<String, BigDecimal> getInvestmentLastPrices() {
        Set<String> symbols = transactionRepository.findAll().stream().map(Transactions::getAssetSymbol)
                .collect(Collectors.toSet());

        Map<String, BigDecimal> lastPrices = new HashMap<>();
        for (String symbol : symbols) {
            BigDecimal price = transactionRepository.findByAssetSymbolOrderByIdDesc(symbol)
                    .get(0).getUnitPrice();
            lastPrices.put(symbol, price);
        }
        return lastPrices;
    }

    @Transactional
    public UpdateTransaction updateAssetResponse(UpdateTransaction updateTransaction) {
        Transactions mainTransactions = transactionRepository.findById(updateTransaction.getTransactionId())
                .orElseThrow(() -> new RuntimeException("Transaction Bulunamadı"));

        
        BigDecimal oldQuantity = mainTransactions.getQuantity();
        BigDecimal oldPrice = mainTransactions.getUnitPrice();

        
        BigDecimal totalSold = relatedTransactionsRepository.findBySourceTransactions(mainTransactions)
                .stream().map(rt -> rt.getTargetTransactions().getQuantity())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (updateTransaction.getUpdatedQuantity().compareTo(totalSold) < 0) {
            throw new RuntimeException("Hata: Yeni miktar satılan miktardan az olamaz!");
        }

        // 2. TRANSACTION GÜNCELLE
        mainTransactions.setQuantity(updateTransaction.getUpdatedQuantity());
        mainTransactions.setUnitPrice(updateTransaction.getUpdatedPurchasePrice());
        mainTransactions.setTransactionType(TransactionType.UPDATE);
        transactionRepository.save(mainTransactions);

        
        //Satılmamış Adet
        BigDecimal remainingQuantity = updateTransaction.getUpdatedQuantity().subtract(totalSold);

        //Fiyat Farkı
        BigDecimal oldCost = oldQuantity.subtract(totalSold).multiply(oldPrice);
        BigDecimal newCost = remainingQuantity
                .multiply(updateTransaction.getUpdatedPurchasePrice());
        BigDecimal costDifference = newCost.subtract(oldCost);

        // Güncel Değer Farkı
        BigDecimal lastPrice = getLastPrices(List.of(mainTransactions)).get(mainTransactions.getAssetSymbol());
        BigDecimal valueDifference = updateTransaction.getUpdatedQuantity().subtract(oldQuantity)
                .multiply(lastPrice != null ? lastPrice : BigDecimal.ZERO);

        List<Positions> affectedPositions = positionRepository.findAllByAssetAndCreatedDateGreaterThanEqual(
                mainTransactions.getAsset(),
                mainTransactions.getCreatedDate() // İşlemden sonraki pozisyonlar
        );

        for (Positions pos : affectedPositions) {
            pos.setCostBasis(pos.getCostBasis().add(costDifference));
            pos.setCurrentValue(pos.getCurrentValue().add(valueDifference));
            pos.setProfitLoss(pos.getCurrentValue().subtract(pos.getCostBasis()));

            positionRepository.save(pos);
        }

        return updateTransaction;
    }

    @Transactional
    public Boolean deleteTransaction(AssetResponse assetResponse, Long transactionId) {
        Transactions transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction Bulunamadı"));

        // İlgili Transaction (Buy ya da Create) Siliniyor.
        transactionRepository.delete(transaction);
        transactionRepository.flush();

        // Buy ya da Create işlemi delete olduğu için related da sadece source'a
        // bakıyoruz
        // Targettaki transactionları ve relatedTransaction işlemini siliyoruz.
        List<RelatedTransactions> bySourceTransactions = relatedTransactionsRepository
                .findBySourceTransactions(transaction);
        for (RelatedTransactions relatedTransactions : bySourceTransactions) {
            transactionRepository.delete(relatedTransactions.getTargetTransactions());
            relatedTransactionsRepository.delete(relatedTransactions);
        }

        List<Positions> allPositions = positionRepository.findAllByAssetOrderByCreatedDateAsc(transaction.getAsset());
        Map<String, BigDecimal> lastPrices = getLastPrices(
                transactionRepository.findAllByAsset(transaction.getAsset()));

        LocalDateTime startOfTime = LocalDateTime.now().minusYears(60);
        LocalDateTime controlTime = LocalDateTime.now().minusYears(60);
        int controlFlag = 0;

        for (Positions positions : allPositions) {
            BigDecimal costBasis = BigDecimal.ZERO;
            BigDecimal currentValue = BigDecimal.ZERO;

            List<Transactions> historyCheck = transactionRepository
                    .findAllByCreatedDateBetween(controlTime, positions.getCreatedDate());

            // Demekki arada transaction yok. Haliyle işlem olmadığı için bu position'ın
            // tutulmasına gerek yok
            if (historyCheck.size() == 0) {
                controlFlag += 1;
                positionRepository.delete(positions);
                continue;
            }
            List<Transactions> history = transactionRepository
                    .findAllByCreatedDateBetween(startOfTime, positions.getCreatedDate());

            for (Transactions t : history) {
                if (t.getTransactionType() != TransactionType.SELL) {
                    BigDecimal soldQuantity = relatedTransactionsRepository.findBySourceTransactions(t)
                            .stream()
                            .map(rt -> rt.getTargetTransactions().getQuantity())
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal remaining = t.getQuantity().subtract(soldQuantity);

                    if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                        costBasis = costBasis.add(remaining.multiply(t.getUnitPrice()));
                        BigDecimal lastPrice = lastPrices.get(t.getAssetSymbol());
                        if (lastPrice != null) {
                            currentValue = currentValue.add(remaining.multiply(lastPrice));
                        }
                    }
                }
            }

            positions.setCostBasis(costBasis);
            positions.setCurrentValue(currentValue);
            positions.setProfitLoss(currentValue.subtract(costBasis));

            if (costBasis.compareTo(BigDecimal.ZERO) == 0) {
                positionRepository.delete(positions);
            } else {
                positionRepository.save(positions);
            }

            controlTime = positions.getCreatedDate();
        }

        if (controlFlag == allPositions.size()) {
            assetRepository.delete(transaction.getAsset());
        }
        return true;
    }

    public Map<String, BigDecimal> getLastPrices(List<Transactions> allTransactionByAsset) {
        Set<String> symbols = allTransactionByAsset.stream()
                .map(Transactions::getAssetSymbol)
                .collect(Collectors.toSet());

        System.out.println("Semboller Burda");
        System.out.println(symbols);
        Map<String, BigDecimal> lastPrices = new HashMap<>();
        for (String symbol : symbols) {
            BigDecimal price = transactionRepository.findByAssetSymbolOrderByIdDesc(symbol)
                    .get(0).getCurrentValue();
            lastPrices.put(symbol, price);
        }

        return lastPrices;
    }

    public Positions createNewPositions(List<Transactions> allTransactionByAsset, Asset asset) {
        BigDecimal currentValue = BigDecimal.ZERO;
        BigDecimal costBasis = BigDecimal.ZERO;

        Set<String> symbols = allTransactionByAsset.stream()
                .map(Transactions::getAssetSymbol)
                .collect(Collectors.toSet());

        System.out.println("Semboller Burda");
        System.out.println(symbols);
        Map<String, BigDecimal> lastPrices = new HashMap<>();
        for (String symbol : symbols) {
            BigDecimal price = transactionRepository.findByAssetSymbolOrderByIdDesc(symbol)
                    .get(0).getCurrentValue();
            lastPrices.put(symbol, price);
        }

        System.out.println("Son Fiyatlar Burda");
        System.out.println(lastPrices);

        for (Transactions transactions : allTransactionByAsset) {
            TransactionType type = transactions.getTransactionType();
            if (type != TransactionType.SELL) {

                // ilgili transaction üzerinden bir satış olmuş mu
                List<RelatedTransactions> bySourceTransactions = relatedTransactionsRepository
                        .findBySourceTransactions(transactions);

                BigDecimal soldQuantity = BigDecimal.ZERO;

                // Eğer satış olduysa kaç adet satıldı hesaplanıyor
                if (bySourceTransactions != null) {
                    for (RelatedTransactions sellingData : bySourceTransactions) {
                        soldQuantity = soldQuantity.add(sellingData.getTargetTransactions().getQuantity());
                    }
                }

                // Elde kalan adet
                BigDecimal remainingQuantity = transactions.getQuantity().subtract(soldQuantity);

                if (remainingQuantity.compareTo(BigDecimal.ZERO) > 0) {

                    // Maliyet = Elde kalan adet * transaction alındığı zamanki fiyat
                    costBasis = costBasis.add(remainingQuantity.multiply(transactions.getUnitPrice()));

                    // Güncel değer = Kalan adet * en güncel fiyat
                    BigDecimal lastPrice = lastPrices.get(transactions.getAssetSymbol());
                    if (lastPrice != null) {
                        currentValue = currentValue.add(remainingQuantity.multiply(lastPrice));
                    }
                }
            }
        }

        Positions newPosition = new Positions();
        System.out.println("Güncel Maliyet: " + costBasis);
        System.out.println("Güncel Değer: " + currentValue);
        System.out.println("Profit Loss: " + currentValue.subtract(costBasis));
        newPosition.setAsset(asset);
        newPosition.setCostBasis(costBasis); // Maliyet --> Elde kalanlar * Maliyetleri
        newPosition.setCurrentValue(currentValue); // Elde Kalanlar * En sonuncu Altın Hise
        newPosition.setProfitLoss(currentValue.subtract(costBasis));
        return positionRepository.save(newPosition);

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

        Positions newPositions = this.createNewPositions(allTransactionByAsset, assetOptional.get());
        if (newPositions == null)
            throw new Error("Yeni bir position kaydı açılamadı");
        // Fiyatları

        // Positions positionByAsset =
        // positionRepository.findByAsset(assetOptional.get());
        // positionByAsset.setCostBasis(sum);
        // positionByAsset.setCurrentValue(sum);
        // positionRepository.save(positionByAsset);
        return listTransactionDTOs;
    }

    @Transactional
    public List<SellInvestmentRequest> sellInvestments(List<SellInvestmentRequest> sellInvestmentRequestsList) {
        for (SellInvestmentRequest sellInvestmentRequest : sellInvestmentRequestsList) {
            Optional<Transactions> optionalTransaction = transactionRepository
                    .findById(sellInvestmentRequest.getTransactionId());
            if (!optionalTransaction.isPresent())
                return null;

            // Satma log'u oluşturuldu
            Transactions transactions = new Transactions();
            transactions.setAsset(optionalTransaction.get().getAsset());
            transactions.setAssetName(optionalTransaction.get().getAssetName());
            transactions.setAssetSymbol(optionalTransaction.get().getAssetSymbol());
            transactions.setQuantity(sellInvestmentRequest.getSellCount());
            transactions.setTotalValue(sellInvestmentRequest.getTotalPrice());
            transactions.setTransactionType(TransactionType.SELL);
            transactions.setUnitPrice(sellInvestmentRequest.getUnitPrice());
            transactions.setCurrentValue(sellInvestmentRequest.getCurrentPrice());
            Transactions savedTransactions = transactionRepository.save(transactions);

            // Kimden Kime Satıldığı Loglandı
            RelatedTransactions relatedTransactions = new RelatedTransactions();
            relatedTransactions.setSourceTransactions(optionalTransaction.get());
            relatedTransactions.setTargetTransactions(savedTransactions);
            relatedTransactions.setTransactionType(TransactionType.SELL);
            relatedTransactionsRepository.save(relatedTransactions);

        }

        Optional<Transactions> byId = transactionRepository
                .findById(sellInvestmentRequestsList.get(0).getTransactionId());
        Asset asset = byId.get().getAsset();
        List<Transactions> allTransactionByAsset = transactionRepository.findAllByAsset(asset);
        System.out.println("Asset Burda: ");
        System.out.println(asset);

        Positions newPositions = this.createNewPositions(allTransactionByAsset, asset);
        if (newPositions == null)
            throw new Error("Yeni bir position kaydı açılamadı");
        return sellInvestmentRequestsList;
    }

}
