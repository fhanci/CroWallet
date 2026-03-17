package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crowallet.backend.entity.Asset;
import com.crowallet.backend.entity.Positions;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface PositionRepository extends JpaRepository<Positions, Long> {
    List<Positions> findAllByAssetOrderByIdAsc(Asset asset);

    List<Positions> findAllByAsset(Asset asset);

    List<Positions> findAllByAssetOrderByCreatedDateAsc(Asset asset);

    List <Positions> findAllByAssetAndCreatedDateGreaterThanEqual(Asset asset, LocalDateTime date);

    Positions findByAsset(Asset asset);
}
