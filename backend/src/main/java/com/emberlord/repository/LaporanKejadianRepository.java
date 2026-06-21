package com.emberlord.repository;

import com.emberlord.entity.LaporanKejadian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositori JPA untuk mengelola operasi database entitas LaporanKejadian.
 */
@Repository
public interface LaporanKejadianRepository extends JpaRepository<LaporanKejadian, Long> {
}
