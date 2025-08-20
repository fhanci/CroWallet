package com.crowallet.backend.service;

import com.crowallet.backend.dto.DebtDTO;
import com.crowallet.backend.dto.TransferDTO;
import com.crowallet.backend.entity.Account;
import com.crowallet.backend.entity.Transfer;
import com.crowallet.backend.mapper.AccountMapper;
import com.crowallet.backend.mapper.DebtMapper;
import com.crowallet.backend.mapper.UserMapper;
import com.crowallet.backend.repository.TransferRepository;
import com.crowallet.backend.requests.DebtResponse;
import com.crowallet.backend.requests.PayDebt;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import com.crowallet.backend.comman.GeneralException;
import com.crowallet.backend.entity.Debt;
import com.crowallet.backend.repository.AccountRepository;
import com.crowallet.backend.repository.UserRepository;
import com.crowallet.backend.repository.DebtRepository;

@Service
public class DebtService {

    @Autowired
    private final DebtRepository debtRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransferService transferService;

    @Autowired
    private TransferRepository transferRepository;

    @Autowired
    private UserRepository userRepository;

    public DebtService(DebtRepository debtRepository, AccountRepository accountRepository) {
        this.debtRepository = debtRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional
    public DebtResponse createDebt(DebtDTO debt) {
        Debt debtEntity = DebtMapper.INSTANCE.toDebt(debt);
        Account account = accountRepository.findById(debtEntity.getAccount().getId()).orElse(null);

        if (account != null) {
            account.setBalance(account.getBalance().add(debtEntity.getDebtAmount()));
        }

        debtRepository.save(debtEntity);

        // Transfer oluştur
        TransferDTO transfer = new TransferDTO();
        transfer.setAmount(debtEntity.getDebtAmount());
        transfer.setCategory("Borç Alma");
        transfer.setDetails("Borç alma");
        transfer.setDate(LocalDate.now());
        transfer.setCreateDate(LocalDateTime.now());
        transfer.setUser(debt.getUser());
        transfer.setAccount(debt.getAccount());
        transfer.setType("incoming");
        transfer.setReceiverId(debt.getAccount().getId());
        transfer.setInputPreviousBalance(Objects.requireNonNull(account).getBalance().subtract(debtEntity.getDebtAmount()));
        transfer.setInputNextBalance(account.getBalance());

        transferService.createTransfer(transfer);

        return new DebtResponse(account.getBalance(), DebtMapper.INSTANCE.toDebtDTO(debtEntity));
    }

    public List<DebtDTO> getAllDebts() {
        return DebtMapper.INSTANCE.toDebtDTOList(debtRepository.findAll());
    }

    public DebtDTO getDebtById(Long id) {
        return DebtMapper.INSTANCE.toDebtDTO(debtRepository.findById(id)
                .orElseThrow(() -> new GeneralException("Debt not found: " + id)));
    }

    @Transactional
    public DebtResponse updateDebt(Long id, DebtDTO updatedDebt) {
        Debt existingDebt = debtRepository.findById(id)
                .orElseThrow(() -> new GeneralException("Debt not found: " + id));

        BigDecimal oldAmount = existingDebt.getDebtAmount();
        BigDecimal newAmount = updatedDebt.getDebtAmount();
        BigDecimal difference = newAmount.subtract(oldAmount);

        Account oldAccount = accountRepository.findById(existingDebt.getAccount().getId())
                .orElseThrow(() -> new GeneralException("Old account not found"));
        Account newAccount = accountRepository.findById(updatedDebt.getAccount().getId())
                .orElseThrow(() -> new GeneralException("New account not found"));

        LocalDateTime now = LocalDateTime.now();

        if (!Objects.equals(oldAccount.getId(), newAccount.getId())) {
            // Eski hesaptan çıkış
            BigDecimal oldAccUpdatedBalance = oldAccount.getBalance().subtract(oldAmount);
            TransferDTO transferDTO = new TransferDTO();

            transferDTO.setAmount(oldAmount);
            transferDTO.setCategory("Borç Güncelleme");
            transferDTO.setDetails("Borç hesap değişikliği - eski hesaptan çıkış");
            transferDTO.setDate(now.toLocalDate());
            transferDTO.setCreateDate(now);
            transferDTO.setUser(updatedDebt.getUser());
            transferDTO.setAccount(AccountMapper.INSTANCE.toAccountDTO(oldAccount));
            transferDTO.setType("outgoing");
            transferDTO.setOutputPreviousBalance(oldAccount.getBalance());
            transferDTO.setOutputNextBalance(oldAccUpdatedBalance);

            transferService.createTransfer(transferDTO);
            oldAccount.setBalance(oldAccUpdatedBalance);

            BigDecimal newAccUpdatedBalance = newAccount.getBalance().add(newAmount);
            transferDTO.setAmount(newAmount);
            transferDTO.setCategory("Borç Güncelleme");
            transferDTO.setDetails("Borç hesap değişikliği - yeni hesaba giriş");
            transferDTO.setDate(now.toLocalDate());
            transferDTO.setCreateDate(now);
            transferDTO.setUser(updatedDebt.getUser());
            transferDTO.setAccount(AccountMapper.INSTANCE.toAccountDTO(newAccount));
            transferDTO.setType("incoming");
            transferDTO.setInputPreviousBalance(newAccount.getBalance());
            transferDTO.setInputNextBalance(newAccUpdatedBalance);
            transferService.createTransfer(transferDTO);
            newAccount.setBalance(newAccUpdatedBalance);
        } else {
            BigDecimal updatedBalance = oldAccount.getBalance().add(difference);
            String detail = difference.compareTo(BigDecimal.ZERO) > 0 ? "Borç arttı" : "Borç azaldı";
            String type = difference.compareTo(BigDecimal.ZERO) > 0 ? "incoming" : "outgoing";
            TransferDTO transferDTO = new TransferDTO();
            transferDTO.setAmount(difference.abs());
            transferDTO.setCategory("Borç Güncelleme");
            transferDTO.setDetails(detail);
            transferDTO.setDate(now.toLocalDate());
            transferDTO.setCreateDate(now);
            transferDTO.setUser(updatedDebt.getUser());
            transferDTO.setAccount(AccountMapper.INSTANCE.toAccountDTO(oldAccount));
            transferDTO.setType(type);
            transferDTO.setInputPreviousBalance(oldAccount.getBalance());
            transferDTO.setInputNextBalance(updatedBalance);
            transferService.createTransfer(transferDTO);
            oldAccount.setBalance(updatedBalance);
        }

        existingDebt.setDebtAmount(newAmount);
        existingDebt.setDebtCurrency(updatedDebt.getDebtCurrency());
        existingDebt.setToWhom(updatedDebt.getToWhom());
        existingDebt.setStatus(updatedDebt.getStatus());
        existingDebt.setWarningPeriod(updatedDebt.getWarningPeriod());
        existingDebt.setDueDate(updatedDebt.getDueDate());
        existingDebt.setAccount(newAccount);
        existingDebt.setUser(UserMapper.INSTANCE.toUser(updatedDebt.getUser()));

        debtRepository.save(existingDebt);
        accountRepository.save(oldAccount);
        accountRepository.save(newAccount);

        return new DebtResponse(newAccount.getBalance(), DebtMapper.INSTANCE.toDebtDTO(existingDebt));
    }


    public void deleteDebt(Long id) {
        if (!debtRepository.existsById(id)) {
            throw new GeneralException("Debt to be deleted not found: " + id);
        }
        debtRepository.deleteById(id);
    }

    public List<DebtDTO> getUserDebts(Long id) {
        return DebtMapper.INSTANCE.toDebtDTOList(debtRepository.findAll().stream().filter(s -> Objects.equals(s.getUser().getId(), id)).toList());
    }

    @Transactional
    public DebtResponse payDebt(Long id, PayDebt debt) {
        Debt existingDebt = debtRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Borç bulunamadı"));

        Account account = accountRepository.findById(debt.getAccountId())
                .orElseThrow(() -> new RuntimeException("Hesap bulunamadı"));

        BigDecimal payAmount = debt.getAmount();
        BigDecimal updatedDebtAmount = existingDebt.getDebtAmount().subtract(payAmount);
        BigDecimal updatedBalance = account.getBalance().subtract(payAmount);

        if (updatedBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Yetersiz bakiye");
        }

        existingDebt.setDebtAmount(updatedDebtAmount.max(BigDecimal.ZERO));
        existingDebt.setStatus(updatedDebtAmount.compareTo(BigDecimal.ZERO) <= 0 ? "odendi" : "odenmedi");
        debtRepository.save(existingDebt);

        account.setBalance(updatedBalance);
        account.setUpdateDate(LocalDateTime.now());
        accountRepository.save(account);

        Transfer transfer = new Transfer();
        transfer.setAmount(payAmount);
        transfer.setCategory("Borç Ödeme");
        transfer.setDetails("Borç ödeme");
        transfer.setDate(LocalDate.now());
        transfer.setCreateDate(LocalDateTime.now());
        transfer.setUser(userRepository.findById(debt.getUserId()).orElse(null));
        transfer.setAccount(account);
        transfer.setType("outgoing");
        transfer.setOutputPreviousBalance(account.getBalance().add(payAmount));
        transfer.setOutputNextBalance(updatedBalance);
        transferRepository.save(transfer);

        return new DebtResponse(updatedBalance, DebtMapper.INSTANCE.toDebtDTO(existingDebt));
    }

}
