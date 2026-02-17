package com.crowallet.backend.controller;

import com.crowallet.backend.dto.AccountDTO;
import com.crowallet.backend.dto.TransferDTO;
import com.crowallet.backend.entity.User;
import com.crowallet.backend.dto.AccountSummaryDTO;
import com.crowallet.backend.dto.CreateInvestmentAccountDTO;
import com.crowallet.backend.dto.InvestmentHoldingDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.crowallet.backend.service.AccountService;
import com.crowallet.backend.repository.UserRepository;;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private UserRepository userRepository;

    // Return all accounts
    @GetMapping("/getAllAccount")
    public List<AccountDTO> getAllAccounts() {
        return accountService.getAllAccounts();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        String username = authentication.getName();

        User user = userRepository.findByUsername(username).orElseThrow();
        return ResponseEntity.ok(Long.valueOf(user.getId()));
    }

    // Get all user accounts
    @GetMapping("/get/{userId}")
    public List<AccountDTO> getUserAccounts(@PathVariable Long userId) {
        return accountService.getUserAccounts(userId);
    }

    // Get user account summary (parent view with totals)
    @GetMapping("/summary/{userId}")
    public AccountSummaryDTO getUserAccountSummary(@PathVariable Long userId) {
        return accountService.getUserAccountSummary(userId);
    }

    // Get only currency accounts
    @GetMapping("/currency/{userId}")
    public List<AccountDTO> getUserCurrencyAccounts(@PathVariable Long userId) {
        return accountService.getUserCurrencyAccounts(userId);
    }

    // Get only investment accounts
    @GetMapping("/investment/{userId}")
    public List<AccountDTO> getUserInvestmentAccounts(@PathVariable Long userId) {
        return accountService.getUserInvestmentAccounts(userId);
    }

    // Get single account by ID
    @GetMapping("/{id}")
    public AccountDTO getAccountById(@PathVariable Long id) {
        return accountService.getAccountById(id);
    }

    //Get holdings for an investment account
    @GetMapping("/{id}/holdings")
    public List<InvestmentHoldingDTO> getAccountHoldings(@PathVariable Long id) {
    return accountService.getAccountHoldings(id);
    }

    // @GetMapping("/{id}/holdings")
    // public List<Map<String, Object>> findByAccountInvesment(@PathVariable Long id) {
    //     return accountService.findByAccountInvesment(id);
    // }

    @PostMapping("/create-account")
    public AccountDTO createAccount(@RequestBody AccountDTO account) {
        return accountService.createAccount(account);
    }

    // Create investment account with multiple holdings
    @PostMapping("/create-investment")
    public AccountDTO createInvestmentAccount(@RequestBody CreateInvestmentAccountDTO dto) {
        return accountService.createInvestmentAccount(dto);
    }

    // Add holding to existing investment account
    @PostMapping("/{id}/holdings")
    public InvestmentHoldingDTO addHolding(@PathVariable Long id,
            @RequestBody CreateInvestmentAccountDTO.HoldingItemDTO item) {
        return accountService.addHoldingToAccount(id, item);
    }

    // Update a holding
    @PutMapping("/holdings/{holdingId}")
    public InvestmentHoldingDTO updateHolding(@PathVariable Long holdingId,
            @RequestBody CreateInvestmentAccountDTO.HoldingItemDTO item) {
        return accountService.updateHolding(holdingId, item);
    }

    // Delete a holding
    @DeleteMapping("/holdings/{holdingId}")
    public void deleteHolding(@PathVariable Long holdingId) {
        accountService.removeHoldingFromAccount(holdingId);
    }

    @PutMapping("/update/{id}")
    public AccountDTO updateAccount(@PathVariable Long id, @RequestBody AccountDTO account) {
        return accountService.updateAccount(id, account);
    }

    @PostMapping("/withdraw-money")
    public TransferDTO withdrawMoney(@RequestBody TransferDTO transferDTO) {
        return accountService.withdrawMoney(transferDTO);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
    }
}
