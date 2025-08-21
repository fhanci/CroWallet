package com.crowallet.backend.service;

import com.crowallet.backend.dto.AccountDTO;
import com.crowallet.backend.dto.TransferDTO;
import com.crowallet.backend.entity.Transfer;
import com.crowallet.backend.mapper.AccountMapper;
import com.crowallet.backend.mapper.TransferMapper;
import com.crowallet.backend.mapper.UserMapper;
import com.crowallet.backend.repository.TransferRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import com.crowallet.backend.comman.GeneralException;
import com.crowallet.backend.entity.Account;
import com.crowallet.backend.repository.AccountRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Service
public class AccountService {
    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransferRepository transferRepository;

    @Autowired
    private TransferService transferService;

    @Transactional
    public AccountDTO createAccount(AccountDTO accountDTO) {
        Account account = AccountMapper.INSTANCE.toAccount(accountDTO);
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


    public List<AccountDTO> getAllAccounts() {
        return AccountMapper.INSTANCE.toAccountDTOList(accountRepository.findAll());
    }

    public List<AccountDTO> getUserAccounts(Long id){
        return AccountMapper.INSTANCE.toAccountDTOList(accountRepository.findAll().stream().filter(s -> Objects.equals(s.getUser().getId(), id)).toList());
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
        existingAccount.setUser(UserMapper.INSTANCE.toUser(updatedAccount.getUser()));

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