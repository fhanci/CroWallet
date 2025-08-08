package com.example.api.service;

import com.example.api.dto.AccountDTO;
import com.example.api.mapper.AccountMapper;
import com.example.api.mapper.UserMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

import com.example.api.comman.GeneralException;
import com.example.api.entity.Account;
import com.example.api.repository.AccountRepository;

@Service
public class AccountService {
    @Autowired
    private AccountRepository accountRepository;

    public AccountDTO createAccount(AccountDTO account) {
        System.out.println("1");
        Account account1 = AccountMapper.INSTANCE.toAccount(account);
        System.out.println("2");
        accountRepository.save(account1);
        System.out.println("3");
        return AccountMapper.INSTANCE.toAccountDTO(account1);
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

        existingAccount.setUpdateDate(updatedAccount.getUpdateDate());
        existingAccount.setAccountName(updatedAccount.getAccountName());
        existingAccount.setBalance(updatedAccount.getBalance());
        existingAccount.setCurrency(updatedAccount.getCurrency());
        existingAccount.setUser(UserMapper.INSTANCE.toUser(updatedAccount.getUser()));

        return AccountMapper.INSTANCE.toAccountDTO(accountRepository.save(existingAccount));
    }

    public void deleteAccount(Long id) {
        if (!accountRepository.existsById(id)) {
            throw new GeneralException("Account to be deleted not found: " + id);
        }
        accountRepository.deleteById(id);
    }
}