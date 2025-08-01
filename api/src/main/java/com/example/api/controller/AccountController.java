package com.example.api.controller;

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
    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public List<Account> getAllAccounts() {
        return accountService.getAllAccounts();
    }

    @GetMapping("/{id}")
    public Account getAccountById(@PathVariable Integer id) {
        return accountService.getAccountById(id);
    }

    @PostMapping
    public Account createAccount(@RequestBody Account account) {
        return accountService.createAccount(account);
    }

    @PutMapping("/{id}")
    public Account updateAccount(@PathVariable Integer id, @RequestBody Account account) {
        account.setId(id);
        return accountService.updateAccount(id, account);
    }

    @DeleteMapping("/{id}")
    public void deleteAccount(@PathVariable Integer id) {
        accountService.deleteAccount(id);
    }
}
