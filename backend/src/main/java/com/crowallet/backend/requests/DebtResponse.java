package com.crowallet.backend.requests;

import com.crowallet.backend.dto.DebtDTO;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class DebtResponse {
    private BigDecimal updatedBalance;
    private DebtDTO debtDTO;
}
