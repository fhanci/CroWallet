package com.crowallet.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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
import com.crowallet.backend.repository.AssetRepository;
import com.crowallet.backend.repository.PositionRepository;
import com.crowallet.backend.repository.RelatedTransactionsRepository;
import com.crowallet.backend.repository.TransactionRepository;
import com.crowallet.backend.repository.UserRepository;
import com.crowallet.backend.requests.SellInvestmentRequest;
import com.crowallet.backend.requests.UpdateTransaction;
import com.crowallet.backend.security.CustomUserDetails;

import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AssetService {

    private AssetRepository assetRepository;
    private TransactionRepository transactionRepository;
    private PositionRepository positionRepository;
    private UserRepository userRepository;
    private TransactionMapper transactionMapper;
    private RelatedTransactionsRepository relatedTransactionsRepository;

    public AssetService(AssetRepository assetRepository, TransactionRepository transactionRepository,
            PositionRepository positionRepository, UserRepository userRepository, TransactionMapper transactionMapper,
            RelatedTransactionsRepository relatedTransactionsRepository) {
        this.assetRepository = assetRepository;
        this.transactionRepository = transactionRepository;
        this.positionRepository = positionRepository;
        this.userRepository = userRepository;
        this.transactionMapper = transactionMapper;
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
    public boolean deleteAsset(Long assetId) {
        Asset asset = assetRepository.findById(assetId).orElseThrow(() -> new RuntimeException("User not found"));
        asset.setActive(false);
        Asset savedAsset = assetRepository.save(asset);
        return !savedAsset.isActive();
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
    public List<TransactionDTO> getTransactionByAssetId(Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        List<Transactions> transactions = transactionRepository.findByAsset(asset);
        transactions = transactions.stream().filter(data -> data.getTransactionType() == TransactionType.SELL)
                .collect(Collectors.toList());
        return transactionMapper.toTransactionDTOList(transactions);
    }

    @Transactional
    public Long findAssetByUserId() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Asset> assets = assetRepository.findByUser(user);
        return Long.valueOf(assets.size());
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
            if (!asset.isActive()) {
                System.out.println("Pasif Hesap: " + asset.getAssetName());
                continue;
            }
            System.out.println("İşlem Başladı: " + asset.getAssetName());

            List<Positions> positions = positionRepository.findAllByAssetOrderByIdAsc(asset);

            
            List<Transactions> transactions = transactionRepository.findByAsset(asset);

            System.out.println("İşlem Başladı: " + asset.getAssetName() + " Position Size: " + positions.size());
            System.out.println("İşlem Başladı: " + asset.getAssetName() + " Transaction Size: " + transactions.size());


            if (transactions.size() == 0 && (positions.size() <= 1)) {
                System.out.println("Hiç işlem bulunamadı.");
                System.out.println("Asset: " + asset.getAssetName());
                AssetResponse rAssetResponse = new AssetResponse();
                rAssetResponse.setAccountId(asset.getId());
                rAssetResponse.setAccountName(asset.getAssetName());
                rAssetResponse.setAssetName(null);
                rAssetResponse.setAssetSymbol(null);
                rAssetResponse.setAssetType(asset.getAssetType());
                rAssetResponse.setCurrentPrice(BigDecimal.ZERO);
                countId = countId + Long.parseLong("1");
                rAssetResponse.setId(countId);
                rAssetResponse.setQuantity(BigDecimal.ZERO);
                rAssetResponse.setPurchasePrice(BigDecimal.ZERO);
                rAssetResponse
                        .setTotalValue(BigDecimal.ZERO);
                rAssetResponse.setProfitLoss(BigDecimal.ZERO);
                rAssetResponse.setTransactionId(0L);
                rListAssetResponse.add(rAssetResponse);
                continue;
            }

            for (Transactions transaction : transactions) {
                AssetResponse rAssetResponse = new AssetResponse();
                List<RelatedTransactions> bySourceTransactions = relatedTransactionsRepository
                        .findBySourceTransactions(transaction);

                // Bu transaction ile ilgili işlem yapıldı mı? Evet yapıldı
                System.out.println("Transaction ile ilgili işlem yapıldı: " + bySourceTransactions.size());
                if (bySourceTransactions.size() > 0) {

                    BigDecimal quantity = BigDecimal.ZERO;

                    // Toplam Satılma Adedi
                    for (RelatedTransactions sellingData : bySourceTransactions) {
                        quantity = quantity.add(sellingData.getTargetTransactions().getQuantity());

                    }

                    if (transaction.getQuantity().subtract(quantity).compareTo(BigDecimal.ZERO) == 0) {
                        rAssetResponse.setAccountId(asset.getId());
                        rAssetResponse.setAccountName(asset.getAssetName());
                        rAssetResponse.setAssetName(null);
                        rAssetResponse.setAssetSymbol(null);
                        rAssetResponse.setAssetType(asset.getAssetType());
                        rAssetResponse.setCurrentPrice(BigDecimal.ZERO);
                        countId = countId + Long.parseLong("1");
                        rAssetResponse.setId(countId);
                        rAssetResponse.setQuantity(BigDecimal.ZERO);
                        rAssetResponse.setPurchasePrice(BigDecimal.ZERO);
                        rAssetResponse
                                .setTotalValue(BigDecimal.ZERO);
                        rAssetResponse.setProfitLoss(BigDecimal.ZERO);
                        rAssetResponse.setTransactionId(0L);
                        rListAssetResponse.add(rAssetResponse);
                        continue;
                    }

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


    public Long getSellingCount(Long transactionId) {
        Transactions mainTransactions = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction Bulunamadı"));
        BigDecimal totalSold = relatedTransactionsRepository.findBySourceTransactions(mainTransactions)
                .stream().map(rt -> rt.getTargetTransactions().getQuantity())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return Long.valueOf(totalSold.longValue());
    }

    @Transactional
    public UpdateTransaction updateAssetResponse(UpdateTransaction updateTransaction) {
        System.out.println("Gelen Data: " + updateTransaction);
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

        // Satılmamış Adet
        BigDecimal remainingQuantity = updateTransaction.getUpdatedQuantity().subtract(totalSold);

        // Fiyat Farkı
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

        // Buy ya da Create işlemi delete olduğu için related da sadece source'a bakıyoruz
        // Targettaki transactionları ve relatedTransaction işlemini siliyoruz.

        //Bence burası silinmemeli çünkü sonuçta bi satış yaptık. Satış yaptıysak ilgili mal elden çıkmıştır. Getirisini çoktan aldık.
        // List<RelatedTransactions> bySourceTransactions = relatedTransactionsRepository
        //         .findBySourceTransactions(transaction);
        // for (RelatedTransactions relatedTransactions : bySourceTransactions) {
        //     transactionRepository.delete(relatedTransactions.getTargetTransactions());
        //     relatedTransactionsRepository.delete(relatedTransactions);
        // }


        //Silinen transaction'ın bağlı olduğu asset'in positionları getiriliyor.
        List<Positions> allPositions = positionRepository.findAllByAssetOrderByCreatedDateAsc(transaction.getAsset());
        Map<String, BigDecimal> lastPrices = getLastPrices(
                transactionRepository.findAllByAsset(transaction.getAsset()));

        LocalDateTime startOfTime = LocalDateTime.now().minusYears(60);
        LocalDateTime controlTime = LocalDateTime.now().minusYears(60);

        //Tüm positionlar geziliyor
        for (Positions positions : allPositions) {
            BigDecimal costBasis = BigDecimal.ZERO;
            BigDecimal currentValue = BigDecimal.ZERO;

            //İlgili asset'in bağlı olduğu 2 pozisyon arası hangi transactionlar var kontrol ediliyor.
            List<Transactions> historyCheck = transactionRepository
                    .findAllByCreatedDateBetweenAndAsset(controlTime, positions.getCreatedDate(),positions.getAsset());


            //2 pozisyon arasında transaction yoksa işlem yoktur. İşlem yoksa bu pozisyonu tutmaya gerek yok. 
            // Demekki arada transaction yok. Haliyle işlem olmadığı için bu position'ın
            // tutulmasına gerek yok
            if (historyCheck.size() == 0) {
                positionRepository.delete(positions);
                continue;
            }

            //Eğer 2 position arasında işlem varsa geçmişten ilgili tarihe kadar olan tüm transactionlar getiriliyor
            //Çünkü bu positiondaki kar zarar durumu geçmişteki tüm transactionlardan etkileniyor.
            List<Transactions> history = transactionRepository
                    .findAllByCreatedDateBetweenAndAsset(startOfTime, positions.getCreatedDate(),positions.getAsset());

            for (Transactions t : history) {
                if (t.getTransactionType() != TransactionType.SELL) {

                    //Satış adedini buluyoruz
                    BigDecimal soldQuantity = relatedTransactionsRepository.findBySourceTransactions(t)
                            .stream()
                            .map(rt -> rt.getTargetTransactions().getQuantity())
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    //Kalan miktarı buluyoruz
                    BigDecimal remaining = t.getQuantity().subtract(soldQuantity);


                    //Toplam maliyeti ve toplam piyasa değerini buluyoruz
                    if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                        costBasis = costBasis.add(remaining.multiply(t.getUnitPrice()));
                        BigDecimal lastPrice = lastPrices.get(t.getAssetSymbol());
                        if (lastPrice != null) {
                            currentValue = currentValue.add(remaining.multiply(lastPrice));
                        }
                    }
                }
            }

            //Her pozisyon için güncellemeler yapılıyor
            positions.setCostBasis(costBasis);
            positions.setCurrentValue(currentValue);
            positions.setProfitLoss(currentValue.subtract(costBasis));

            //Maliyet sıfır ise pozisyonu sil, değilse güncelle
            if (costBasis.compareTo(BigDecimal.ZERO) == 0) {
                positionRepository.delete(positions);
            } else {
                positionRepository.save(positions);
            }

            controlTime = positions.getCreatedDate();
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
            transactions.setBuyingDateTime(sellInvestmentRequest.getBuyingDateTime()); //Satış tarihi
            transactions.setSellingPrice(sellInvestmentRequest.getSalesPrice());
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
