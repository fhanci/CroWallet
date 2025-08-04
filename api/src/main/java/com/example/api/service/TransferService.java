package com.example.api.service;

import com.example.api.dto.TransferDTO;
import com.example.api.mapper.AccountMapper;
import com.example.api.mapper.TransferMapper;
import com.example.api.mapper.UserMapper;
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

    public TransferDTO createTransfer(TransferDTO transfer) {
        Transfer transfer1 = TransferMapper.INSTANCE.toTransfer(transfer);
        transferRepository.save(transfer1);
        return transfer;
    }

    public List<TransferDTO> getAllTransfers() {
        return TransferMapper.INSTANCE.toTransferDTOList(transferRepository.findAll());
    }

    public TransferDTO getTransferById(Long id) {
        return TransferMapper.INSTANCE.toTransferDTO(transferRepository.findById(id)
                .orElseThrow(() -> new GeneralException("Transfer not found: " + id)));
    }

    public TransferDTO updateTransfer(Long id, TransferDTO updatedTransfer) {
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
        existingTransfer.setUser(UserMapper.INSTANCE.toUser(updatedTransfer.getUser()));
        existingTransfer.setAccount(AccountMapper.INSTANCE.toAccount(updatedTransfer.getAccount()));

        return TransferMapper.INSTANCE.toTransferDTO(transferRepository.save(existingTransfer));
    }

    public void deleteTransfer(Long id) {
        if (!transferRepository.existsById(id)) {
            throw new GeneralException("Transfer to be deleted not found: " + id);
        }
        transferRepository.deleteById(id);
    }
}