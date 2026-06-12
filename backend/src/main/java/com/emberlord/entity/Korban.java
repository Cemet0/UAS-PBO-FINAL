package com.emberlord.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entitas JPA untuk data profil Korban bencana.
 * Dipetakan ke tabel 'korban' di database.
 */
@Entity
@Table(name = "korban")
public class Korban {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nama;
    private String NIK;
    private String nomorKK;
    private String kelompokRentan;
    private String statusRumah;
    private String alamatAsal;

    // Konstruktor Default (diwajibkan oleh JPA)
    public Korban() {
    }

    // Konstruktor Lengkap
    public Korban(Long id, String nama, String NIK, String nomorKK, String kelompokRentan, String statusRumah, String alamatAsal) {
        this.id = id;
        this.nama = nama;
        this.NIK = NIK;
        this.nomorKK = nomorKK;
        this.kelompokRentan = kelompokRentan;
        this.statusRumah = statusRumah;
        this.alamatAsal = alamatAsal;
    }

    // Getter dan Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNama() {
        return nama;
    }

    public void setNama(String nama) {
        this.nama = nama;
    }

    public String getNIK() {
        return NIK;
    }

    public void setNIK(String NIK) {
        this.NIK = NIK;
    }

    public String getNomorKK() {
        return nomorKK;
    }

    public void setNomorKK(String nomorKK) {
        this.nomorKK = nomorKK;
    }

    public String getKelompokRentan() {
        return kelompokRentan;
    }

    public void setKelompokRentan(String kelompokRentan) {
        this.kelompokRentan = kelompokRentan;
    }

    public String getStatusRumah() {
        return statusRumah;
    }

    public void setStatusRumah(String statusRumah) {
        this.statusRumah = statusRumah;
    }

    public String getAlamatAsal() {
        return alamatAsal;
    }

    public void setAlamatAsal(String alamatAsal) {
        this.alamatAsal = alamatAsal;
    }
}
