package com.emberlord.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entitas JPA untuk data Donasi Dana Tunai.
 * Dipetakan ke tabel 'donasi_dana' di database.
 */
@Entity
@Table(name = "donasi_dana")
public class DonasiDana {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String namaDonatur;
    private Double jumlahDana;
    private String metodePembayaran;
    private String statusTransaksi;
    private String noRekeningHp;
    private String peruntukanDana;

    // Konstruktor Default (diwajibkan oleh JPA)
    public DonasiDana() {
    }

    // Konstruktor Lengkap
    public DonasiDana(Long id, String namaDonatur, Double jumlahDana, String metodePembayaran, String statusTransaksi, String noRekeningHp, String peruntukanDana) {
        this.id = id;
        this.namaDonatur = namaDonatur;
        this.jumlahDana = jumlahDana;
        this.metodePembayaran = metodePembayaran;
        this.statusTransaksi = statusTransaksi;
        this.noRekeningHp = noRekeningHp;
        this.peruntukanDana = peruntukanDana;
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

    public Double getJumlahDana() {
        return jumlahDana;
    }

    public void setJumlahDana(Double jumlahDana) {
        this.jumlahDana = jumlahDana;
    }

    public String getMetodePembayaran() {
        return metodePembayaran;
    }

    public void setMetodePembayaran(String metodePembayaran) {
        this.metodePembayaran = metodePembayaran;
    }

    public String getStatusTransaksi() {
        return statusTransaksi;
    }

    public void setStatusTransaksi(String statusTransaksi) {
        this.statusTransaksi = statusTransaksi;
    }

    public String getNoRekeningHp() {
        return noRekeningHp;
    }

    public void setNoRekeningHp(String noRekeningHp) {
        this.noRekeningHp = noRekeningHp;
    }

    public String getPeruntukanDana() {
        return peruntukanDana;
    }

    public void setPeruntukanDana(String peruntukanDana) {
        this.peruntukanDana = peruntukanDana;
    }
}
