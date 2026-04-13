package com.crowallet.backend.service;

import com.crowallet.backend.dto.AccounttoAccountTransferRequestDTO;
import com.crowallet.backend.dto.AccounttoAccountTransferResponseDTO;
import com.crowallet.backend.dto.MoneyAccountRequestDTO;
import com.crowallet.backend.dto.TransferDTO;
import com.crowallet.backend.dto.TransferResponseDTO;
import com.crowallet.backend.entity.Account;
import com.crowallet.backend.entity.AccounttoAccountTransfer;
import com.crowallet.backend.entity.MoneyAccount;
import com.crowallet.backend.mapper.AccountMapper;
import com.crowallet.backend.mapper.AccountToAccountTransferMapper;
import com.crowallet.backend.mapper.TransferMapper;
import com.crowallet.backend.mapper.UserMapper;
import com.crowallet.backend.repository.AccountRepository;
import com.crowallet.backend.repository.AccounttoAccountTransferRepository;
import com.crowallet.backend.repository.MoneyAccountRepository;
import jakarta.transaction.Transactional;
import lombok.experimental.var;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import com.crowallet.backend.comman.GeneralException;
import com.crowallet.backend.entity.Transfer;
import com.crowallet.backend.entity.User;
import com.crowallet.backend.repository.TransferRepository;
import com.crowallet.backend.repository.UserRepository;
import com.crowallet.backend.security.CustomUserDetails;

@Service
public class TransferService {
    private final MoneyAccountRepository moneyAccountRepository;
    private final TransferRepository transferRepository;
    private final UserRepository userRepository;
    private final AccounttoAccountTransferRepository accountToAccountTransferRepository;
    private final AccountToAccountTransferMapper accountToAccountTransferMapper;
    private final TransferMapper transferMapper;

    public TransferService(TransferRepository transferRepository, AccountToAccountTransferMapper accountToAccountTransferMapper, AccounttoAccountTransferRepository accountToAccountTransferRepository, TransferMapper transferMapper, UserRepository userRepository, MoneyAccountRepository moneyAccountRepository) {
        this.transferRepository = transferRepository;
        this.accountToAccountTransferMapper = accountToAccountTransferMapper;
        this.accountToAccountTransferRepository = accountToAccountTransferRepository;
        this.transferMapper = transferMapper;
        this.userRepository = userRepository;
        this.moneyAccountRepository = moneyAccountRepository;
    }

    @Transactional
    public TransferResponseDTO createTransfer(TransferDTO transferDTO) {

        //İlgili para hesabını bul
        Long moneyAccountId = transferDTO.getMoneyAccountId();
        MoneyAccount moneyAccount = moneyAccountRepository.findById(moneyAccountId)
                .orElseThrow(() -> new GeneralException("Money account not found: " + moneyAccountId));

        //User bilgilerini güvenlik bağlamından al
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        //Transfer nesnesini oluştur
        Transfer transfer = transferMapper.toTransfer(transferDTO);
        transfer.setMoneyAccount(moneyAccount);
        transfer.setUser(user);
        transferRepository.save(transfer);
        return transferMapper.toTransferResponseDTO(transfer);
    }

    @Transactional
    public List<TransferResponseDTO> getUserAllTransfers(Long userId) {

        // User bilgilerini güvenlik bağlamından al
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Kullanıcının tüm transferlerini al
        List<Transfer> transfers = transferRepository.findByUser(user);
        return transferMapper.toTransferResponseDTOList(transfers);
    }


    @Transactional
    public AccounttoAccountTransferResponseDTO createAccountToAccountTransfer(AccounttoAccountTransferRequestDTO transferDTO) {

        // İlgili hesapları ve transferi bul
        Long senderId = transferDTO.getSenderAccount().getId();
        Long receiverId = transferDTO.getReceiverAccount().getId();
        Long transferId = transferDTO.getTransfer().getTransferId();

        // Veritabanından ilgili hesapları ve transferi bul
        MoneyAccount senderAccount = moneyAccountRepository.findById(senderId)
                .orElseThrow(() -> new GeneralException("Sender account not found: " + senderId));
        MoneyAccount receiverAccount = moneyAccountRepository.findById(receiverId)
                .orElseThrow(() -> new GeneralException("Receiver account not found: " + receiverId));
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new GeneralException("Transfer not found: " + transferId));

        // Yeni AccounttoAccountTransfer nesnesi oluştur ve ilişkileri ayarla
        AccounttoAccountTransfer accountToAccountTransfer = new AccounttoAccountTransfer();
        accountToAccountTransfer.setSenderAccount(senderAccount);
        accountToAccountTransfer.setReceiverAccount(receiverAccount);
        accountToAccountTransfer.setTransfer(transfer);

        // Hesaplar arasındaki transferi gerçekleştir
        AccounttoAccountTransfer savedTransfer = accountToAccountTransferRepository.save(accountToAccountTransfer);
        return accountToAccountTransferMapper.toResponseDto(savedTransfer);
    }

    // public List<TransferDTO> getAllTransfers() {
    //     return TransferMapper.INSTANCE.toTransferDTOList(transferRepository.findAll());
    // }

    // public TransferDTO getTransferById(Long id) {
    //     return TransferMapper.INSTANCE.toTransferDTO(transferRepository.findById(id)
    //             .orElseThrow(() -> new GeneralException("Transfer not found: " + id)));
    // }

    // public TransferDTO updateTransfer(Long id, TransferDTO updatedTransfer) {
    //     Transfer existingTransfer = transferRepository.findById(id)
    //             .orElseThrow(() -> new GeneralException("Transfer to be updated not found: " + id));

    //     existingTransfer.setCategory(updatedTransfer.getCategory());
    //     existingTransfer.setAmount(updatedTransfer.getAmount());
    //     existingTransfer.setDate(updatedTransfer.getDate());
    //     existingTransfer.setCreateDate(updatedTransfer.getCreateDate());
    //     existingTransfer.setDescription(updatedTransfer.getDescription());
    //     existingTransfer.setReceiverId(updatedTransfer.getReceiverId());
    //     existingTransfer.setType(updatedTransfer.getType());
    //     existingTransfer.setDetails(updatedTransfer.getDetails());
    //     existingTransfer.setExchangeRate(updatedTransfer.getExchangeRate());
    //     existingTransfer.setUser(UserMapper.INSTANCE.toUser(updatedTransfer.getUser()));
    //     existingTransfer.setAccount(AccountMapper.INSTANCE.toAccount(updatedTransfer.getAccount()));

    //     return TransferMapper.INSTANCE.toTransferDTO(transferRepository.save(existingTransfer));
    // }

    // public void deleteTransfer(Long id) {
    //     if (!transferRepository.existsById(id)) {
    //         throw new GeneralException("Transfer to be deleted not found: " + id);
    //     }
    //     transferRepository.deleteById(id);
    // }

    // @Transactional
    // public TransferDTO addMoney(TransferDTO transferDTO) {
    //     Account account = accountRepository.findById(transferDTO.getMoneyAccountDTO().getAccountName())
    //             .orElseThrow(() -> new GeneralException("Hesap bulunamadı"));

    //     BigDecimal amount = transferDTO.getAmount();
    //     BigDecimal previousBalance = account.getBalance();
    //     BigDecimal newBalance = previousBalance.add(amount);

    //     account.setBalance(newBalance);
    //     account.setUpdateDate(LocalDateTime.now());
    //     accountRepository.save(account);

    //     transferDTO.setType("incoming");
    //     transferDTO.setCreateDate(LocalDateTime.now());
    //     transferDTO.setDate(LocalDate.now());
    //     transferDTO.setInputPreviousBalance(previousBalance);
    //     transferDTO.setInputNextBalance(newBalance);

    //     Transfer transfer = TransferMapper.INSTANCE.toTransfer(transferDTO);
    //     transferRepository.save(transfer);

    //     return TransferMapper.INSTANCE.toTransferDTO(transfer);
    // }

    @Transactional
    public List<TransferResponseDTO> getUserTransfersByMoneyAccount(Long id) {
        // İlgili para hesabını bul
        MoneyAccount moneyAccount = moneyAccountRepository.findById(id).orElseThrow(() -> new RuntimeException("Money account not found: " + id));

        // Transfer nesnelerini para hesabına göre bul
        List<Transfer> transfers = transferRepository.findByMoneyAccount(moneyAccount);
        return transferMapper.toTransferResponseDTOList(transfers);
    }


    @Transactional
    public Map<String, Long> getAccountToAccountTransfer(Long transferId) {
        Transfer transfer = transferRepository.findById(transferId).orElseThrow(() -> new RuntimeException("Transfer not found: " + transferId));
        List<AccounttoAccountTransfer> accountToAccountTransfers = accountToAccountTransferRepository.findByTransfer(transfer);
        Map<String, Long> result = new HashMap<>();
        if (!accountToAccountTransfers.isEmpty()) {
            result.put("senderAccount", accountToAccountTransfers.get(0).getSenderAccount().getId());
            result.put("receiverAccount", accountToAccountTransfers.get(0).getReceiverAccount().getId());
        }
        result.put("hasAccountToAccountTransfer", accountToAccountTransfers.isEmpty() ? 0L : 1L);
        return result;
    }
}