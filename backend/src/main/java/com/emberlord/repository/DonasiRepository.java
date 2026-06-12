package com.emberlord.repository;

import com.emberlord.entity.DonasiBarang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositori JPA untuk mengelola operasi database entitas DonasiBarang.
 */
@Repository
public interface DonasiRepository extends JpaRepository<DonasiBarang, Long> {
}
