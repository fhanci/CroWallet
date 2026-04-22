package com.crowallet.backend;

import java.sql.Connection;
import java.sql.Statement;

import javax.sql.DataSource;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "AuditorAwareBean")
public class ApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiApplication.class, args);
	}

	@Bean
	public CommandLineRunner init(DataSource dataSource) {
		return args -> {
			try (
				Connection conn = dataSource.getConnection();
				Statement stmt = conn.createStatement()) {
					stmt.execute("PRAGMA journal_mode=DELETE");
				}			
			
		};

	}
}
