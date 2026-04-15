package com.crowallet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crowallet.backend.entity.Asset;
import com.crowallet.backend.entity.User;

import java.util.List;


@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findAllByUser(User user);
    List<Asset> findByUser(User user);
    Asset findByAssetName(String assetName);

    List<Asset> findAllByAssetName(String assetName);

}
