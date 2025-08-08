package com.example.api.controller;

import com.example.api.dto.TransferDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.example.api.entity.Transfer;
import com.example.api.service.TransferService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/transfers")
public class TransferController {

    @Autowired
    private TransferService transferService;

    @GetMapping
    public List<TransferDTO> getAllTransfers() {
        return transferService.getAllTransfers();
    }

    @GetMapping("/get/{id}")
    public List<TransferDTO> getUserTransfers(@PathVariable Long id) {
        return transferService.getUserTransfers(id);
    }

    @GetMapping("/{id}")
    public TransferDTO getTransferById(@PathVariable Long id) {
        return transferService.getTransferById(id);
    }

    @PostMapping("/create")
    public TransferDTO createTransfer(@RequestBody TransferDTO transfer) {
        return transferService.createTransfer(transfer);
    }

    @PutMapping("/update/{id}")
    public TransferDTO updateTransfer(@PathVariable Long id, @RequestBody TransferDTO transfer) {
        return transferService.updateTransfer(id, transfer);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteTransfer(@PathVariable Long id) {
        transferService.deleteTransfer(id);
    }
}
