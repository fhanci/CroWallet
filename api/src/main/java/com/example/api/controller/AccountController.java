package com.example.api.controller;

import com.example.api.dto.AccountDTO;
import com.example.api.requests.PasswordAuth;
import com.example.api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @Autowired
    private UserService userService;

    // Return all accounts. Not wanted since user only wants his accounts
    @GetMapping
    public List<AccountDTO> getAllAccounts() {
        return accountService.getAllAccounts();
    }

    @GetMapping("/get/{id}")
    public List<AccountDTO> getUserAccounts(@PathVariable Long id) {
        return accountService.getUserAccounts(id);
    }

    // return just one user's account
    @GetMapping("/{id}")
    public AccountDTO getAccountById(@PathVariable Long id) {
        System.out.println("GET ACCOUNT BY ID");
        return accountService.getAccountById(id);
    }

    @PostMapping("create-account")
    public AccountDTO createAccount(@RequestBody AccountDTO account) {
        System.out.println("controller");
        return accountService.createAccount(account);
    }

    @PutMapping("/update/{id}")
    public AccountDTO updateAccount(@PathVariable Long id, @RequestBody AccountDTO account) {
        return accountService.updateAccount(id, account);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
    }
}
