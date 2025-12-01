package com.crowallet.backend.controller;

import com.crowallet.backend.dto.DebtDTO;
import com.crowallet.backend.dto.DebtPaymentDTO;
import com.crowallet.backend.dto.DebtSummaryDTO;
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

    @GetMapping
    public List<DebtDTO> getAllDebts() {
        return debtService.getAllDebts();
    }

    @GetMapping("/get/{userId}")
    public List<DebtDTO> getUserDebts(@PathVariable Long userId) {
        return debtService.getUserDebts(userId);
    }

    @GetMapping("/active/{userId}")
    public List<DebtDTO> getUserActiveDebts(@PathVariable Long userId) {
        return debtService.getUserActiveDebts(userId);
    }

    @GetMapping("/summary/{userId}")
    public DebtSummaryDTO getUserDebtSummary(@PathVariable Long userId) {
        return debtService.getUserDebtSummary(userId);
    }

    @GetMapping("/upcoming/{userId}")
    public List<DebtPaymentDTO> getUpcomingPayments(@PathVariable Long userId, 
            @RequestParam(defaultValue = "5") int limit) {
        return debtService.getUpcomingPayments(userId, limit);
    }

    @GetMapping("/{id}")
    public DebtDTO getDebtById(@PathVariable Long id) {
        return debtService.getDebtById(id);
    }

    @GetMapping("/{id}/payments")
    public List<DebtPaymentDTO> getDebtPayments(@PathVariable Long id) {
        return debtService.getDebtPayments(id);
    }

    @PostMapping("/create")
    public DebtDTO createDebt(@RequestBody DebtDTO debt) {
        return debtService.createDebt(debt);
    }

    @PostMapping("/payment/{paymentId}/pay")
    public DebtPaymentDTO markPaymentAsPaid(@PathVariable Long paymentId) {
        return debtService.markPaymentAsPaid(paymentId);
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
