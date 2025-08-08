package com.example.api.controller;

import com.example.api.dto.DebtDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.example.api.entity.Debt;
import com.example.api.service.DebtService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/debts")
public class DebtController {

    @Autowired
    private DebtService debtService;

    @GetMapping
    public List<DebtDTO> getAllDebts() {
        return debtService.getAllDebts();
    }

    @GetMapping("/get/{id}")
    public List<DebtDTO> getUserDebts(@PathVariable Long id) {
        return debtService.getUserDebts(id);
    }

    @GetMapping("/{id}")
    public DebtDTO getDebtById(@PathVariable Long id) {
        return debtService.getDebtById(id);
    }

    @PostMapping
    public DebtDTO createDebt(@RequestBody DebtDTO debt) {
        return debtService.createDebt(debt);
    }

    @PutMapping("/update/{id}")
    public DebtDTO updateDebt(@PathVariable Long id, @RequestBody DebtDTO debt) {
        return debtService.updateDebt(id, debt);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteDebt(@PathVariable Long id) {
        debtService.deleteDebt(id);
    }
}