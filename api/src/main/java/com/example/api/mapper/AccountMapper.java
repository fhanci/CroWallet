package com.example.api.mapper;

import com.example.api.dto.AccountDTO;
import com.example.api.entity.Account;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface AccountMapper {
    AccountMapper INSTANCE = Mappers.getMapper(AccountMapper.class);

    public AccountDTO toAccountDTO(Account account);

    public Account toAccount(AccountDTO accountDTO);

    public List<AccountDTO> toAccountDTOList(List<Account> accounts);

    public List<Account> toAccountList(List<AccountDTO> accountDTOS);
}
