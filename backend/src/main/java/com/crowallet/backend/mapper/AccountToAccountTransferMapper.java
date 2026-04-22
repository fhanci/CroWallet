package com.crowallet.backend.mapper;

import com.crowallet.backend.dto.AccounttoAccountTransferRequestDTO;
import com.crowallet.backend.dto.AccounttoAccountTransferResponseDTO;
import com.crowallet.backend.entity.AccounttoAccountTransfer;
import org.mapstruct.Mapper;
import java.util.List;


@Mapper(componentModel = "spring", uses = {MoneyAccountMapper.class, TransferMapper.class})
public interface AccountToAccountTransferMapper {

    AccounttoAccountTransferResponseDTO toResponseDto(AccounttoAccountTransfer entity);

    AccounttoAccountTransfer toEntity(AccounttoAccountTransferRequestDTO dto);

    List<AccounttoAccountTransferResponseDTO> toResponseList(List<AccounttoAccountTransfer> entities);
    
    List<AccounttoAccountTransfer> toEntityList(List<AccounttoAccountTransferRequestDTO> dtos);
}
