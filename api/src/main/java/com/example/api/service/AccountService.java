package com.example.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import com.example.api.comman.GeneralException;
import com.example.api.entity.Account;
import com.example.api.repository.AccountRepository;

@Service
public class AccountService {
    @Autowired
    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public Account createAccount(Account account) {
        return accountRepository.save(account);
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public Account getAccountById(Integer id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new GeneralException("Account not found: " + id));
    }

    public Account updateAccount(Integer id, Account updatedAccount) {
        Account existingAccount = accountRepository.findById(id)
                .orElseThrow(() -> new GeneralException("Account to be updated not found: " + id));

        existingAccount.setUpdateDate(updatedAccount.getUpdateDate());
        existingAccount.setAccountName(updatedAccount.getAccountName());
        existingAccount.setBalance(updatedAccount.getBalance());
        existingAccount.setCurrency(updatedAccount.getCurrency());
        existingAccount.setUser(updatedAccount.getUser());

        return accountRepository.save(existingAccount);
    }

    public void deleteAccount(Integer id) {
        if (!accountRepository.existsById(id)) {
            throw new GeneralException("Account to be deleted not found: " + id);
        }
        accountRepository.deleteById(id);
    }
}