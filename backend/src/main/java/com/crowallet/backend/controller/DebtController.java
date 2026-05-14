package com.crowallet.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.crowallet.backend.dto.DebtDTO;
import com.crowallet.backend.dto.DebtPaymentDTO;
import com.crowallet.backend.dto.DebtRequestDTO;
import com.crowallet.backend.dto.DebtResponseDTO;
import com.crowallet.backend.dto.DebtSummaryDTO;
import com.crowallet.backend.requests.PayDebt;
import com.crowallet.backend.service.DebtService;

@RestController
@RequestMapping("/api/debts")
public class DebtController {

    @Autowired
    private DebtService debtService;

    @GetMapping("/summary/{userId}")
    public DebtSummaryDTO getUserDebtSummary(@PathVariable Long userId) {
        return debtService.getUserDebtSummary(userId);
    }

    @GetMapping("/getAllPayments")
    public List<DebtPaymentDTO> getAllPayments() {
        return debtService.getAllPayments();
    }

    @GetMapping("/upcoming/{userId}")
    public List<DebtPaymentDTO> getUpcomingPayments(@PathVariable Long userId, 
            @RequestParam(defaultValue = "5") int limit) {
        return debtService.getUpcomingPayments(userId, limit);
    }

    @GetMapping("/{id}")
    public DebtResponseDTO getDebtById(@PathVariable Long id) {
        return debtService.getDebtById(id);
    }

    @GetMapping("/{id}/payments")
    public List<DebtPaymentDTO> getDebtPayments(@PathVariable Long id) {
        return debtService.getDebtPayments(id);
    }

    @PostMapping("/create")
    public DebtResponseDTO createDebt(@RequestBody DebtRequestDTO debt) {
        return debtService.createDebt(debt);
    }

    @PostMapping("/payment/{paymentId}/pay")
    public DebtPaymentDTO markPaymentAsPaid(@PathVariable Long paymentId, @RequestBody PayDebt payDebt) {
        return debtService.markPaymentAsPaid(paymentId, payDebt);
    }

    @PutMapping("/update/{id}")
    public DebtResponseDTO updateDebt(@PathVariable Long id, @RequestBody DebtDTO debt) {
        return debtService.updateDebt(id, debt);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteDebt(@PathVariable Long id) {
        debtService.deleteDebt(id);
    }
}
