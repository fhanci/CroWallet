package com.crowallet.backend.controller;

import com.crowallet.backend.dto.AccounttoAccountTransferRequestDTO;
import com.crowallet.backend.dto.AccounttoAccountTransferResponseDTO;
import com.crowallet.backend.dto.TransferDTO;
import com.crowallet.backend.dto.TransferResponseDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.crowallet.backend.service.TransferService;




@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    @Autowired
    private TransferService transferService;

    @GetMapping("/get/{id}")
    public List<TransferResponseDTO> getUserTransfersByMoneyAccount(@PathVariable Long id) {
        return transferService.getUserTransfersByMoneyAccount(id);
    }

    @GetMapping("/getUserAllTransfers")
    public ResponseEntity<List<TransferResponseDTO>> getUserAllTransfers(@RequestParam Long userId) {
        List<TransferResponseDTO> userAllTransfers = transferService.getUserAllTransfers(userId);
        return ResponseEntity.ok(userAllTransfers);
    }
    


    @PostMapping("/create")
    public TransferResponseDTO createTransfer(@RequestBody TransferDTO transfer) {
        return transferService.createTransfer(transfer);
    }

    @PostMapping("/create/account-to-account-transfer")
    public ResponseEntity<AccounttoAccountTransferResponseDTO> createAccountToAccountTransfer(@RequestBody AccounttoAccountTransferRequestDTO transferDTO) {
        return ResponseEntity.ok(transferService.createAccountToAccountTransfer(transferDTO));
    }

    @GetMapping("/getAccountToAccountTransfer")
    public ResponseEntity<Map<String, Long>> getAccountToAccountTransfer(@RequestParam Long transferId) {
        return ResponseEntity.ok(transferService.getAccountToAccountTransfer(transferId));
    }
    
    
}
