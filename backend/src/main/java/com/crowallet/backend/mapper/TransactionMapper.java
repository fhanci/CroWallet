package com.crowallet.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.crowallet.backend.dto.TransactionDTO;
import com.crowallet.backend.entity.Transactions;


@Mapper(componentModel = "spring")
public interface TransactionMapper {

    @Mapping(source = "assetId", target = "asset.id")
    Transactions toTransaction(TransactionDTO transactionDTO);

    // Entity -> DTO
    @Mapping(source = "asset.id", target = "assetId")
    TransactionDTO toTransactionDTO(Transactions transaction);
}