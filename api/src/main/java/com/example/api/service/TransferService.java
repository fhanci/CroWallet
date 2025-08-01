package com.example.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import com.example.api.comman.GeneralException;
import com.example.api.entity.Transfer;
import com.example.api.repository.TransferRepository;

@Service
public class TransferService {
    @Autowired
    private final TransferRepository transferRepository;

    public TransferService(TransferRepository transferRepository) {
        this.transferRepository = transferRepository;
    }

    public Transfer createTransfer(Transfer transfer) {
        return transferRepository.save(transfer);
    }

    public List<Transfer> getAllTransfers() {
        return transferRepository.findAll();
    }

    public Transfer getTransferById(Integer id) {
        return transferRepository.findById(id)
                .orElseThrow(() -> new GeneralException("Transfer not found: " + id));
    }

    public Transfer updateTransfer(Integer id, Transfer updatedTransfer) {
        Transfer existingTransfer = transferRepository.findById(id)
                .orElseThrow(() -> new GeneralException("Transfer to be updated not found: " + id));

        existingTransfer.setCategory(updatedTransfer.getCategory());
        existingTransfer.setAmount(updatedTransfer.getAmount());
        existingTransfer.setDate(updatedTransfer.getDate());
        existingTransfer.setCreateDate(updatedTransfer.getCreateDate());
        existingTransfer.setDescription(updatedTransfer.getDescription());
        existingTransfer.setPerson(updatedTransfer.getPerson());
        existingTransfer.setType(updatedTransfer.getType());
        existingTransfer.setDetails(updatedTransfer.getDetails());
        existingTransfer.setExchangeRate(updatedTransfer.getExchangeRate());
        existingTransfer.setUser(updatedTransfer.getUser());
        existingTransfer.setAccount(updatedTransfer.getAccount());

        return transferRepository.save(existingTransfer);
    }

    public void deleteTransfer(Integer id) {
        if (!transferRepository.existsById(id)) {
            throw new GeneralException("Transfer to be deleted not found: " + id);
        }
        transferRepository.deleteById(id);
    }
}