package com.crowallet.backend.service;

import com.crowallet.backend.dto.AccountDTO;
import com.crowallet.backend.dto.TransferDTO;
import com.crowallet.backend.entity.Transfer;
import com.crowallet.backend.mapper.AccountMapper;
import com.crowallet.backend.mapper.TransferMapper;
import com.crowallet.backend.mapper.UserMapper;
import com.crowallet.backend.repository.TransferRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import com.crowallet.backend.comman.GeneralException;
import com.crowallet.backend.dto.AccountDTO;
import com.crowallet.backend.dto.AccountSummaryDTO;
import com.crowallet.backend.dto.CreateInvestmentAccountDTO;
import com.crowallet.backend.dto.InvestmentHoldingDTO;
import com.crowallet.backend.entity.Account;
import com.crowallet.backend.entity.AccountType;
import com.crowallet.backend.entity.AssetType;
import com.crowallet.backend.entity.InvestmentHolding;
import com.crowallet.backend.entity.User;
import com.crowallet.backend.mapper.AccountMapper;
import com.crowallet.backend.repository.AccountRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.crowallet.backend.repository.InvestmentHoldingRepository;
import com.crowallet.backend.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class AccountService {
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

    @Transactional
    public AccountDTO createAccount(AccountDTO accountDTO) {
        Account account = AccountMapper.INSTANCE.toAccount(accountDTO);
        if (accountDTO.getUserId() != null) {
            User user = userRepository.findById(accountDTO.getUserId())
                    .orElseThrow(() -> new GeneralException("User not found: " + accountDTO.getUserId()));
            account.setUser(user);
        }
        account.setUpdateDate(LocalDateTime.now());

        accountRepository.save(account);

        Transfer transfer = new Transfer();
        transfer.setAmount(account.getBalance());
        transfer.setCategory("Başlangıç Bütçesi");
        transfer.setDetails("Hesap oluşturulurken girilen bakiye");
        transfer.setType("incoming");
        transfer.setDate(LocalDate.now());
        transfer.setCreateDate(LocalDateTime.now());
        transfer.setUser(account.getUser());
        transfer.setAccount(account);
        transfer.setInputPreviousBalance(BigDecimal.ZERO);
        transfer.setInputNextBalance(account.getBalance());

        transferRepository.save(transfer);

        return AccountMapper.INSTANCE.toAccountDTO(account);
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
        List<InvestmentHolding> holdings = holdingRepository.findByAccountId(accountId);
        return AccountMapper.INSTANCE.toHoldingDTOList(holdings);
    }

    public List<AccountDTO> getAllAccounts() {
        return AccountMapper.INSTANCE.toAccountDTOList(accountRepository.findAll());
    }

    public List<AccountDTO> getUserAccounts(Long userId) {
        return AccountMapper.INSTANCE.toAccountDTOList(accountRepository.findByUserId(userId));
    }

    public List<AccountDTO> getUserCurrencyAccounts(Long userId) {
        return AccountMapper.INSTANCE.toAccountDTOList(
            accountRepository.findByUserIdAndAccountType(userId, AccountType.CURRENCY)
        );
    }

    public List<AccountDTO> getUserInvestmentAccounts(Long userId) {
        return AccountMapper.INSTANCE.toAccountDTOList(
            accountRepository.findByUserIdAndAccountType(userId, AccountType.INVESTMENT)
        );
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
            
            // Convert to TRY for total (simplified - you may want to use real exchange rates)
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
        if (amount == null) return BigDecimal.ZERO;
        
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

    @Transactional
    public AccountDTO updateAccount(Long id, AccountDTO updatedAccount) {
        Account existingAccount = accountRepository.findById(id)
                .orElseThrow(() -> new GeneralException("Account to be updated not found: " + id));

        BigDecimal oldBalance = existingAccount.getBalance();
        BigDecimal newBalance = updatedAccount.getBalance();
        BigDecimal difference = newBalance.subtract(oldBalance);

        existingAccount.setUpdateDate(updatedAccount.getUpdateDate());
        existingAccount.setAccountName(updatedAccount.getAccountName());
        existingAccount.setBalance(newBalance);
        existingAccount.setCurrency(updatedAccount.getCurrency());
        
        // Update new fields
        if (updatedAccount.getAccountType() != null) {
            existingAccount.setAccountType(AccountType.valueOf(updatedAccount.getAccountType()));
        }
        if (updatedAccount.getHoldingType() != null) {
            existingAccount.setHoldingType(
                com.crowallet.backend.entity.HoldingType.valueOf(updatedAccount.getHoldingType())
            );
        }
        if (updatedAccount.getAssetType() != null) {
            existingAccount.setAssetType(
                com.crowallet.backend.entity.AssetType.valueOf(updatedAccount.getAssetType())
            );
        }
        existingAccount.setAssetSymbol(updatedAccount.getAssetSymbol());
        existingAccount.setQuantity(updatedAccount.getQuantity());
        existingAccount.setAverageCost(updatedAccount.getAverageCost());
        existingAccount.setCurrentPrice(updatedAccount.getCurrentPrice());

        if (updatedAccount.getUserId() != null) {
            User user = userRepository.findById(updatedAccount.getUserId())
                    .orElseThrow(() -> new GeneralException("User not found: " + updatedAccount.getUserId()));
            existingAccount.setUser(user);
        }

        Account savedAccount = accountRepository.save(existingAccount);

        if (difference.compareTo(BigDecimal.ZERO) != 0) {
            Transfer transfer = new Transfer();
            transfer.setAmount(difference.abs());
            transfer.setType(difference.compareTo(BigDecimal.ZERO) > 0 ? "incoming" : "outgoing");
            transfer.setCategory("Bakiye Güncellemesi");
            transfer.setDetails("Hesap güncellemesi sonucu bakiye farkı");
            transfer.setDate(LocalDate.now());
            transfer.setCreateDate(LocalDateTime.now());
            transfer.setUser(savedAccount.getUser());
            transfer.setAccount(savedAccount);
            transfer.setInputPreviousBalance(oldBalance);
            transfer.setInputNextBalance(newBalance);

            transferRepository.save(transfer);
        }

        return AccountMapper.INSTANCE.toAccountDTO(savedAccount);
    }


    @Transactional
    public void deleteAccount(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new GeneralException("Account to be deleted not found: " + id));

        transferRepository.deleteByAccountId(account.getId());

        accountRepository.delete(account);
    }


    @Transactional
    public TransferDTO withdrawMoney(TransferDTO transferDTO) {
        Account account = accountRepository.findById(transferDTO.getAccount().getId())
                .orElseThrow(() -> new GeneralException("Hesap bulunamadı"));

        BigDecimal amount = transferDTO.getAmount();
        BigDecimal currentBalance = account.getBalance();

        if (currentBalance.compareTo(amount) < 0) {
            throw new GeneralException("Yetersiz bakiye");
        }

        BigDecimal newBalance = currentBalance.subtract(amount);
        account.setBalance(newBalance);
        account.setUpdateDate(LocalDateTime.now());
        accountRepository.save(account);

        transferDTO.setType("outgoing");
        transferDTO.setCreateDate(LocalDateTime.now());
        transferDTO.setDate(LocalDate.now());
        transferDTO.setOutputPreviousBalance(currentBalance);
        transferDTO.setOutputNextBalance(newBalance);

        Transfer transfer = TransferMapper.INSTANCE.toTransfer(transferDTO);
        transferRepository.save(transfer);

        return TransferMapper.INSTANCE.toTransferDTO(transfer);
    }

}
