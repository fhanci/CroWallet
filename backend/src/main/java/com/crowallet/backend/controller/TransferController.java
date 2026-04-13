package com.crowallet.backend.controller;

import com.crowallet.backend.dto.AccounttoAccountTransferRequestDTO;
import com.crowallet.backend.dto.AccounttoAccountTransferResponseDTO;
import com.crowallet.backend.dto.TransferDTO;
import com.crowallet.backend.dto.TransferResponseDTO;
import com.crowallet.backend.entity.AccounttoAccountTransfer;

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

    // @GetMapping
    // public List<TransferDTO> getAllTransfers() {
    //     return transferService.getAllTransfers();
    // }

    @GetMapping("/get/{id}")
    public List<TransferResponseDTO> getUserTransfersByMoneyAccount(@PathVariable Long id) {
        return transferService.getUserTransfersByMoneyAccount(id);
    }

    @GetMapping("/getUserAllTransfers")
    public ResponseEntity<List<TransferResponseDTO>> getUserAllTransfers(@RequestParam Long userId) {
        List<TransferResponseDTO> userAllTransfers = transferService.getUserAllTransfers(userId);
        return ResponseEntity.ok(userAllTransfers);
    }
    

    // @GetMapping("/{id}")
    // public TransferDTO getTransferById(@PathVariable Long id) {
    //     return transferService.getTransferById(id);
    // }

    @PostMapping("/create")
    public TransferResponseDTO createTransfer(@RequestBody TransferDTO transfer) {
        return transferService.createTransfer(transfer);
    }

    // @PutMapping("/update/{id}")
    // public TransferDTO updateTransfer(@PathVariable Long id, @RequestBody TransferDTO transfer) {
    //     return transferService.updateTransfer(id, transfer);
    // }

    // @PostMapping("/add-money")
    // public TransferDTO addMoney(@RequestBody TransferDTO transferDTO) {
    //     return transferService.addMoney(transferDTO);
    // }

    // @DeleteMapping("/delete/{id}")
    // public void deleteTransfer(@PathVariable Long id) {
    //     transferService.deleteTransfer(id);
    // }

    @PostMapping("/create/account-to-account-transfer")
    public ResponseEntity<AccounttoAccountTransferResponseDTO> createAccountToAccountTransfer(@RequestBody AccounttoAccountTransferRequestDTO transferDTO) {
        return ResponseEntity.ok(transferService.createAccountToAccountTransfer(transferDTO));
    }

    @GetMapping("/getAccountToAccountTransfer")
    public ResponseEntity<Map<String, Long>> getAccountToAccountTransfer(@RequestParam Long transferId) {
        return ResponseEntity.ok(transferService.getAccountToAccountTransfer(transferId));
    }
    
    
}
