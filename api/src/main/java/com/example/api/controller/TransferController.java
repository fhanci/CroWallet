package com.example.api.controller;

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
    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @GetMapping
    public List<Transfer> getAllTransfers() {
        return transferService.getAllTransfers();
    }

    @GetMapping("/{id}")
    public Transfer getTransferById(@PathVariable Integer id) {
        return transferService.getTransferById(id);
    }

    @PostMapping
    public Transfer createTransfer(@RequestBody Transfer transfer) {
        return transferService.createTransfer(transfer);
    }

    @PutMapping("/{id}")
    public Transfer updateTransfer(@PathVariable Integer id, @RequestBody Transfer transfer) {
        transfer.setId(id);
        return transferService.updateTransfer(id, transfer);
    }

    @DeleteMapping("/{id}")
    public void deleteTransfer(@PathVariable Integer id) {
        transferService.deleteTransfer(id);
    }
}
