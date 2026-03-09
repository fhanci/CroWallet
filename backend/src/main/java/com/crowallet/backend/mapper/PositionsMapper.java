package com.crowallet.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import com.crowallet.backend.dto.PositionDTO;
import com.crowallet.backend.entity.Positions;

@Mapper(componentModel = "spring")
public interface PositionsMapper {
    
    PositionsMapper INSTANCE = Mappers.getMapper(PositionsMapper.class);

    @Mapping(source = "assetId", target = "asset.id")
    Positions toPosition(PositionDTO positionDTO);

    @Mapping(source = "asset.id", target = "assetId")
    PositionDTO toPositionDTO(Positions position);
}
