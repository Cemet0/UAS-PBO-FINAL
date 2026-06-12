package com.emberlord.repository;

import com.emberlord.entity.Korban;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositori JPA untuk mengelola operasi database entitas Korban.
 */
@Repository
public interface KorbanRepository extends JpaRepository<Korban, Long> {
}
