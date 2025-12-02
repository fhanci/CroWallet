package com.crowallet.backend.requests;

import com.crowallet.backend.dto.AccountDTO;
import com.crowallet.backend.dto.UserDTO;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransferData {
    private BigDecimal amount;
    private String category;
    private String details;
    private LocalDate date;
    private LocalDate createDate;
    private Long userId;
    private Long accountId;
    private String type;
    private Long receiverId;
    private BigDecimal inputPreviousBalance;
    private BigDecimal inputNextBalance;

}
