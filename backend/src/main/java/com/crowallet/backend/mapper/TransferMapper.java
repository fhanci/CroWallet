package com.crowallet.backend.mapper;

import com.crowallet.backend.dto.TransferDTO;
import com.crowallet.backend.entity.Transfer;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface TransferMapper {
    TransferMapper INSTANCE = Mappers.getMapper(TransferMapper.class);

    public TransferDTO toTransferDTO(Transfer transfer);

    public Transfer toTransfer(TransferDTO transferDTO);

    public List<Transfer> toTransferList(List<TransferDTO> transferDTOS);

    public List<TransferDTO> toTransferDTOList(List<Transfer> transfers);

}
