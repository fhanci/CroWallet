package com.example.api.service;

import com.example.api.dto.DebtDTO;
import com.example.api.mapper.AccountMapper;
import com.example.api.mapper.DebtMapper;
import com.example.api.mapper.UserMapper;
import jakarta.transaction.Transactional;
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

    public DebtDTO createDebt(DebtDTO debt) {
        Debt debt1 = DebtMapper.INSTANCE.toDebt(debt);
        debtRepository.save(debt1);
        return debt;
    }

    public List<DebtDTO> getAllDebts() {
        return DebtMapper.INSTANCE.toDebtDTOList(debtRepository.findAll());
    }

    public DebtDTO getDebtById(Long id) {
        return DebtMapper.INSTANCE.toDebtDTO(debtRepository.findById(id)
                .orElseThrow(() -> new GeneralException("Debt not found: " + id)));
    }

    @Transactional
    public DebtDTO updateDebt(Long id, DebtDTO updatedDebt) {
        Debt existingDebt = debtRepository.findById(id)
                .orElseThrow(() -> new GeneralException("Debt to be updated not found: " + id));

        existingDebt.setDebtAmount(updatedDebt.getDebtAmount());
        existingDebt.setDebtCurrency(updatedDebt.getDebtCurrency());
        existingDebt.setToWhom(updatedDebt.getToWhom());
        existingDebt.setStatus(updatedDebt.getStatus());
        existingDebt.setWarningPeriod(updatedDebt.getWarningPeriod());
        existingDebt.setDueDate(updatedDebt.getDueDate());

        // Hesap bilgisi set et
        if (userRepository.findById(updatedDebt.getAccount().getId()).isPresent() && updatedDebt.getAccount().getId() != null) {
            existingDebt.setAccount(AccountMapper.INSTANCE.toAccount(updatedDebt.getAccount()));
        }

        // Kullanıcı bilgisi set et
        if (userRepository.findById(updatedDebt.getUser().getId()).isPresent() && updatedDebt.getUser().getId() != null) {
            existingDebt.setUser(UserMapper.INSTANCE.toUser(updatedDebt.getUser()));
        }
        return DebtMapper.INSTANCE.toDebtDTO(debtRepository.save(existingDebt));

    }

    public void deleteDebt(Long id) {
        if (!debtRepository.existsById(id)) {
            throw new GeneralException("Debt to be deleted not found: " + id);
        }
        debtRepository.deleteById(id);
    }
}
