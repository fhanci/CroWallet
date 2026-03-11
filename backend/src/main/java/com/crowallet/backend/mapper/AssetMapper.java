package com.crowallet.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.crowallet.backend.dto.AssetDTO;
import com.crowallet.backend.entity.Asset;

@Mapper(componentModel = "spring")
public interface AssetMapper {
    AssetMapper INSTANCE = Mappers.getMapper(AssetMapper.class);

    Asset toAsset(AssetDTO assetDTO);

    AssetDTO toAssetDTO(Asset asset);
    
}
