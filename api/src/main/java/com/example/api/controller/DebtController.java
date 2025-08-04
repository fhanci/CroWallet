package com.example.api.controller;

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
    public List<Debt> getAllDebts() {
        return debtService.getAllDebts();
    }

    @GetMapping("/{id}")
    public Debt getDebtById(@PathVariable Long id) {
        return debtService.getDebtById(id);
    }

    @PostMapping
    public Debt createDebt(@RequestBody Debt debt) {
        return debtService.createDebt(debt);
    }

    @PutMapping("/{id}")
    public Debt updateDebt(@PathVariable Long id, @RequestBody Debt debt) {
        debt.setId(id);
        return debtService.updateDebt(id, debt);
    }

    @DeleteMapping("/{id}")
    public void deleteDebt(@PathVariable Long id) {
        debtService.deleteDebt(id);
    }
}