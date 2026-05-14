package com.crowallet.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.crowallet.backend.dto.MoneyAccountRequestDTO;
import com.crowallet.backend.dto.MoneyAccountResponseDTO;
import com.crowallet.backend.entity.MoneyAccount;

@Mapper(componentModel = "spring")
public interface MoneyAccountMapper {

    MoneyAccountResponseDTO toMoneyAccountResponseDTO(MoneyAccount moneyAccount);

    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    MoneyAccount toMoneyAccount(MoneyAccountRequestDTO moneyAccountRequestDTO);


    MoneyAccount toMoneyAccount(MoneyAccountResponseDTO moneyAccountResponseDTO);


    List<MoneyAccountResponseDTO> toMoneyAccountResponseDTO(List<MoneyAccount> moneyAccount);

    List<MoneyAccount> toMoneyAccount(List<MoneyAccountRequestDTO> moneyAccountRequestDTO);
    
}
