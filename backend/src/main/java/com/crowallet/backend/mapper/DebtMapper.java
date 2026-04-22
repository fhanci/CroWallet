package com.crowallet.backend.mapper;

import com.crowallet.backend.dto.DebtDTO;
import com.crowallet.backend.dto.DebtPaymentDTO;
import com.crowallet.backend.dto.DebtRequestDTO;
import com.crowallet.backend.dto.DebtResponseDTO;
import com.crowallet.backend.entity.Debt;
import com.crowallet.backend.entity.DebtPayment;
import com.crowallet.backend.entity.DebtType;
import com.crowallet.backend.entity.PaymentFrequency;
import com.crowallet.backend.entity.PaymentType;
import com.crowallet.backend.requests.DebtResponse;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(uses = {DebtMapper.class, MoneyAccountMapper.class})
public interface DebtMapper {
    DebtMapper INSTANCE = Mappers.getMapper(DebtMapper.class);

    @Mapping(target = "payments", ignore = true)
    @Mapping(source = "debtType", target = "debtType", qualifiedByName = "stringToDebtType")
    @Mapping(source = "paymentType", target = "paymentType", qualifiedByName = "stringToPaymentType")
    @Mapping(source = "paymentFrequency", target = "paymentFrequency", qualifiedByName = "stringToPaymentFrequency")
    Debt toDebt(DebtRequestDTO debtRequestDTO);


    @Mapping(target = "userId", source = "user.id")
    @Mapping(source = "debtType", target = "debtType", qualifiedByName = "debtTypeToString")
    @Mapping(source = "paymentType", target = "paymentType", qualifiedByName = "paymentTypeToString")
    @Mapping(source = "paymentFrequency", target = "paymentFrequency", qualifiedByName = "paymentFrequencyToString")
    // @Mapping(target = "nextPayment", ignore = true)
    // @Mapping(target = "remainingInstallments", ignore = true)
    DebtResponseDTO toDebtResponseDTO(Debt debt);

    List<Debt> toDebtList(List<DebtRequestDTO> debts);
    List<DebtResponseDTO> toDebtResponseList(List<Debt> debts);


    // @Mapping(target = "moneyAccountId", source = "debtResponseDTO.id", qualifiedByName = "getMoneyAccountId")
    // DebtPayment toDebtPayment(DebtResponseDTO debtResponseDTO);

    // DebtPayment mappings
    @Mapping(source = "debt.id", target = "debtId")
    @Mapping(source = "debt.toWhom", target = "debtToWhom")
    @Mapping(source = "debt.debtCurrency", target = "debtCurrency")
    @Mapping(source = "payment", target = "accountName", qualifiedByName = "getAccountName")
    DebtPaymentDTO toPaymentDTO(DebtPayment payment);

    @Mapping(target = "debt", ignore = true)
    DebtPayment toPayment(DebtPaymentDTO dto);

    List<DebtPaymentDTO> toPaymentDTOList(List<DebtPayment> payments);

    // Get account name safely (handles null account)
    @Named("getAccountName")
    default String getAccountName(DebtPayment payment) {
        if (payment != null && payment.getDebt() != null && payment.getDebt().getMoneyAccount() != null) {
            return payment.getDebt().getMoneyAccount().getAccountName();
        }
        return null;
    }

    // Enum converters
    @Named("debtTypeToString")
    default String debtTypeToString(DebtType debtType) {
        return debtType != null ? debtType.name() : null;
    }

    @Named("getMoneyAccountId")
    default Long getMoneyAccountId(DebtResponseDTO debtResponseDTO) {
        return debtResponseDTO != null && debtResponseDTO.getMoneyAccount() != null
                ? debtResponseDTO.getMoneyAccount().getId()
                : null;
    }

    @Named("stringToDebtType")
    default DebtType stringToDebtType(String debtType) {
        return debtType != null ? DebtType.valueOf(debtType) : DebtType.ACCOUNT_DEBT;
    }

    @Named("paymentTypeToString")
    default String paymentTypeToString(PaymentType paymentType) {
        return paymentType != null ? paymentType.name() : null;
    }

    @Named("stringToPaymentType")
    default PaymentType stringToPaymentType(String paymentType) {
        return paymentType != null ? PaymentType.valueOf(paymentType) : PaymentType.SINGLE_DATE;
    }

    @Named("paymentFrequencyToString")
    default String paymentFrequencyToString(PaymentFrequency frequency) {
        return frequency != null ? frequency.name() : null;
    }

    @Named("stringToPaymentFrequency")
    default PaymentFrequency stringToPaymentFrequency(String frequency) {
        return frequency != null ? PaymentFrequency.valueOf(frequency) : null;
    }
}
