package com.emberlord.repository;

import com.emberlord.entity.DonasiDana;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositori JPA untuk mengelola operasi database entitas DonasiDana.
 */
@Repository
public interface DonasiDanaRepository extends JpaRepository<DonasiDana, Long> {
}
