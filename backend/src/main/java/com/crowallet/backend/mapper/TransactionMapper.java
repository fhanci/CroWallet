package com.crowallet.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import com.crowallet.backend.dto.TransactionDTO;
import com.crowallet.backend.entity.Transactions;


@Mapper(componentModel = "spring")
public interface TransactionMapper {

    TransactionMapper INSTANCE = Mappers.getMapper(TransactionMapper.class);

    @Mapping(source = "assetId", target = "asset.id")
    @Mapping(target = "totalValue", expression = "java(transactionDTO.getUnitPrice().multiply(transactionDTO.getQuantity()))")
    @Mapping(source = "buyingDateTime", target = "buyingDateTime")
    Transactions toTransaction(TransactionDTO transactionDTO);

    
    @Mapping(source = "asset.id", target = "assetId")
    TransactionDTO toTransactionDTO(Transactions transaction);


    List<Transactions> toTransactionList(List<TransactionDTO> transactionDTOList);
    List<TransactionDTO> toTransactionDTOList(List<Transactions> transactionDTOList);

}