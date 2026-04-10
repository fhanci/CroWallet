package com.crowallet.backend.dto;

import lombok.Data;

@Data
public class AccounttoAccountTransferResponseDTO {

    private MoneyAccountResponseDTO senderAccount;
    private MoneyAccountResponseDTO receiverAccount;
    private TransferResponseDTO transfer;
    
}
