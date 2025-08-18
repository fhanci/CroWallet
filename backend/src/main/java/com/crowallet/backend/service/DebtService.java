package com.crowallet.backend.service;

import com.crowallet.backend.dto.DebtDTO;
import com.crowallet.backend.mapper.AccountMapper;
import com.crowallet.backend.mapper.DebtMapper;
import com.crowallet.backend.mapper.UserMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

import com.crowallet.backend.comman.GeneralException;
import com.crowallet.backend.entity.Debt;
import com.crowallet.backend.repository.AccountRepository;
import com.crowallet.backend.repository.UserRepository;
import com.crowallet.backend.repository.DebtRepository;

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

    public List<DebtDTO> getUserDebts(Long id) {
        return DebtMapper.INSTANCE.toDebtDTOList(debtRepository.findAll().stream().filter(s -> Objects.equals(s.getUser().getId(), id)).toList());
    }
}
