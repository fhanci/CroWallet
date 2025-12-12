package com.crowallet.backend.repository;

import com.crowallet.backend.entity.StockMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMetadataRepository extends JpaRepository<StockMetadata, Long> {
    
    @Query("SELECT s FROM StockMetadata s WHERE LOWER(s.symbol) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<StockMetadata> searchStocks(String query);
}
