package com.crowallet.backend.service;

import com.crowallet.backend.dto.AccountDTO;
import com.crowallet.backend.mapper.AccountMapper;
import com.crowallet.backend.mapper.MoneyAccountMapper;
import com.crowallet.backend.mapper.TransferMapper;
import com.crowallet.backend.repository.MoneyAccountRepository;
import com.crowallet.backend.repository.TransferRepository;
import jakarta.transaction.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.crowallet.backend.comman.GeneralException;
import com.crowallet.backend.dto.AccountSummaryDTO;
import com.crowallet.backend.dto.CreateInvestmentAccountDTO;
import com.crowallet.backend.dto.InvestmentHoldingDTO;
import com.crowallet.backend.dto.MoneyAccountRequestDTO;
import com.crowallet.backend.dto.MoneyAccountResponseDTO;
import com.crowallet.backend.dto.TransferResponseDTO;
import com.crowallet.backend.entity.Account;
import com.crowallet.backend.entity.AccountType;
import com.crowallet.backend.entity.AssetType;
import com.crowallet.backend.entity.InvestmentHolding;
import com.crowallet.backend.entity.MoneyAccount;
import com.crowallet.backend.entity.User;
import com.crowallet.backend.repository.AccountRepository;
import com.crowallet.backend.repository.InvestmentHoldingRepository;
import com.crowallet.backend.repository.UserRepository;
import com.crowallet.backend.security.CustomUserDetails;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.PageSize;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
@Service
public class AccountService {
    private final MoneyAccountRepository moneyAccountRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InvestmentHoldingRepository holdingRepository;

    @Autowired
    private TransferRepository transferRepository;

    @Autowired
    private TransferService transferService;

    private MoneyAccountMapper moneyAccountMapper;

    AccountService(MoneyAccountRepository moneyAccountRepository, MoneyAccountMapper moneyAccountMapper) {
        this.moneyAccountRepository = moneyAccountRepository;
        this.moneyAccountMapper = moneyAccountMapper;
    }

    @Transactional
    public MoneyAccountResponseDTO createMoneyAccount(MoneyAccountRequestDTO moneyAccountRequestDTO) {
        User user = userRepository.findById(moneyAccountRequestDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("Kullanıcı Bulunamadı"));
        MoneyAccount moneyAccount = this.moneyAccountMapper.toMoneyAccount(moneyAccountRequestDTO);
        moneyAccount.setUser(user);
        moneyAccount.setIsActive(true);
        MoneyAccount savedMoneyAccount = moneyAccountRepository.save(moneyAccount);

        return this.moneyAccountMapper.toMoneyAccountResponseDTO(savedMoneyAccount);
    }

    @Transactional
    public List<MoneyAccountResponseDTO> getMoneyAccountActiveAndPassive(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User Bulunamadı"));
        List<MoneyAccount> allMoneyAccounts = moneyAccountRepository.findByUser(user);
        return this.moneyAccountMapper.toMoneyAccountResponseDTO(allMoneyAccounts);
    }


    @Transactional
    public List<MoneyAccountResponseDTO> getMoneyAccount(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User Bulunamadı"));
        List<MoneyAccount> allMoneyAccounts = moneyAccountRepository.findByUserAndIsActive(user, true);
        return this.moneyAccountMapper.toMoneyAccountResponseDTO(allMoneyAccounts);
    }

    @Transactional
    public MoneyAccountResponseDTO getMoneyAccountById(Long moneyAccountId){
        MoneyAccount account = moneyAccountRepository.findById(moneyAccountId).orElseThrow(() -> new RuntimeException("Girilen Hesap Bulunamadı"));
        MoneyAccountResponseDTO moneyAccountResponseDTO = moneyAccountMapper.toMoneyAccountResponseDTO(account);
        return moneyAccountResponseDTO;
    }

    @Transactional
    public AccountDTO createInvestmentAccount(CreateInvestmentAccountDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new GeneralException("User not found: " + dto.getUserId()));

        // Create the account
        Account account = new Account();
        account.setAccountName(dto.getAccountName());
        account.setAccountType(AccountType.INVESTMENT);
        account.setAssetType(AssetType.valueOf(dto.getAssetType()));
        account.setCurrency("TRY");
        account.setUpdateDate(LocalDateTime.now());
        account.setUser(user);
        account.setBalance(BigDecimal.ZERO);

        // Save account first to get ID
        account = accountRepository.save(account);

        // Create holdings
        BigDecimal totalValue = BigDecimal.ZERO;
        for (CreateInvestmentAccountDTO.HoldingItemDTO item : dto.getHoldings()) {
            InvestmentHolding holding = new InvestmentHolding();
            holding.setAccount(account);
            holding.setAssetType(AssetType.valueOf(dto.getAssetType()));
            holding.setAssetSymbol(item.getAssetSymbol());
            holding.setAssetName(item.getAssetName());
            holding.setQuantity(BigDecimal.valueOf(item.getQuantity()));
            holding.setPurchasePrice(BigDecimal.valueOf(item.getPurchasePrice()));
            holding.setCurrentPrice(BigDecimal.valueOf(item.getCurrentPrice()));
            holding.setUser(user);

            holdingRepository.save(holding);
            account.getHoldings().add(holding);

            // Calculate total value
            totalValue = totalValue.add(holding.getTotalValue());
        }

        // Update account balance to total value
        account.setBalance(totalValue);
        account = accountRepository.save(account);

        return AccountMapper.INSTANCE.toAccountDTO(account);
    }

    @Transactional
    public AccountDTO addInvestmentAccount(CreateInvestmentAccountDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new GeneralException("User not found: " + dto.getUserId()));

        // Find accountName
        String accounName = dto.getAccountName();
        Account account = accountRepository.findByAccountName(accounName);

        account.setUpdateDate(LocalDateTime.now());

        // Save account first to get ID
        account = accountRepository.save(account);

        // Create holdings
        BigDecimal totalValue = BigDecimal.ZERO;
        for (CreateInvestmentAccountDTO.HoldingItemDTO item : dto.getHoldings()) {
            InvestmentHolding holding = new InvestmentHolding();
            holding.setAccount(account);
            holding.setAssetType(AssetType.valueOf(dto.getAssetType()));
            holding.setAssetSymbol(item.getAssetSymbol());
            holding.setAssetName(item.getAssetName());
            holding.setQuantity(BigDecimal.valueOf(item.getQuantity()));
            holding.setPurchasePrice(BigDecimal.valueOf(item.getPurchasePrice()));
            holding.setCurrentPrice(BigDecimal.valueOf(item.getCurrentPrice()));
            holding.setUser(user);

            holdingRepository.save(holding);
            account.getHoldings().add(holding);

            // Calculate total value
            totalValue = totalValue.add(holding.getTotalValue());
        }

        // Update account balance to total value
        totalValue = totalValue.add(account.getBalance());
        account.setBalance(totalValue);
        account = accountRepository.save(account);

        return AccountMapper.INSTANCE.toAccountDTO(account);

    }

    @Transactional
    public InvestmentHoldingDTO addHoldingToAccount(Long accountId, CreateInvestmentAccountDTO.HoldingItemDTO item) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new GeneralException("Account not found: " + accountId));

        if (account.getAccountType() != AccountType.INVESTMENT) {
            throw new GeneralException("Cannot add holdings to non-investment account");
        }

        InvestmentHolding holding = new InvestmentHolding();
        holding.setAccount(account);
        holding.setAssetType(account.getAssetType());
        holding.setAssetSymbol(item.getAssetSymbol());
        holding.setAssetName(item.getAssetName());
        holding.setQuantity(BigDecimal.valueOf(item.getQuantity()));
        holding.setPurchasePrice(BigDecimal.valueOf(item.getPurchasePrice()));
        holding.setCurrentPrice(BigDecimal.valueOf(item.getCurrentPrice()));

        holding = holdingRepository.save(holding);

        // Update account balance
        updateAccountBalance(account);

        return AccountMapper.INSTANCE.toHoldingDTO(holding);
    }

    @Transactional
    public void removeHoldingFromAccount(Long holdingId) {
        InvestmentHolding holding = holdingRepository.findById(holdingId)
                .orElseThrow(() -> new GeneralException("Holding not found: " + holdingId));

        Account account = holding.getAccount();
        holdingRepository.delete(holding);

        // Update account balance
        updateAccountBalance(account);
    }

    @Transactional
    public InvestmentHoldingDTO updateHolding(Long holdingId, CreateInvestmentAccountDTO.HoldingItemDTO item) {
        InvestmentHolding holding = holdingRepository.findById(holdingId)
                .orElseThrow(() -> new GeneralException("Holding not found: " + holdingId));

        if (item.getQuantity() != null) {
            holding.setQuantity(BigDecimal.valueOf(item.getQuantity()));
        }
        if (item.getPurchasePrice() != null) {
            holding.setPurchasePrice(BigDecimal.valueOf(item.getPurchasePrice()));
        }
        if (item.getCurrentPrice() != null) {
            holding.setCurrentPrice(BigDecimal.valueOf(item.getCurrentPrice()));
        }

        holding = holdingRepository.save(holding);

        // Update account balance
        updateAccountBalance(holding.getAccount());

        return AccountMapper.INSTANCE.toHoldingDTO(holding);
    }

    private void updateAccountBalance(Account account) {
        List<InvestmentHolding> holdings = holdingRepository.findByAccountId(account.getId());
        BigDecimal totalValue = holdings.stream()
                .map(InvestmentHolding::getTotalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        account.setBalance(totalValue);
        account.setUpdateDate(LocalDateTime.now());
        accountRepository.save(account);
    }

    public List<InvestmentHoldingDTO> getAccountHoldings(Long accountId) {
        List<InvestmentHolding> holdings = holdingRepository.findByUserId(accountId);
        return AccountMapper.INSTANCE.toHoldingDTOList(holdings);
    }

    // Kişinin altın ve hisse hesaplarını getirir.
    public List<Map<String, Object>> findByAccountInvesment(Long userID) {
        List<Map<String, Object>> holdings = holdingRepository.findByAccountInvesment(userID);
        return holdings;
        // return AccountMapper.INSTANCE.toHoldingDTOList(holdings);
    }

    public List<AccountDTO> getAllAccounts() {
        return AccountMapper.INSTANCE.toAccountDTOList(accountRepository.findAll());
    }

    public List<AccountDTO> getUserAccounts(Long userId) {
        return AccountMapper.INSTANCE.toAccountDTOList(accountRepository.findByUserId(userId));
    }

    public List<AccountDTO> getUserCurrencyAccounts(Long userId) {
        return AccountMapper.INSTANCE.toAccountDTOList(
                accountRepository.findByUserIdAndAccountType(userId, AccountType.CURRENCY));
    }

    public List<AccountDTO> getUserInvestmentAccounts(Long userId) {
        return AccountMapper.INSTANCE.toAccountDTOList(
                accountRepository.findByUserIdAndAccountType(userId, AccountType.INVESTMENT));
    }

    public AccountSummaryDTO getUserAccountSummary(Long userId) {
        List<Account> allAccounts = accountRepository.findByUserId(userId);

        List<Account> currencyAccounts = allAccounts.stream()
                .filter(a -> a.getAccountType() == AccountType.CURRENCY || a.getAccountType() == null)
                .toList();

        List<Account> investmentAccounts = allAccounts.stream()
                .filter(a -> a.getAccountType() == AccountType.INVESTMENT)
                .toList();

        AccountSummaryDTO summary = new AccountSummaryDTO();

        // Calculate currency totals by currency
        Map<String, BigDecimal> currencyTotals = new HashMap<>();
        BigDecimal totalTRY = BigDecimal.ZERO;

        for (Account account : currencyAccounts) {
            String currency = account.getCurrency() != null ? account.getCurrency() : "TRY";
            BigDecimal balance = account.getBalance() != null ? account.getBalance() : BigDecimal.ZERO;

            currencyTotals.merge(currency, balance, BigDecimal::add);

            // Convert to TRY for total (simplified - you may want to use real exchange
            // rates)
            BigDecimal convertedBalance = convertToTRY(balance, currency);
            totalTRY = totalTRY.add(convertedBalance);
        }

        // Calculate investment totals
        BigDecimal totalInvestmentValue = BigDecimal.ZERO;
        BigDecimal totalProfitLoss = BigDecimal.ZERO;

        for (Account account : investmentAccounts) {
            BigDecimal value = account.getTotalValue();
            BigDecimal profitLoss = account.getProfitLoss();

            if (value != null) {
                totalInvestmentValue = totalInvestmentValue.add(value);
            }
            if (profitLoss != null) {
                totalProfitLoss = totalProfitLoss.add(profitLoss);
            }
        }

        // Add investment value to total (assuming investments are in TRY)
        totalTRY = totalTRY.add(totalInvestmentValue);

        summary.setTotalBalanceTRY(totalTRY);
        summary.setCurrencyTotals(currencyTotals);
        summary.setTotalInvestmentValue(totalInvestmentValue);
        summary.setTotalInvestmentProfitLoss(totalProfitLoss);
        summary.setCurrencyAccounts(AccountMapper.INSTANCE.toAccountDTOList(currencyAccounts));
        summary.setInvestmentAccounts(AccountMapper.INSTANCE.toAccountDTOList(investmentAccounts));
        summary.setCurrencyAccountCount(currencyAccounts.size());
        summary.setInvestmentAccountCount(investmentAccounts.size());
        return summary;
    }

    

    private BigDecimal convertToTRY(BigDecimal amount, String currency) {
        // Simplified conversion rates - in production, use real-time rates
        if (amount == null)
            return BigDecimal.ZERO;

        return switch (currency.toUpperCase()) {
            case "TRY" -> amount;
            case "USD" -> amount.multiply(new BigDecimal("34.50")); // Example rate
            case "EUR" -> amount.multiply(new BigDecimal("37.00")); // Example rate
            default -> amount;
        };
    }

    public AccountDTO getAccountById(Long id) {
        return AccountMapper.INSTANCE.toAccountDTO(accountRepository.findById(id)
                .orElseThrow(() -> new GeneralException("Account not found: " + id)));
    }


    public Boolean isThereThisAccountNameBefore(String accountName) {
        List<MoneyAccount> allByMoneyAccountName = moneyAccountRepository.findAllByAccountName(accountName);
        return allByMoneyAccountName.size() > 0;
    }

    public byte[] getPdfData(Long moneyAccountId,Boolean detail, Map<String,String> Filter){
        List<TransferResponseDTO> pdfData;
        if (moneyAccountId != null){
            pdfData = transferService.getUserTransfersByMoneyAccount(moneyAccountId);
        }
        else{
            //User bilgilerini güvenlik bağlamından al
            CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication()
                    .getPrincipal();
            pdfData = transferService.getUserAllTransfers(userDetails.getId());
        }

        LocalDateTime filterStartDate = Filter.get("startDate") != null ? LocalDateTime.parse(Filter.get("startDate")) : null;
        LocalDateTime filterEndDate = Filter.get("endDate") != null ? LocalDateTime.parse(Filter.get("endDate")) : null;
        String transactionType = Filter.get("type") != null ? Filter.get("type") : null;
        String searchQuery = Filter.get("searchQuery") != null ? Filter.get("searchQuery").toLowerCase() : null;
        
        List<TransferResponseDTO> filteredPdfData = pdfData.stream().filter(data -> {
            LocalDateTime transactionDateTime = data.getTransactionDateTime();            
            String dataDetails = data.getDetails() != null ? data.getDetails() : "";
            String dataCategory = data.getCategory() != null ? data.getCategory() : "";
            String dataDescription = data.getDescription() != null ? data.getDescription() : "";


            boolean isTrueSearch = (searchQuery == null) || dataDetails.toLowerCase().contains(searchQuery) || dataCategory.toLowerCase().contains(searchQuery) || dataDescription.toLowerCase().contains(searchQuery);
            boolean isTrueType = (transactionType == null) || data.getType().equals(transactionType);
            boolean isAfterStart = (filterStartDate == null) || !transactionDateTime.isBefore(filterStartDate);
            boolean isBeforeEnd = (filterEndDate == null) || !transactionDateTime.isAfter(filterEndDate);
            return isBeforeEnd && isAfterStart && isTrueType && isTrueSearch;
        }).toList();

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream outputData = new ByteArrayOutputStream();

        try{
            PdfWriter.getInstance(document, outputData);
            document.open();
        }
        catch(DocumentException e){
            e.printStackTrace();
        }


        List<String> detailAttribute = List.of("Hesap Adı","Kategori","İşlem Miktarı","Açıklama","İşlem Tipi","İşlem Detayı","İşlem Öncesi Bütçe","İşlem Sonrası Bütçe","Para Tipi","İşlem Tarihi");
        List<String> basicAttribute = List.of("Hesap Adı","İşlem Miktarı","Açıklama","İşlem Öncesi Bütçe","İşlem Sonrası Bütçe","İşlem Tarihi");
        PdfPTable table = new PdfPTable(detail ? detailAttribute.size() : basicAttribute.size());
        table.setWidthPercentage(100);
        table.setSpacingBefore(2f);

        addHeader(
            detail ? detailAttribute : basicAttribute,
            table
        );
        addRows(
            table,
            filteredPdfData,
            detail
        );

        document.add(table);
        document.close();

        return outputData.toByteArray();
    }

    public void addHeader(List<String> headerData,PdfPTable table){
        headerData.stream().forEach(columnTitle -> {
            table.addCell(new Phrase(columnTitle));
        });
    }

    public void addRows(PdfPTable table,List<TransferResponseDTO> pdfData,Boolean detail){

        Locale trLocale = Locale.of("tr","TR");
        NumberFormat numberFormat = NumberFormat.getCurrencyInstance(trLocale);


        if (detail){
            pdfData.stream().forEach(data -> {
                MoneyAccount moneyAccount = moneyAccountRepository.findById(data.getMoneyAccountId()).orElseThrow(() -> new RuntimeException("Para hesabı bulunamadı"));
                table.addCell(moneyAccount.getAccountName() != null ? moneyAccount.getAccountName().toString() : "-");
                table.addCell(data.getCategory() != null ? data.getCategory().toString() : "-");
                table.addCell(data.getAmount() != null ? numberFormat.format(data.getAmount()).toString() : "-");
                table.addCell(data.getDescription() != null ? data.getDescription().toString() : "-");
                table.addCell(data.getType() != null ? data.getType().toString() : "-");
                table.addCell(data.getDetails() != null ? data.getDetails().toString() : "-");
    
                table.addCell(data.getInputPreviousBalance() != null ? numberFormat.format(data.getInputPreviousBalance()).toString() : numberFormat.format(data.getOutputPreviousBalance()).toString() );
                table.addCell(data.getInputNextBalance() != null ? numberFormat.format(data.getInputNextBalance()).toString()  :numberFormat.format(data.getOutputNextBalance()).toString());
    
                table.addCell(data.getCurrency() != null ? data.getCurrency().toString() : "-");

                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");
                table.addCell(data.getTransactionDateTime() != null ? data.getTransactionDateTime().format(formatter) : "-");
            });
        }
        else{
            pdfData.stream().forEach(data -> {
                MoneyAccount moneyAccount = moneyAccountRepository.findById(data.getMoneyAccountId()).orElseThrow(() -> new RuntimeException("Para hesabı bulunamadı"));
                table.addCell(moneyAccount.getAccountName() != null ? moneyAccount.getAccountName().toString() : "-");
                table.addCell(data.getAmount() != null ? numberFormat.format(data.getAmount()).toString() : "-");
                table.addCell(data.getDescription() != null ? data.getDescription().toString() : "-");
    
                table.addCell(data.getInputPreviousBalance() != null ? numberFormat.format(data.getInputPreviousBalance()).toString() : numberFormat.format(data.getOutputPreviousBalance()).toString() );
                table.addCell(data.getInputNextBalance() != null ? numberFormat.format(data.getInputNextBalance()).toString()  : numberFormat.format(data.getOutputNextBalance()).toString());

                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");
                table.addCell(data.getTransactionDateTime() != null ? data.getTransactionDateTime().format(formatter) : "-");
            });
        }
    }

}
