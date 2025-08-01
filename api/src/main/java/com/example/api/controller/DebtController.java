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
    private final DebtService debtService;

    public DebtController(DebtService debtService) {
        this.debtService = debtService;
    }

    @GetMapping
    public List<Debt> getAllDebts() {
        return debtService.getAllDebts();
    }

    @GetMapping("/{id}")
    public Debt getDebtById(@PathVariable Integer id) {
        return debtService.getDebtById(id);
    }

    @PostMapping
    public Debt createDebt(@RequestBody Debt debt) {
        return debtService.createDebt(debt);
    }

    @PutMapping("/{id}")
    public Debt updateDebt(@PathVariable Integer id, @RequestBody Debt debt) {
        debt.setId(id);
        return debtService.updateDebt(id, debt);
    }

    @DeleteMapping("/{id}")
    public void deleteDebt(@PathVariable Integer id) {
        debtService.deleteDebt(id);
    }
}