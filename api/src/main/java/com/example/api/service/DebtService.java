package com.example.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import com.example.api.comman.GeneralException;
import com.example.api.entity.Debt;
import com.example.api.repository.AccountRepository;
import com.example.api.repository.UserRepository;
import com.example.api.repository.DebtRepository;

@Service
public class DebtService {

    @Autowired
    private final DebtRepository debtRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    public DebtService(DebtRepository debtRepository) {
        this.debtRepository = debtRepository;
    }

    public Debt createDebt(Debt debt) {
        return debtRepository.save(debt);
    }

    public List<Debt> getAllDebts() {
        return debtRepository.findAll();
    }

    public Debt getDebtById(Integer id) {
        return debtRepository.findById(id)
                .orElseThrow(() -> new GeneralException("Debt not found: " + id));
    }

    public Debt updateDebt(Integer id, Debt updatedDebt) {
        Debt existingDebt = debtRepository.findById(id)
                .orElseThrow(() -> new GeneralException("Debt to be updated not found: " + id));

        existingDebt.setDebtAmount(updatedDebt.getDebtAmount());
        existingDebt.setDebtCurrency(updatedDebt.getDebtCurrency());
        existingDebt.setToWhom(updatedDebt.getToWhom());
        existingDebt.setStatus(updatedDebt.getStatus());
        existingDebt.setWarningPeriod(updatedDebt.getWarningPeriod());
        existingDebt.setDueDate(updatedDebt.getDueDate());

        // Hesap bilgisi set et
        if (updatedDebt.getAccount() != null && updatedDebt.getAccount().getId() != null) {
            existingDebt.setAccount(
                accountRepository.findById(updatedDebt.getAccount().getId())
                    .orElseThrow(() -> new GeneralException("Account not found: " + updatedDebt.getAccount().getId()))
            );
        }

        // Kullanıcı bilgisi set et
        if (updatedDebt.getUser() != null && updatedDebt.getUser().getId() != null) {
            existingDebt.setUser(
                userRepository.findById(updatedDebt.getUser().getId())
                    .orElseThrow(() -> new GeneralException("User not found: " + updatedDebt.getUser().getId()))
            );
        }

        return debtRepository.save(existingDebt);
    }

    public void deleteDebt(Integer id) {
        if (!debtRepository.existsById(id)) {
            throw new GeneralException("Debt to be deleted not found: " + id);
        }
        debtRepository.deleteById(id);
    }
}
