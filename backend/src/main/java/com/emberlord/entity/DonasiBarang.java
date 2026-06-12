package com.emberlord.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entitas JPA untuk data Donasi Barang logistik.
 * Dipetakan ke tabel 'donasi_barang' di database.
 */
@Entity
@Table(name = "donasi_barang")
public class DonasiBarang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String namaDonatur;
    private String namaBarang;
    private Integer jumlah;
    private String statusPengiriman;

    // Konstruktor Default (diwajibkan oleh JPA)
    public DonasiBarang() {
    }

    // Konstruktor Lengkap
    public DonasiBarang(Long id, String namaDonatur, String namaBarang, Integer jumlah, String statusPengiriman) {
        this.id = id;
        this.namaDonatur = namaDonatur;
        this.namaBarang = namaBarang;
        this.jumlah = jumlah;
        this.statusPengiriman = statusPengiriman;
    }

    // Getter dan Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNamaDonatur() {
        return namaDonatur;
    }

    public void setNamaDonatur(String namaDonatur) {
        this.namaDonatur = namaDonatur;
    }

    public String getNamaBarang() {
        return namaBarang;
    }

    public void setNamaBarang(String namaBarang) {
        this.namaBarang = namaBarang;
    }

    public Integer getJumlah() {
        return jumlah;
    }

    public void setJumlah(Integer jumlah) {
        this.jumlah = jumlah;
    }

    public String getStatusPengiriman() {
        return statusPengiriman;
    }

    public void setStatusPengiriman(String statusPengiriman) {
        this.statusPengiriman = statusPengiriman;
    }
}
