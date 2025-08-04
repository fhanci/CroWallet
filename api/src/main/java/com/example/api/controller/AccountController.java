package com.example.api.controller;

import com.example.api.dto.AccountDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.example.api.entity.Account;
import com.example.api.service.AccountService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @GetMapping
    public List<AccountDTO> getAllAccounts() {
        return accountService.getAllAccounts();
    }

    @GetMapping("/{id}")
    public AccountDTO getAccountById(@PathVariable Long id) {
        return accountService.getAccountById(id);
    }

    @PostMapping
    public AccountDTO createAccount(@RequestBody AccountDTO account) {
        return accountService.createAccount(account);
    }

    @PutMapping("/update/{id}")
    public AccountDTO updateAccount(@PathVariable Long id, @RequestBody AccountDTO account) {
        account.setId(id);
        return accountService.updateAccount(id, account);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
    }
}
