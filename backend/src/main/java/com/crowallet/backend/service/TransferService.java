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
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    public TransferDTO createTransfer(TransferDTO transferDTO) {
        Transfer transfer = TransferMapper.INSTANCE.toTransfer(transferDTO);

        Optional<Account> accountFromOpt = Optional.empty();
        Optional<Account> accountToOpt = Optional.empty();

        if (transfer.getAccount() != null && transfer.getAccount().getId() != null) {
            accountFromOpt = accountRepository.findById(transfer.getAccount().getId());
        }

        if (transfer.getReceiverId() != null) {
            accountToOpt = accountRepository.findById(transfer.getReceiverId());
        }

        BigDecimal transferAmount = transfer.getAmount();
        LocalDateTime now = LocalDateTime.now();
        transfer.setCreateDate(now);
        transfer.setDate(now.toLocalDate());

        if (transfer.getType().equalsIgnoreCase("outgoing") && accountFromOpt.isPresent()) {
            Account accountFrom = accountFromOpt.get();
            BigDecimal previousBalance = accountFrom.getBalance();
            BigDecimal newBalance = previousBalance.subtract(transferAmount);

            accountFrom.setBalance(newBalance);
            transfer.setOutputPreviousBalance(previousBalance);
            transfer.setOutputNextBalance(newBalance);

            accountRepository.save(accountFrom);
        }

        if (transfer.getType().equalsIgnoreCase("incoming") && accountToOpt.isPresent()) {
            Account accountTo = accountToOpt.get();
            BigDecimal previousBalance = accountTo.getBalance();
            BigDecimal newBalance = previousBalance.add(transferAmount);

            accountTo.setBalance(newBalance);
            transfer.setInputPreviousBalance(previousBalance);
            transfer.setInputNextBalance(newBalance);

            accountRepository.save(accountTo);
        }

        transferRepository.save(transfer);
        return TransferMapper.INSTANCE.toTransferDTO(transfer);
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

    @Transactional
    public TransferDTO addMoney(TransferDTO transferDTO) {
        Account account = accountRepository.findById(transferDTO.getAccount().getId())
                .orElseThrow(() -> new GeneralException("Hesap bulunamadı"));

        BigDecimal amount = transferDTO.getAmount();
        BigDecimal previousBalance = account.getBalance();
        BigDecimal newBalance = previousBalance.add(amount);

        account.setBalance(newBalance);
        account.setUpdateDate(LocalDateTime.now());
        accountRepository.save(account);

        transferDTO.setType("incoming");
        transferDTO.setCreateDate(LocalDateTime.now());
        transferDTO.setDate(LocalDate.now());
        transferDTO.setInputPreviousBalance(previousBalance);
        transferDTO.setInputNextBalance(newBalance);

        Transfer transfer = TransferMapper.INSTANCE.toTransfer(transferDTO);
        transferRepository.save(transfer);

        return TransferMapper.INSTANCE.toTransferDTO(transfer);
    }

    public List<TransferDTO> getUserTransfers(Long id) {
        return TransferMapper.INSTANCE.toTransferDTOList(
                transferRepository.findAll()
                        .stream()
                        .filter(s -> Objects.equals(s.getAccount().getId(), id) || Objects.equals(s.getReceiverId(), id))
                        .toList()
        );
    }
}