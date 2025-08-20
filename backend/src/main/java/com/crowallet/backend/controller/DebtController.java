package com.crowallet.backend.controller;

import com.crowallet.backend.dto.DebtDTO;
import com.crowallet.backend.requests.DebtResponse;
import com.crowallet.backend.requests.PayDebt;
import com.crowallet.backend.service.TransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.crowallet.backend.service.DebtService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/debts")
public class DebtController {

    @Autowired
    private DebtService debtService;

    @Autowired
    private TransferService transferService;

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

    @PostMapping("/create")
    public DebtResponse createDebt(@RequestBody DebtDTO debt) {
        return debtService.createDebt(debt);
    }

    @PutMapping("/pay/{id}")
    public DebtResponse payDebt(@PathVariable Long id, @RequestBody PayDebt debt){
        return debtService.payDebt(id, debt);
    }

    @PutMapping("/update/{id}")
    public DebtResponse updateDebt(@PathVariable Long id, @RequestBody DebtDTO debt) {
        return debtService.updateDebt(id, debt);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteDebt(@PathVariable Long id) {
        debtService.deleteDebt(id);
    }
}