package com.crowallet.backend.service;

import com.crowallet.backend.repository.MoneyAccountRepository;
import com.crowallet.backend.repository.TransferRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import com.crowallet.backend.dto.AccountSummaryResponseDTO;
import com.crowallet.backend.dto.AssetDTO;
import com.crowallet.backend.dto.AssetResponse;
import com.crowallet.backend.dto.MoneyAccountResponseDTO;
import com.crowallet.backend.dto.PositionDTO;
import com.crowallet.backend.dto.TransactionDTO;
import com.crowallet.backend.dto.UserAccountSummaryInvestmentDTO;
import com.crowallet.backend.dto.UserBalanceDTO;
import com.crowallet.backend.entity.Asset;
import com.crowallet.backend.entity.MoneyAccount;
import com.crowallet.backend.entity.Positions;
import com.crowallet.backend.entity.RelatedTransactions;
import com.crowallet.backend.entity.TransactionDeleteControl;
import com.crowallet.backend.entity.TransactionType;
import com.crowallet.backend.entity.Transactions;
import com.crowallet.backend.entity.Transfer;
import com.crowallet.backend.entity.User;
import com.crowallet.backend.mapper.AssetMapper;
import com.crowallet.backend.mapper.MoneyAccountMapper;
import com.crowallet.backend.mapper.PositionsMapper;
import com.crowallet.backend.mapper.TransactionMapper;
import com.crowallet.backend.repository.AssetRepository;
import com.crowallet.backend.repository.PositionRepository;
import com.crowallet.backend.repository.RelatedTransactionsRepository;
import com.crowallet.backend.repository.TransactionDeleteControlRepository;
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

    private final TransferRepository transferRepository;
    private final MoneyAccountRepository moneyAccountRepository;
    private final AssetRepository assetRepository;
    private final TransactionRepository transactionRepository;
    private final PositionRepository positionRepository;
    private final UserRepository userRepository;
    private final TransactionMapper transactionMapper;
    private final RelatedTransactionsRepository relatedTransactionsRepository;
    private final MoneyAccountMapper moneyAccountMapper;
    private final TransactionDeleteControlRepository transactionDeleteControlRepository;

    public AssetService(AssetRepository assetRepository, TransactionRepository transactionRepository,
            TransactionDeleteControlRepository transactionDeleteControlRepository,
            PositionRepository positionRepository, UserRepository userRepository, TransactionMapper transactionMapper,
            RelatedTransactionsRepository relatedTransactionsRepository, MoneyAccountRepository moneyAccountRepository,
            MoneyAccountMapper moneyAccountMapper, TransferRepository transferRepository) {
        this.assetRepository = assetRepository;
        this.transactionRepository = transactionRepository;
        this.transactionDeleteControlRepository = transactionDeleteControlRepository;
        this.positionRepository = positionRepository;
        this.userRepository = userRepository;
        this.transactionMapper = transactionMapper;
        this.relatedTransactionsRepository = relatedTransactionsRepository;
        this.moneyAccountRepository = moneyAccountRepository;
        this.moneyAccountMapper = moneyAccountMapper;
        this.transferRepository = transferRepository;
    }

    @Transactional
    public Long createAsset(AssetDTO asset) {

        // Güvenlik bağlamından kullanıcı bilgilerini al
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Kullanıcıyı var olan varlık ile ilişkilendirerek yeni varlık oluştur
        Asset assetEntity = AssetMapper.INSTANCE.toAsset(asset);
        assetEntity.setUser(user);
        Asset savedAsset = assetRepository.save(assetEntity);

        TransactionDeleteControl deleteControl = new TransactionDeleteControl();
        deleteControl.setAsset(savedAsset);
        deleteControl.setIsDeleteBefore(false);
        transactionDeleteControlRepository.save(deleteControl);

        return savedAsset.getId();
    }

    @Transactional
    public boolean deleteAsset(Long assetId) {
        // Varlığı bul ve pasif yap
        Asset asset = assetRepository.findById(assetId).orElseThrow(() -> new RuntimeException("User not found"));
        asset.setActive(false);
        Asset savedAsset = assetRepository.save(asset);
        return !savedAsset.isActive();
    }

    @Transactional
    public List<TransactionDTO> createTransaction(List<TransactionDTO> transactions) {

        List<TransactionDTO> transactionDTOList = new ArrayList<>();

        // Her bir TransactionDTO için ilgili Asset'i bul
        for (TransactionDTO transactionDTO : transactions) {
            Long assetId = transactionDTO.getAssetId();
            if (assetId == null) {
                throw new RuntimeException("İlgili Hesap ID Bulunamadı. Transaction");
            }
            Asset asset = assetRepository.findById(assetId)
                    .orElseThrow(() -> new RuntimeException("Asset not found"));

            // TransactionDTO'yu Transaction entity'sine dönüştür ve Asset ile ilişkilendir
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

        // Asset ID'sini al ve ilgili Asset'i bul
        Long assetId = (Long) position.getAssetId();
        if (assetId == null) {
            throw new RuntimeException("İlgili Hesap ID Bulunamadı. Position");
        }
        Asset asset = assetRepository.findById(assetId).orElseThrow(() -> new RuntimeException("Asset not found"));

        // Pozisyon'ın maliyetini hesapla
        BigDecimal calculatedCostBasisBigDecimal = this.calculateCostBasis(position);
        position.setCostBasis(calculatedCostBasisBigDecimal);

        // PozisyonDTO'yu Positions entity'sine dönüştür ve Asset ile ilişkilendir
        Positions positionEntity = PositionsMapper.INSTANCE.toPosition(position);
        positionEntity.setAsset(asset);
        Positions savedPosition = positionRepository.save(positionEntity);
        return PositionsMapper.INSTANCE.toPositionDTO(savedPosition);
    }

    public BigDecimal calculateCostBasis(PositionDTO positionDTO) {

        // Asset ID'sini al
        Optional<Asset> asset = assetRepository.findById(positionDTO.getAssetId());
        if (!asset.isPresent()) {
            return null;
        }

        // İlgili Asset'e ait tüm işlemleri bul
        List<Transactions> allByAsset = transactionRepository.findAllByAsset(asset.get());

        // İşlem toplamını hesapla
        BigDecimal sumBigDecimal = BigDecimal.ZERO;
        for (Transactions transactions : allByAsset) {
            sumBigDecimal = sumBigDecimal.add(transactions.getQuantity().multiply(transactions.getUnitPrice()));
        }
        return sumBigDecimal;
    }

    @Transactional
    public List<TransactionDTO> getTransactionByAssetId(Long assetId) {

        // Asset'i bul
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));

        // İlgili Asset'e ait tüm işlemleri bul ve sadece SELL türündeki işlemleri
        // filtrele
        List<Transactions> transactions = transactionRepository.findByAsset(asset);
        transactions = transactions.stream().filter(data -> data.getTransactionType() == TransactionType.SELL)
                .collect(Collectors.toList());
        return transactionMapper.toTransactionDTOList(transactions);
    }

    @Transactional
    public Long findAssetByUserId() {

        // Güvenlik bağlamından kullanıcı bilgilerini al
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Kullanıcıya ait varlıkları bul ve sayısını döndür
        List<Asset> assets = assetRepository.findByUser(user);
        return Long.valueOf(assets.size());
    }

    @Transactional
    public List<AssetResponse> getAssetsByUserId() {

        // Güvenlik bağlamından kullanıcı bilgilerini al
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<AssetResponse> rListAssetResponse = new ArrayList<AssetResponse>();

        // Kullanıcıya ait varlıkları bul
        List<Asset> assets = assetRepository.findAllByUser(user);

        Long countId = Long.parseLong("0");

        // Son yatırım fiyatlarını al
        Map<String, BigDecimal> investmentLastPrices = this.getInvestmentLastPrices();

        for (Asset asset : assets) {

            // Varlık aktif mi kontrol et
            if (!asset.isActive()) {
                continue;
            }

            // İlgili Varlığa ait tüm pozisyonları bul
            List<Positions> positions = positionRepository.findAllByAssetOrderByIdAsc(asset);

            // İlgili Varlığa ait tüm işlemleri bul
            List<Transactions> transactions = transactionRepository.findByAsset(asset);

            // Hiç işlem bulunamadıysa ve pozisyon sayısı 1 veya daha az ise, varlıkla
            // ilgili işlem yapılmamıştır. Bu durumda varlık bilgilerini sıfır değerlerle
            // döndür.
            if (transactions.size() == 0 && (positions.size() <= 1)) {
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

            // İlgili Varlığa ait işlemler bulunmuşsa, her bir işlem için ilgili bilgileri
            // hesapla ve döndür
            for (Transactions transaction : transactions) {
                AssetResponse rAssetResponse = new AssetResponse();

                // Bu transaction ile ilgili yapılan işlemleri bul
                List<RelatedTransactions> bySourceTransactions = relatedTransactionsRepository
                        .findBySourceTransactions(transaction);

                // Bu transaction ile ilgili işlem yapıldı mı? Evet yapıldıysa, yapılan
                // işlemlerle birlikte bilgileri hesapla ve döndür. Hayır yapılmadıysa, bu
                // transaction selling datası olabilir mı diye kontrol et. Selling datası ise
                // listelemeye dahil etme. Hiçbir işlem yapılmamışsa, bilgileri sıfır değerlerle
                // döndür.
                if (bySourceTransactions.size() > 0) {

                    BigDecimal quantity = BigDecimal.ZERO;

                    // Toplam Satılma Adedi
                    for (RelatedTransactions sellingData : bySourceTransactions) {
                        quantity = quantity.add(sellingData.getTargetTransactions().getQuantity());
                    }

                    // Hiçbir işlem yapılmamışsa, bilgileri sıfır değerlerle döndür.
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

                    // Bu Transaction Buying Datası. Satılmayan Adet Kadar Listelemeye Dahil Et
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
                    rAssetResponse.setProfitLoss(positions.get(0).getProfitLoss());
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


    @Transactional
    public Boolean isFirstAsset() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Transactions> allTransactions = transactionRepository.findAll();
        for(Transactions transaction : allTransactions) {
            if (transaction.getAsset().getUser().equals(user)) {
                return false;
            }
        }
        return true;
    }

    public Map<String, BigDecimal> getInvestmentLastPrices() {

        // Tüm işlemlerdeki benzersiz varlık sembollerini al
        Set<String> symbols = transactionRepository.findAll().stream().map(Transactions::getAssetSymbol)
                .collect(Collectors.toSet());

        // Her bir varlık sembolü için en son fiyatı bul ve bir haritaya ekle
        Map<String, BigDecimal> lastPrices = new HashMap<>();
        for (String symbol : symbols) {
            BigDecimal price = transactionRepository.findByAssetSymbolOrderByIdDesc(symbol)
                    .get(0).getUnitPrice();
            lastPrices.put(symbol, price);
        }
        return lastPrices;
    }

    public Long getSellingCount(Long transactionId) {

        // İlgili Transaction'ı bul
        Transactions mainTransactions = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction Bulunamadı"));

        // Bu Transaction ile ilgili yapılan işlemleri bul ve toplam satılan adedi
        // hesapla
        BigDecimal totalSold = relatedTransactionsRepository.findBySourceTransactions(mainTransactions)
                .stream().map(rt -> rt.getTargetTransactions().getQuantity())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return Long.valueOf(totalSold.longValue());
    }

    @Transactional
    public UpdateTransaction updateAssetResponse(UpdateTransaction updateTransaction) {

        // Transaction'ı bul
        Transactions mainTransactions = transactionRepository.findById(updateTransaction.getTransactionId())
                .orElseThrow(() -> new RuntimeException("Transaction Bulunamadı"));

        // 1. YAPILAN İŞLEMLERİN SATILAN MİKTARLARI TOPLANIYOR VE YENİ MİKTARLA
        // KARŞILAŞTIRILIYOR
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

        // İşlemden sonraki pozisyonları bul ve güncelle
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

        // İlgili Transaction'ı bul
        Transactions transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction Bulunamadı"));

        // İlgili Transaction (Buy ya da Create) Siliniyor.
        transactionRepository.delete(transaction);
        transactionRepository.flush();

        // İlgili Asset Daha Önceden Silindi Diye İşaretleniyor.
        TransactionDeleteControl byAsset = transactionDeleteControlRepository.findByAsset(transaction.getAsset());
        byAsset.setIsDeleteBefore(true);
        transactionDeleteControlRepository.save(byAsset);

        // Silinen transaction'ın bağlı olduğu asset'in positionları getiriliyor.
        List<Positions> allPositions = positionRepository.findAllByAssetOrderByCreatedDateAsc(transaction.getAsset());
        Map<String, BigDecimal> lastPrices = getLastPrices(
                transactionRepository.findAllByAsset(transaction.getAsset()));

        // İlgili transaction'ın bağlı olduğu asset'in positionları arasında
        // transactionların tarihlerini kontrol etmek için başlangıç zamanı ve kontrol
        // zamanı belirleniyor.
        LocalDateTime startOfTime = LocalDateTime.now().minusYears(60);
        LocalDateTime controlTime = LocalDateTime.now().minusYears(60);

        // Tüm positionlar geziliyor
        for (Positions positions : allPositions) {
            BigDecimal costBasis = BigDecimal.ZERO;
            BigDecimal currentValue = BigDecimal.ZERO;

            // İlgili asset'in bağlı olduğu 2 pozisyon arası hangi transactionlar var
            // kontrol ediliyor.
            List<Transactions> historyCheck = transactionRepository
                    .findAllByCreatedDateBetweenAndAsset(controlTime, positions.getCreatedDate(), positions.getAsset());

            // 2 pozisyon arasında transaction yoksa işlem yoktur. İşlem yoksa bu pozisyonu
            // tutmaya gerek yok.
            // Demekki arada transaction yok. Haliyle işlem olmadığı için bu position'ın
            // tutulmasına gerek yok
            if (historyCheck.size() == 0) {
                positionRepository.delete(positions);
                continue;
            }

            // Eğer 2 position arasında işlem varsa geçmişten ilgili tarihe kadar olan tüm
            // transactionlar getiriliyor
            // Çünkü bu positiondaki kar zarar durumu geçmişteki tüm transactionlardan
            // etkileniyor.
            List<Transactions> history = transactionRepository
                    .findAllByCreatedDateBetweenAndAsset(startOfTime, positions.getCreatedDate(), positions.getAsset());

            for (Transactions t : history) {
                if (t.getTransactionType() != TransactionType.SELL) {

                    // Satış adedini buluyoruz
                    BigDecimal soldQuantity = relatedTransactionsRepository.findBySourceTransactions(t)
                            .stream()
                            .map(rt -> rt.getTargetTransactions().getQuantity())
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    // Kalan miktarı buluyoruz
                    BigDecimal remaining = t.getQuantity().subtract(soldQuantity);

                    // Toplam maliyeti ve toplam piyasa değerini buluyoruz
                    if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                        costBasis = costBasis.add(remaining.multiply(t.getUnitPrice()));
                        BigDecimal lastPrice = lastPrices.get(t.getAssetSymbol());
                        if (lastPrice != null) {
                            currentValue = currentValue.add(remaining.multiply(lastPrice));
                        }
                    }
                }
            }

            // Her pozisyon için güncellemeler yapılıyor
            positions.setCostBasis(costBasis);
            positions.setCurrentValue(currentValue);
            positions.setProfitLoss(currentValue.subtract(costBasis));

            // Maliyet sıfır ise pozisyonu sil, değilse güncelle
            if (costBasis.compareTo(BigDecimal.ZERO) == 0) {
                positionRepository.delete(positions);
            } else {
                positionRepository.save(positions);
            }

            // Kontrol zamanı güncelleniyor
            controlTime = positions.getCreatedDate();
        }
        return true;
    }

    public String afterDeletingAddMoney(Long transactionId, Long selectedMoneyAccountId,
            List<Map<String, BigDecimal>> exchangeRate) {

        // İlgili Banka Hesabına Para Geri İade Ediliyor.
        Optional<MoneyAccount> optionalMoneyAccount = moneyAccountRepository.findById(selectedMoneyAccountId);
        if (!optionalMoneyAccount.isPresent()) {
            throw new IllegalArgumentException("Geçersiz banka hesabı");
        }
        MoneyAccount moneyAccount = optionalMoneyAccount.get();
        System.out.println("Money Account: " + moneyAccount);

        Transactions transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Geçersiz işlem"));

        System.out.println("Transactions: " + transaction);

        // Toplam Değer Bulunuyor

        System.out.println("Exchange Rate: " + exchangeRate);

        BigDecimal exchangeRateValue = exchangeRate.stream()
                .filter(m -> m.containsKey(moneyAccount.getCurrency()))
                .findFirst()
                .map(m -> m.get(moneyAccount.getCurrency()))
                .orElse(BigDecimal.ONE);

        System.out.println("exchangeRateValue: " + exchangeRateValue);
        BigDecimal returnTotalValue = transaction.getUnitPrice().multiply(transaction.getQuantity());
        System.out.println("returnTotalValue: " + returnTotalValue);

        // Hesap cinsine göre para ekleniyor
        System.out.println("Eklenmeden Önce Para: " + moneyAccount.getBalance());
        BigDecimal afterExchangeDivide = returnTotalValue.divide(exchangeRateValue, 5, RoundingMode.HALF_UP);

        moneyAccount.setBalance(moneyAccount.getBalance().add(afterExchangeDivide).setScale(5, RoundingMode.HALF_UP));
        System.out.println("Eklendikten sonra Para: " + moneyAccount.getBalance());


        // Para Hesaba Eklendi
        moneyAccountRepository.save(moneyAccount);
        System.out.println("Para Eklendi");

        // Transfer Logu Düşüldü
        Transfer transfer = new Transfer();
        transfer.setAmount(afterExchangeDivide);
        transfer.setCategory("İade");
        transfer.setCurrency(moneyAccount.getCurrency());
        transfer.setDescription("Yanlışlıkla satın alım sonucu hesaba geri iade");
        transfer.setDetails(null);
        transfer.setExchangeRate(exchangeRateValue);
        transfer.setInputPreviousBalance(
                moneyAccount.getBalance().subtract(afterExchangeDivide));
        transfer.setInputNextBalance(moneyAccount.getBalance());
        transfer.setIsAccountToAccountTransfer(false);
        transfer.setMoneyAccount(moneyAccount);
        transfer.setTransactionDateTime(LocalDateTime.now());
        transfer.setType("incoming");
        transfer.setUser(moneyAccount.getUser());
        transferRepository.save(transfer);
        return "Hesaba para eklendi";

    }

    public Map<String, BigDecimal> getLastPrices(List<Transactions> allTransactionByAsset) {

        // Tüm işlemlerdeki benzersiz varlık sembollerini al
        Set<String> symbols = allTransactionByAsset.stream()
                .map(Transactions::getAssetSymbol)
                .collect(Collectors.toSet());

        // Her bir varlık sembolü için en son fiyatı bul ve bir haritaya ekle
        Map<String, BigDecimal> lastPrices = new HashMap<>();
        for (String symbol : symbols) {
            BigDecimal price = transactionRepository.findByAssetSymbolOrderByIdDesc(symbol)
                    .get(0).getCurrentValue();
            lastPrices.put(symbol, price);
        }

        return lastPrices;
    }

    @Transactional
    public Positions createNewPositions(List<Transactions> allTransactionByAsset, Asset asset) {
        BigDecimal currentValue = BigDecimal.ZERO;
        BigDecimal costBasis = BigDecimal.ZERO;

        // Tüm işlemlerdeki benzersiz varlık sembollerini al
        Set<String> symbols = allTransactionByAsset.stream()
                .map(Transactions::getAssetSymbol)
                .collect(Collectors.toSet());

        // Her bir varlık sembolü için en son fiyatı bul ve bir haritaya ekle
        Map<String, BigDecimal> lastPrices = new HashMap<>();
        for (String symbol : symbols) {
            BigDecimal price = transactionRepository.findByAssetSymbolOrderByIdDesc(symbol)
                    .get(0).getCurrentValue();
            lastPrices.put(symbol, price);
        }

        // İlgili asset'e ait tüm işlemler geziliyor
        for (Transactions transactions : allTransactionByAsset) {
            TransactionType type = transactions.getTransactionType();

            // Eğer işlem satış değilse, bu işlem üzerinden bir satış olmuş mu kontrol
            // ediliyor
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

        // İşlemlerden ilkini alarak ilgili varlığı bul
        Optional<Asset> assetOptional = assetRepository.findById(listTransactionDTOs.get(0).getAssetId());
        if (!assetOptional.isPresent())
            return null;

        // Her bir TransactionDTO'yu Transaction entity'sine dönüştür, varlıkla
        // ilişkilendir ve kaydet
        for (TransactionDTO transactionDTO : listTransactionDTOs) {
            Transactions transaction = TransactionMapper.INSTANCE.toTransaction(transactionDTO);
            transaction.setAsset(assetOptional.get());
            transactionRepository.save(transaction);
        }

        // Tüm işlemlerdeki benzersiz varlık sembollerini al
        List<Transactions> allTransactionByAsset = transactionRepository.findAllByAsset(assetOptional.get());

        // Yeni pozisyon oluştur
        Positions newPositions = this.createNewPositions(allTransactionByAsset, assetOptional.get());
        if (newPositions == null)
            throw new Error("Yeni bir position kaydı açılamadı");
        return listTransactionDTOs;
    }

    @Transactional
    public List<SellInvestmentRequest> sellInvestments(List<SellInvestmentRequest> sellInvestmentRequestsList) {

        for (SellInvestmentRequest sellInvestmentRequest : sellInvestmentRequestsList) {

            // İlgili işlemi bul
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
            transactions.setBuyingDateTime(sellInvestmentRequest.getBuyingDateTime()); // Satış tarihi
            transactions.setSellingPrice(sellInvestmentRequest.getSalesPrice());
            Transactions savedTransactions = transactionRepository.save(transactions);

            // Kimden Kime Satıldığı Loglandı
            RelatedTransactions relatedTransactions = new RelatedTransactions();
            relatedTransactions.setSourceTransactions(optionalTransaction.get());
            relatedTransactions.setTargetTransactions(savedTransactions);
            relatedTransactions.setTransactionType(TransactionType.SELL);
            relatedTransactionsRepository.save(relatedTransactions);

        }

        // İşlemlerden ilkini alarak ilgili varlığı bul
        Optional<Transactions> byId = transactionRepository
                .findById(sellInvestmentRequestsList.get(0).getTransactionId());
        // İlgili varlığı bul
        Asset asset = byId.get().getAsset();

        // O varlığa ait tüm işlemleri bul
        List<Transactions> allTransactionByAsset = transactionRepository.findAllByAsset(asset);

        // Yeni pozisyon oluştur
        Positions newPositions = this.createNewPositions(allTransactionByAsset, asset);
        if (newPositions == null)
            throw new Error("Yeni bir position kaydı açılamadı");
        return sellInvestmentRequestsList;
    }

    @Transactional
    public AccountSummaryResponseDTO getAccountSummary() {

        System.out.println("Kullanıcı Özet Bilgisi");

        // Kullanıcı bilgilerini al
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        AccountSummaryResponseDTO accountSummary = new AccountSummaryResponseDTO();

        //////////////////////////////////// MONEY////////////////////////////////////
        ///
        /// Toplam Bakiyeyi Hesaplamak için Kullanıcıya Ait Tüm Para Hesaplarındaki
        //////////////////////////////////// Bakiyeler Toplanıyor
        UserBalanceDTO userBalance = moneyAccountRepository.findTotalBalancesByUser(user);
        accountSummary.setTotalBalanceTRY(
                userBalance.getTotalUSD().add(userBalance.getTotalEUR()).add(userBalance.getTotalTRY()));
        Map<String, BigDecimal> currencyTotals = new HashMap<>();
        currencyTotals.put("EUR", userBalance.getTotalEUR() != null ? userBalance.getTotalEUR() : BigDecimal.ZERO);
        currencyTotals.put("USD", userBalance.getTotalUSD() != null ? userBalance.getTotalUSD() : BigDecimal.ZERO);
        currencyTotals.put("TRY", userBalance.getTotalTRY() != null ? userBalance.getTotalTRY() : BigDecimal.ZERO);
        accountSummary.setCurrencyTotals(currencyTotals);
        System.out.println("Account Summary Currency Totals: " + accountSummary.getCurrencyTotals());

        //////////////////////////////////// INVESTMENT////////////////////////////////////
        ///
        /// Toplam Yatırım Değerini ve Toplam Kar/Zarar Durumunu Hesaplamak için
        //////////////////////////////////// Kullanıcıya Ait Tüm Varlıklar ve Bu
        //////////////////////////////////// Varlıklara Ait İşlemler Getiriliyor.
        // Her Bir Varlık İçin Yatırım Değeri ve Kar/Zarar Durumu Hesaplanarak Toplam
        //////////////////////////////////// Yatırım Değeri ve Toplam Kar/Zarar Durumu
        //////////////////////////////////// Bulunuyor.
        List<Asset> userAssets = assetRepository.findByUser(user);
        Map<String, BigDecimal> lastPrices = this.getLastPrices(transactionRepository.findAll());
        System.out.println("User Assets: " + userAssets);
        System.out.println("Last Prices: " + lastPrices);

        BigDecimal totalInvestmentValue = BigDecimal.ZERO;
        BigDecimal totalProfitLoss = BigDecimal.ZERO;
        Map<Long, BigDecimal> assetInvestmentValues = new HashMap<>();

        for (Asset asset : userAssets) {
            System.out.println("-".repeat(50));
            if (asset.isActive() == false) {
                System.out.println("Inactive asset found: " + asset.getId());
                continue;
            }

            System.out.println("Processing asset: " + asset.getId());
            List<Transactions> transactionsListByAsset = transactionRepository.findByAsset(asset);
            List<Positions> positionsListByAsset = positionRepository.findAllByAsset(asset);
            System.out.println("Transactions for asset " + asset.getId() + ": " + transactionsListByAsset);
            System.out.println("Positions for asset " + asset.getId() + ": " + positionsListByAsset);

            // Transaction Silme Hatası Sonucu Eklendi
            if (positionsListByAsset.size() == 0) {
                System.out.println("No position found for asset " + asset.getId());
                continue;
            }
            Positions position = positionsListByAsset.get(positionsListByAsset.size() - 1);
            System.out.println("Last position for asset " + asset.getId() + ": " + position);
            totalProfitLoss = totalProfitLoss.add(position.getProfitLoss());
            assetInvestmentValues.put(asset.getId(), BigDecimal.ZERO);
            for (Transactions transaction : transactionsListByAsset) {
                System.out.println("*".repeat(50));
                if (transaction.getTransactionType() == TransactionType.CREATE
                        || transaction.getTransactionType() == TransactionType.BUY
                        || transaction.getTransactionType() == TransactionType.UPDATE) {
                    System.out.println("Processing transaction for asset " + asset.getId() + ": " + transaction);
                    totalInvestmentValue = totalInvestmentValue
                            .add(transaction.getQuantity().multiply(lastPrices.get(transaction.getAssetSymbol())));
                    assetInvestmentValues.put(asset.getId(), assetInvestmentValues.get(asset.getId())
                            .add(transaction.getQuantity().multiply(lastPrices.get(transaction.getAssetSymbol()))));
                    System.out.println("Updated investment values for asset " + asset.getId() + ": "
                            + assetInvestmentValues.get(asset.getId()));
                } else if (transaction.getTransactionType() == TransactionType.SELL) {
                    System.out.println("Processing sell transaction for asset " + asset.getId() + ": " + transaction);
                    totalInvestmentValue = totalInvestmentValue
                            .subtract(transaction.getQuantity().multiply(lastPrices.get(transaction.getAssetSymbol())));
                    assetInvestmentValues.put(asset.getId(), assetInvestmentValues.get(asset.getId()).subtract(
                            transaction.getQuantity().multiply(lastPrices.get(transaction.getAssetSymbol()))));
                    System.out.println("Updated investment values for asset " + asset.getId() + ": "
                            + assetInvestmentValues.get(asset.getId()));
                }
            }
            ;
        }
        ;

        System.out.println("User Asset Investment Values: " + assetInvestmentValues);
        System.out.println("Total Investment Value: " + totalInvestmentValue);
        System.out.println("Total Profit/Loss: " + totalProfitLoss);
        accountSummary.setTotalInvestmentValue(totalInvestmentValue);
        accountSummary.setTotalInvestmentProfitLoss(totalProfitLoss);

        //////////////////////////////////// MONEY
        //////////////////////////////////// ACCOUNT////////////////////////////////////
        /// Kullanıcıya Ait Tüm Para Hesapları Getiriliyor.
        // Her Bir Para Hesabı İçin İlgili Bilgiler Hesaplanarak Döndürülüyor.
        List<MoneyAccount> userMoneyAccounts = moneyAccountRepository.findByUserAndIsActive(user, true);
        List<MoneyAccountResponseDTO> moneyAccountResponseDTO = this.moneyAccountMapper
                .toMoneyAccountResponseDTO(userMoneyAccounts);
        accountSummary.setCurrencyAccounts(moneyAccountResponseDTO);
        System.out.println("User Money Account Values: " + moneyAccountResponseDTO);

        //////////////////////////////////// INVESTMENT
        //////////////////////////////////// ACCOUNT////////////////////////////////////

        List<UserAccountSummaryInvestmentDTO> investmentAccountResponseDTO = new ArrayList<>();

        // Kullanıcıya Ait Tüm Varlıklar Getiriliyor.
        for (Asset asset : userAssets) {
            // Varlık aktif mi kontrol ediliyor. Aktif olmayan varlıklar yatırım hesabı
            // özetinde gösterilmeyecek.
            if (asset.isActive() == false) {
                continue;
            }

            UserAccountSummaryInvestmentDTO investmentDTO = new UserAccountSummaryInvestmentDTO();
            investmentDTO.setId(asset.getId());
            investmentDTO.setAccountName(asset.getAssetName());
            investmentDTO.setBalance(assetInvestmentValues.get(asset.getId()));
            investmentDTO.setTotalValue(investmentDTO.getBalance());
            investmentDTO.setUserId(user.getId());
            investmentDTO.setAssetType(asset.getAssetType().name());
            List<Positions> positionsListByAsset = positionRepository.findAllByAsset(asset);

            // Transaction Silme Hatası Sonucu Eklendi
            if (positionsListByAsset.size() == 0) {
                System.out.println("No position found for asset " + asset.getId());
                investmentDTO.setProfitLoss(BigDecimal.ZERO);
            } else {
                Positions position = positionsListByAsset.get(positionsListByAsset.size() - 1);
                investmentDTO.setProfitLoss(position.getProfitLoss());
            }
            ///////////////////////////////////////////

            investmentDTO.setAccountType("INVESTMENT");

            List<AssetResponse> listInvestment = new ArrayList<>();
            List<Transactions> transactionListByAsset = transactionRepository.findByAsset(asset);
            for (Transactions transaction : transactionListByAsset) {

                System.out.println(transaction.getAssetName());

                if (transaction.getTransactionType() == TransactionType.SELL) {
                    continue;
                }

                System.out.println("Transaction found: " + transaction.getId());

                Long sellingCount = this.getSellingCount(transaction.getId());
                System.out.println("Transaction Quantity: " + transaction.getQuantity() + " Transaction Selling Count: "
                        + sellingCount);
                if (sellingCount.compareTo(transaction.getQuantity().longValue()) >= 0) {
                    continue;
                }
                System.out.println("-".repeat(100));
                AssetResponse assetResponse = new AssetResponse();
                assetResponse.setId(transaction.getId());
                assetResponse.setAccountId(asset.getId());
                assetResponse.setUserId(user.getId());
                assetResponse.setAssetType(asset.getAssetType());
                assetResponse.setAssetSymbol(transaction.getAssetSymbol());
                assetResponse.setAssetName(transaction.getAssetName());
                assetResponse.setQuantity(transaction.getQuantity().subtract(BigDecimal.valueOf(sellingCount)));
                assetResponse.setPurchasePrice(transaction.getUnitPrice());
                assetResponse.setCurrentPrice(lastPrices.get(transaction.getAssetSymbol()));
                assetResponse.setTotalValue(
                        transaction.getQuantity().multiply(lastPrices.get(transaction.getAssetSymbol())));
                assetResponse.setProfitLoss((transaction.getQuantity().subtract(BigDecimal.valueOf(sellingCount)))
                        .multiply(lastPrices.get(transaction.getAssetSymbol()))
                        .subtract(assetResponse.getTotalValue()));
                assetResponse.setAccountName(asset.getAssetName());
                listInvestment.add(assetResponse);
            }
            investmentDTO.setHoldings(listInvestment);
            investmentDTO.setHoldingCount(listInvestment.size());
            investmentAccountResponseDTO.add(investmentDTO);
            System.out.println("Investment DTO: " + investmentDTO);
        }
        accountSummary.setInvestmentAccounts(investmentAccountResponseDTO);
        accountSummary.setCurrencyAccountCount(accountSummary.getCurrencyAccounts().size());
        accountSummary.setInvestmentAccountCount(investmentAccountResponseDTO.size());

        System.out.println("Kullanıcı Özet Bilgisi: " + accountSummary);
        return accountSummary;
    }

    @Transactional
    public Boolean isDeleteTransactionBefore(Long transactionId) {

        if (transactionId != 0) {
            Transactions transaction = transactionRepository.findById(transactionId)
                    .orElseThrow(() -> new RuntimeException("Transaction not found"));
            TransactionDeleteControl byAsset = transactionDeleteControlRepository.findByAsset(transaction.getAsset());
            System.out.println("Delete control for asset " + transaction.getAsset().getId() + ": " + byAsset);
            return byAsset.getIsDeleteBefore();
        }
        return true;

    }

    @Transactional
    public Boolean deleteMoneyAccount(Long accountId) {

        // Para hesabını bul
        Optional<MoneyAccount> moneyAccountOptional = moneyAccountRepository.findById(accountId);
        if (!moneyAccountOptional.isPresent()) {
            return false;
        }

        // Para hesabını pasif yap
        MoneyAccount moneyAccount = moneyAccountOptional.get();
        moneyAccount.setIsActive(false);
        moneyAccountRepository.save(moneyAccount);
        return true;
    }

    @Transactional
    public MoneyAccountResponseDTO updateMoneyAccount(Boolean updatedAccount, BigDecimal exchangeRate,
            MoneyAccountResponseDTO moneyAccountResponseDTO) {

        // Aktif kullanıcıyı al
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Para Hesabını Güncelle
        Optional<MoneyAccount> optionalMoneyAccount = moneyAccountRepository.findById(moneyAccountResponseDTO.getId());
        if (!optionalMoneyAccount.isPresent()) {
            return null;
        }
        MoneyAccount moneyAccount = optionalMoneyAccount.get();
        BigDecimal previousBalance = moneyAccount.getBalance();
        moneyAccount.setAccountName(moneyAccountResponseDTO.getAccountName());
        moneyAccount.setBalance(moneyAccountResponseDTO.getBalance());
        moneyAccount.setCurrency(moneyAccountResponseDTO.getCurrency());
        MoneyAccount savedMoneyAccount = moneyAccountRepository.save(moneyAccount);

        // Transfer kaydı oluştur (Eğer hesap güncellemesiyse)
        if (updatedAccount) {
            Transfer transfer = new Transfer();
            transfer.setAmount(BigDecimal.valueOf(Math.abs(savedMoneyAccount.getBalance().doubleValue() - previousBalance.doubleValue())));
            if (savedMoneyAccount.getBalance().compareTo(previousBalance) == 0) {
                transfer.setType("equal");
            } else {
                transfer.setType(
                        savedMoneyAccount.getBalance().compareTo(previousBalance) > 0 ? "incoming" : "outgoing");
            }
            transfer.setCategory("Bakiye Güncellemesi");
            transfer.setDetails("Hesap güncellemesi sonucu bakiye farkı");
            transfer.setUser(user);
            transfer.setMoneyAccount(savedMoneyAccount);
            transfer.setExchangeRate(exchangeRate);
            if (transfer.getType().equals("incoming")) {
                transfer.setInputPreviousBalance(previousBalance);
                transfer.setInputNextBalance(savedMoneyAccount.getBalance());
            } else  {
                transfer.setOutputNextBalance(savedMoneyAccount.getBalance());
                transfer.setOutputPreviousBalance(previousBalance);
            }
            transfer.setIsAccountToAccountTransfer(false);
            transfer.setCurrency(moneyAccount.getCurrency());
            transfer.setTransactionDateTime(LocalDateTime.now());
            System.out.println("Transferi Kaydettik");
            transferRepository.save(transfer);
        }

        return moneyAccountMapper.toMoneyAccountResponseDTO(savedMoneyAccount);

    }

    public Boolean isThereThisAssetNameBefore(String assetName) {
        List<Asset> allByAssetName = assetRepository.findAllByAssetName(assetName);
        return allByAssetName.size() > 0;
    }
}
