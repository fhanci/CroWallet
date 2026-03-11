package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crowallet.backend.entity.Asset;
import com.crowallet.backend.entity.Positions;
import java.util.List;


@Repository
public interface PositionRepository extends JpaRepository<Positions, Long> {
    List<Positions> findAllByAssetOrderByIdAsc(Asset asset);

    Positions findByAsset(Asset asset);
}
