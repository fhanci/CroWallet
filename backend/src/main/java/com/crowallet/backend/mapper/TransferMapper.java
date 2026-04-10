package com.crowallet.backend.mapper;

import com.crowallet.backend.dto.TransferDTO;
import com.crowallet.backend.dto.TransferResponseDTO;
import com.crowallet.backend.entity.Transfer;
import com.crowallet.backend.requests.TransferResponse;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TransferMapper {

    
    public TransferDTO toTransferDTO(Transfer transfer);

    @Mapping(source = "transferDTO.moneyAccountId", target = "moneyAccount.id")
    @Mapping(target = "isAccountToAccountTransfer", defaultValue = "false")
    public Transfer toTransfer(TransferDTO transferDTO);

    @Mapping(source = "transfer.moneyAccount.id", target = "moneyAccountId")
    @Mapping(source = "transfer.id", target = "transferId")
    public TransferResponseDTO toTransferResponseDTO(Transfer transfer);

    public List<TransferResponseDTO> toTransferResponseDTOList(List<Transfer> transfers);

    public List<Transfer> toTransferList(List<TransferDTO> transferDTOS);

    public List<TransferDTO> toTransferDTOList(List<Transfer> transfers);

}
