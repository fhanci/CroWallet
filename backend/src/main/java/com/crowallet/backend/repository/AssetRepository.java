package com.crowallet.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.crowallet.backend.entity.Asset;

public interface AssetRepository extends JpaRepository<Asset,Long>{

}
