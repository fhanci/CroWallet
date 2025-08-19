package com.crowallet.backend.service;

import com.crowallet.backend.dto.TransferDTO;
import com.crowallet.backend.entity.Account;
import com.crowallet.backend.mapper.AccountMapper;
import com.crowallet.backend.mapper.TransferMapper;
import com.crowallet.backend.mapper.UserMapper;
import com.crowallet.backend.repository.AccountRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import com.crowallet.backend.comman.GeneralException;
import com.crowallet.backend.entity.Transfer;
import com.crowallet.backend.repository.TransferRepository;

@Service
public class TransferService {
    @Autowired
    private final TransferRepository transferRepository;

    @Autowired
    private final AccountRepository accountRepository;

    public TransferService(TransferRepository transferRepository, AccountRepository accountRepository) {
        this.transferRepository = transferRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional
    public TransferDTO createTransfer(TransferDTO transfer) {
        Optional<Account> accountFrom= Optional.empty();
        Optional<Account> accountTo= Optional.empty();
        Transfer transfer1 = TransferMapper.INSTANCE.toTransfer(transfer);
        // form
        if (transfer1.getAccount().getId() != null){
            accountFrom = accountRepository.findById(transfer1.getAccount().getId());
        }
        if (transfer1.getReceiverId() != null) {
            accountTo = accountRepository.findById(transfer1.getReceiverId());
        }
            BigDecimal transferAmount = transfer1.getAmount();
        // hesaplamalar
        if (accountFrom.isPresent()){
            BigDecimal currentBalance = accountFrom.get().getBalance();
            accountFrom.get().setBalance(currentBalance.subtract(transferAmount));
        }

        if (accountTo.isPresent()){
            BigDecimal currentBalance= accountTo.get().getBalance();
            accountTo.get().setBalance(currentBalance.add(transferAmount));
        }
//        // kayıt işlemleri
//        if (accountFrom.isPresent()){
//
//        }
//
//        if (accountTo.isPresent()){
//
//        }

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
        existingTransfer.setReceiverId(updatedTransfer.getReceiverId());
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

    public List<TransferDTO> getUserTransfers(Long id) {
        System.out.println(id);
        return TransferMapper.INSTANCE.toTransferDTOList(
                transferRepository.findAll()
                        .stream()
                        .peek(s -> System.out.println("Account ID: " + s.getAccount().getId() + ", Receiver ID: " + s.getReceiverId()))
                        .filter(s -> Objects.equals(s.getAccount().getId(), id) || Objects.equals(s.getReceiverId(), id))
                        .toList()
        );
    }
}