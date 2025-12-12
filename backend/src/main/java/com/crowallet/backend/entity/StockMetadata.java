package com.crowallet.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "stock_metadata")
@Data
public class StockMetadata {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String symbol; // e.g., "THYAO.IS"

    private String name; // e.g., "Turk Hava Yollari"

    private String type; // e.g., "Stock", "ETF"
}
