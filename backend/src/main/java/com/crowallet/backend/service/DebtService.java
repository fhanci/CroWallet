package com.crowallet.backend.service;

import com.crowallet.backend.dto.DebtDTO;
import com.crowallet.backend.dto.DebtPaymentDTO;
import com.crowallet.backend.dto.DebtSummaryDTO;
import com.crowallet.backend.entity.*;
import com.crowallet.backend.mapper.DebtMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import com.crowallet.backend.comman.GeneralException;
import com.crowallet.backend.repository.AccountRepository;
import com.crowallet.backend.repository.UserRepository;
import com.crowallet.backend.repository.DebtRepository;
import com.crowallet.backend.repository.DebtPaymentRepository;

@Service
public class DebtService {

    @Autowired
    private DebtRepository debtRepository;

    @Autowired
    private DebtPaymentRepository paymentRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public DebtDTO createDebt(DebtDTO debtDTO) {
        User user = userRepository.findById(debtDTO.getUser().getId())
                .orElseThrow(() -> new GeneralException("User not found"));

        Debt debt = new Debt();
        debt.setDebtAmount(debtDTO.getDebtAmount());
        debt.setDebtCurrency(debtDTO.getDebtCurrency());
        debt.setToWhom(debtDTO.getToWhom());
        debt.setDueDate(debtDTO.getDueDate());
        debt.setStatus(debtDTO.getStatus() != null ? debtDTO.getStatus() : "ACTIVE");
        debt.setWarningPeriod(debtDTO.getWarningPeriod());
        debt.setDescription(debtDTO.getDescription());
        debt.setUser(user);
        debt.setRemainingAmount(debtDTO.getDebtAmount());

        // Set debt type
        DebtType debtType = debtDTO.getDebtType() != null 
                ? DebtType.valueOf(debtDTO.getDebtType()) 
                : DebtType.ACCOUNT_DEBT;
        debt.setDebtType(debtType);

        // Set payment type
        PaymentType paymentType = debtDTO.getPaymentType() != null 
                ? PaymentType.valueOf(debtDTO.getPaymentType()) 
                : PaymentType.SINGLE_DATE;
        debt.setPaymentType(paymentType);

        // Link to account if ACCOUNT_DEBT
        if (debtType == DebtType.ACCOUNT_DEBT && debtDTO.getAccount() != null && debtDTO.getAccount().getId() != null) {
            Account account = accountRepository.findById(debtDTO.getAccount().getId())
                    .orElseThrow(() -> new GeneralException("Account not found"));
            debt.setAccount(account);
        }

        // Handle periodic payments
        if (paymentType == PaymentType.PERIODIC) {
            PaymentFrequency frequency = debtDTO.getPaymentFrequency() != null 
                    ? PaymentFrequency.valueOf(debtDTO.getPaymentFrequency()) 
                    : PaymentFrequency.MONTHLY;
            debt.setPaymentFrequency(frequency);
            debt.setTotalInstallments(debtDTO.getTotalInstallments());
            debt.setPaidInstallments(0);
            debt.setStartDate(debtDTO.getStartDate() != null ? debtDTO.getStartDate() : LocalDate.now());

            // Calculate installment amount
            if (debtDTO.getInstallmentAmount() != null) {
                debt.setInstallmentAmount(debtDTO.getInstallmentAmount());
            } else if (debtDTO.getTotalInstallments() != null && debtDTO.getTotalInstallments() > 0) {
                debt.setInstallmentAmount(debtDTO.getDebtAmount().divide(
                        BigDecimal.valueOf(debtDTO.getTotalInstallments()), 2, RoundingMode.HALF_UP));
            }
        }

        debt = debtRepository.save(debt);

        // Generate payment schedule
        generatePaymentSchedule(debt);

        return enrichDebtDTO(DebtMapper.INSTANCE.toDebtDTO(debt));
    }

    private void generatePaymentSchedule(Debt debt) {
        if (debt.getPaymentType() == PaymentType.SINGLE_DATE) {
            // Single payment on due date
            DebtPayment payment = new DebtPayment();
            payment.setDebt(debt);
            payment.setPaymentDate(debt.getDueDate());
            payment.setAmount(debt.getDebtAmount());
            payment.setPaymentNumber(1);
            payment.setStatus("PENDING");
            paymentRepository.save(payment);
        } else if (debt.getPaymentType() == PaymentType.PERIODIC && debt.getTotalInstallments() != null) {
            LocalDate paymentDate = debt.getStartDate() != null ? debt.getStartDate() : LocalDate.now();
            LocalDate lastPaymentDate = paymentDate;
            
            for (int i = 1; i <= debt.getTotalInstallments(); i++) {
                DebtPayment payment = new DebtPayment();
                payment.setDebt(debt);
                payment.setPaymentDate(paymentDate);
                payment.setAmount(debt.getInstallmentAmount());
                payment.setPaymentNumber(i);
                payment.setStatus("PENDING");
                paymentRepository.save(payment);

                lastPaymentDate = paymentDate;
                // Calculate next payment date based on frequency
                paymentDate = calculateNextPaymentDate(paymentDate, debt.getPaymentFrequency());
            }

            // Update due date to last payment date
            debt.setDueDate(lastPaymentDate);
            debtRepository.save(debt);
        }
    }

    private LocalDate calculateNextPaymentDate(LocalDate current, PaymentFrequency frequency) {
        return switch (frequency) {
            case WEEKLY -> current.plusWeeks(1);
            case MONTHLY -> current.plusMonths(1);
            case QUARTERLY -> current.plusMonths(3);
            case YEARLY -> current.plusYears(1);
        };
    }


    @Transactional
    public DebtPaymentDTO markPaymentAsPaid(Long paymentId) {
        DebtPayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new GeneralException("Payment not found"));

        payment.setStatus("PAID");
        payment.setPaidDate(LocalDate.now());

        Debt debt = payment.getDebt();
        debt.setPaidInstallments((debt.getPaidInstallments() != null ? debt.getPaidInstallments() : 0) + 1);
        debt.setRemainingAmount(debt.getRemainingAmount().subtract(payment.getAmount()));

        // Check if all payments are done
        if (debt.getPaymentType() == PaymentType.PERIODIC) {
            if (debt.getPaidInstallments().equals(debt.getTotalInstallments())) {
                debt.setStatus("COMPLETED");
            }
        } else {
            debt.setStatus("COMPLETED");
        }

        debtRepository.save(debt);
        payment = paymentRepository.save(payment);

        return DebtMapper.INSTANCE.toPaymentDTO(payment);
    }

    public List<DebtDTO> getAllDebts() {
        return debtRepository.findAll().stream()
                .map(d -> enrichDebtDTO(DebtMapper.INSTANCE.toDebtDTO(d)))
                .collect(Collectors.toList());
    }

    public DebtDTO getDebtById(Long id) {
        Debt debt = debtRepository.findById(id)
                .orElseThrow(() -> new GeneralException("Debt not found: " + id));
        return enrichDebtDTO(DebtMapper.INSTANCE.toDebtDTO(debt));
    }

    @Transactional
    public DebtDTO updateDebt(Long id, DebtDTO updatedDebt) {
        Debt existingDebt = debtRepository.findById(id)
                .orElseThrow(() -> new GeneralException("Debt not found: " + id));

        existingDebt.setDebtAmount(updatedDebt.getDebtAmount());
        existingDebt.setDebtCurrency(updatedDebt.getDebtCurrency());
        existingDebt.setToWhom(updatedDebt.getToWhom());
        existingDebt.setStatus(updatedDebt.getStatus());
        existingDebt.setWarningPeriod(updatedDebt.getWarningPeriod());
        existingDebt.setDueDate(updatedDebt.getDueDate());
        existingDebt.setDescription(updatedDebt.getDescription());

        if (updatedDebt.getAccount() != null && updatedDebt.getAccount().getId() != null) {
            Account account = accountRepository.findById(updatedDebt.getAccount().getId())
                    .orElseThrow(() -> new GeneralException("Account not found"));
            existingDebt.setAccount(account);
        }

        Debt saved = debtRepository.save(existingDebt);
        return enrichDebtDTO(DebtMapper.INSTANCE.toDebtDTO(saved));
    }

    @Transactional
    public void deleteDebt(Long id) {
        if (!debtRepository.existsById(id)) {
            throw new GeneralException("Debt not found: " + id);
        }
        paymentRepository.deleteByDebtId(id);
        debtRepository.deleteById(id);
    }

    public List<DebtDTO> getUserDebts(Long userId) {
        return debtRepository.findAll().stream()
                .filter(s -> Objects.equals(s.getUser().getId(), userId))
                .map(d -> enrichDebtDTO(DebtMapper.INSTANCE.toDebtDTO(d)))
                .collect(Collectors.toList());
    }

    public List<DebtDTO> getUserActiveDebts(Long userId) {
        return debtRepository.findAll().stream()
                .filter(s -> Objects.equals(s.getUser().getId(), userId))
                .filter(s -> !"COMPLETED".equals(s.getStatus()))
                .map(d -> enrichDebtDTO(DebtMapper.INSTANCE.toDebtDTO(d)))
                .collect(Collectors.toList());
    }

    public DebtSummaryDTO getUserDebtSummary(Long userId) {
        List<Debt> allDebts = debtRepository.findAll().stream()
                .filter(s -> Objects.equals(s.getUser().getId(), userId))
                .toList();

        DebtSummaryDTO summary = new DebtSummaryDTO();

        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalRemaining = BigDecimal.ZERO;
        Map<String, BigDecimal> byCurrency = new HashMap<>();
        int active = 0;
        int completed = 0;

        for (Debt debt : allDebts) {
            totalAmount = totalAmount.add(debt.getDebtAmount() != null ? debt.getDebtAmount() : BigDecimal.ZERO);
            totalRemaining = totalRemaining.add(debt.getRemainingAmount() != null ? debt.getRemainingAmount() : BigDecimal.ZERO);

            String currency = debt.getDebtCurrency() != null ? debt.getDebtCurrency() : "TRY";
            BigDecimal remaining = debt.getRemainingAmount() != null ? debt.getRemainingAmount() : BigDecimal.ZERO;
            byCurrency.merge(currency, remaining, BigDecimal::add);

            if ("COMPLETED".equals(debt.getStatus())) {
                completed++;
            } else {
                active++;
            }
        }

        summary.setTotalDebtAmount(totalAmount);
        summary.setTotalRemainingAmount(totalRemaining);
        summary.setTotalPaidAmount(totalAmount.subtract(totalRemaining));
        summary.setDebtsByCurrency(byCurrency);
        summary.setTotalDebts(allDebts.size());
        summary.setActiveDebts(active);
        summary.setCompletedDebts(completed);

        // Get upcoming payments
        List<DebtPayment> upcomingPayments = paymentRepository.findAllPendingPaymentsByUserId(userId);
        summary.setUpcomingPayments(DebtMapper.INSTANCE.toPaymentDTOList(upcomingPayments));

        // Convert debts to DTOs
        summary.setDebts(allDebts.stream()
                .map(d -> enrichDebtDTO(DebtMapper.INSTANCE.toDebtDTO(d)))
                .collect(Collectors.toList()));

        return summary;
    }

    public List<DebtPaymentDTO> getUpcomingPayments(Long userId, int limit) {
        List<DebtPayment> payments = paymentRepository.findAllPendingPaymentsByUserId(userId);
        return payments.stream()
                .limit(limit)
                .map(DebtMapper.INSTANCE::toPaymentDTO)
                .collect(Collectors.toList());
    }

    public List<DebtPaymentDTO> getDebtPayments(Long debtId) {
        return DebtMapper.INSTANCE.toPaymentDTOList(paymentRepository.findByDebtId(debtId));
    }

    private DebtDTO enrichDebtDTO(DebtDTO dto) {
        if (dto == null) return null;

        // Calculate remaining installments
        if (dto.getTotalInstallments() != null && dto.getPaidInstallments() != null) {
            dto.setRemainingInstallments(dto.getTotalInstallments() - dto.getPaidInstallments());
        }

        // Get next payment
        if (dto.getId() != null) {
            List<DebtPayment> pendingPayments = paymentRepository.findByDebtIdAndStatus(dto.getId(), "PENDING");
            if (!pendingPayments.isEmpty()) {
                pendingPayments.sort(Comparator.comparing(DebtPayment::getPaymentDate));
                dto.setNextPayment(DebtMapper.INSTANCE.toPaymentDTO(pendingPayments.get(0)));
            }
        }

        return dto;
    }
}
