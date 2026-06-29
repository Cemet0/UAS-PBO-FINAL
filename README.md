# EmberLord Emergency Portal

**EmberLord** adalah portal taktis manajemen logistik, tanggap darurat, dan koordinasi bantuan kebencanaan secara _real-time_. Dengan tampilan antarmuka bertema gelap (_tactical dark mode_) yang premium dan dinamis, aplikasi ini mengintegrasikan frontend berbasis _Single Page Application (SPA)_ dengan backend REST API Java Spring Boot, JPA, dan basis data MySQL.

---

## Daftar Isi

- [Prasyarat](#prasyarat)
- [Konfigurasi Environment (.env)](#konfigurasi-environment-env)
- [Cara Menjalankan Aplikasi](#cara-menjalankan-aplikasi)
- [Fitur Utama](#fitur-utama-aplikasi)
- [Arsitektur & Teknologi Stack](#arsitektur--teknologi-stack)
- [Struktur Proyek](#struktur-proyek)
- [API Endpoints](#api-endpoints)
- [EmberBot Chatbot](#emberbot-chatbot)
- [Troubleshooting](#troubleshooting)

---

## Prasyarat

Sebelum menjalankan aplikasi, pastikan lingkungan Anda memiliki:

- **Java 17+** — [Download JDK 17](https://adoptium.net/)
- **Maven 3.8+** — [Download Maven](https://maven.apache.org/download.cgi)
- **MySQL Server** (atau DBMS MySQL seperti Laragon / XAMPP)
- **Browser modern** (Chrome, Firefox, Edge)
- **(Opsional) LLM Provider** — Salah satu dari:
  - **Ollama** untuk berjalan secara lokal/offline ([Download Ollama](https://ollama.com/))
  - **Google Gemini API Key**
  - **OpenAI API Key**
  - **GitHub Personal Access Token** (untuk GitHub Models API)

---

## Konfigurasi Environment (.env)

Aplikasi ini menggunakan integrasi dinamis di mana backend Spring Boot akan membaca berkas `.env` saat dijalankan, lalu menyajikan konfigurasi tersebut secara aman ke frontend melalui endpoint `/api/env-config.js`.

### 1. Salin dan Sesuaikan `.env`

Salin `.env.example` ke `.env` di **root proyek** lalu sesuaikan nilainya:

```bash
cp .env.example .env
```

### Variabel yang Tersedia di `.env`

| Kategori | Variabel | Default | Deskripsi |
|---|---|---|---|
| **Server** | `SERVER_PORT` | `8080` | Port backend Spring Boot |
| **Database** | `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/db_emberlord?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true` | JDBC URL database MySQL |
| | `SPRING_DATASOURCE_USERNAME` | `root` | Username database |
| | `SPRING_DATASOURCE_PASSWORD` | _(kosong)_ | Password database |
| **JPA / DDL** | `SPRING_JPA_DDL_AUTO` | `update` | Mode DDL Hibernate |
| | `SPRING_JPA_SHOW_SQL` | `true` | Tampilkan query SQL di log |
| **Upload** | `MAX_FILE_SIZE` | `15MB` | Maksimal ukuran file upload laporan |
| | `MAX_REQUEST_SIZE` | `15MB` | Maksimal ukuran request payload |
| **Chatbot** | `LLM_PROVIDER` | `ollama` | Provider LLM (`ollama` \| `openai` \| `gemini` \| `github`) |
| | `OLLAMA_API_URL` | `http://localhost:11434/v1/chat/completions` | Endpoint API Ollama lokal |
| | `OLLAMA_MODEL` | `llama3.2` | Model Ollama yang digunakan |
| | `OPENAI_API_KEY` | _(kosong)_ | API Key untuk OpenAI |
| | `OPENAI_MODEL` | `gpt-4o-mini` | Model OpenAI yang digunakan |
| | `GEMINI_API_KEY` | _(kosong)_ | API Key untuk Google Gemini |
| | `GEMINI_MODEL` | `gemini-2.5-flash` | Model Gemini yang digunakan |
| | `GITHUB_TOKEN` | _(kosong)_ | Token API untuk GitHub Models |
| | `GITHUB_MODEL` | `gpt-4o-mini` | Model GitHub yang digunakan |
| | `GITHUB_API_URL` | `https://models.inference.ai.azure.com/...` | Endpoint API GitHub Models |
| **Frontend** | `API_BASE_URL` | `http://localhost:8080/api` | Base URL REST API backend |

---

## Cara Menjalankan Aplikasi

### Langkah 1: Persiapan Database MySQL

Pastikan MySQL Server Anda aktif dan buat database baru bernama `db_emberlord`:

```sql
CREATE DATABASE db_emberlord;
```

### Langkah 2: Jalankan Server Backend (Spring Boot)

Buka terminal di root proyek, masuk ke direktori backend, lalu jalankan Maven:

```bash
cd backend
mvn spring-boot:run
```

Atau buka proyek di IDE (VS Code / IntelliJ) dan jalankan kelas utama `com.emberlord.EmberLordApplication`.

Backend akan aktif di **`http://localhost:8080`** (atau port lain sesuai variabel `SERVER_PORT`).

### Langkah 3: Buka Antarmuka Frontend


Frontend berupa *Single Page Application* statis. Buka `frontend/index.html` menggunakan server lokal untuk menghindari isu pemuatan resource.

Sangat direkomendasikan menggunakan **Live Server** di VS Code (klik kanan `index.html` > **Open with Live Server**) atau jalankan melalui Python/Node.js di direktori `frontend`:

```bash
# Menggunakan Python
cd frontend
python -m http.server 5500

# Menggunakan Node.js (npx)
cd frontend
npx serve .
```

Akses aplikasi di browser melalui **`http://localhost:5500`** atau port yang diberikan.


---

## Fitur Utama Aplikasi

### 1. Peta Zona Bahaya & Posko Evakuasi
- **Peta Interaktif (Leaflet JS)**: Visualisasi spasial zona bahaya api (_danger zone_) dan posko aman terdekat secara _real-time_.
- **Kontrol Peta Kustom**: Zoom, ganti tipe peta (Satelit / Roadmap), fokus lokasi berbasis GPS perangkat.
- **Kapasitas Posko**: Status sisa kapasitas (_Leluasa, Normal, Hampir Penuh_).

### 2. Portal Donasi Terbuka
- **Donasi Barang Fisik**: Registrasi komitmen donasi logistik, pelacakan status pengiriman (_Pending, Dikirim, Diterima, Diproses_), pencarian cepat & CRUD terintegrasi.
- **Donasi Dana Tunai**: Form input donasi, pencatatan peruntukan dana, nomor rekening/HP pengirim.
- **Buku Kas Digital**: Saldo kas total ter-update otomatis saat status transaksi **Berhasil** (_Verified_).

### 3. Pusat Pemulihan Dokumen Korban
- **Wizard Pendaftaran Profil Korban**: Perekaman identitas (Nama, NIK, No. KK, Alamat Asal, Kelompok Rentan, Status Rumah).
- **Manajemen Profil**: Riwayat terintegrasi penuh dengan CRUD REST API, pencarian global berdasarkan NIK atau Nama.

### 4. Hotline Pengaduan & Bantuan Darurat
- **Tombol Darurat SOS**: Simulasi pengiriman koordinat GPS darurat ke BASARNAS/Ambulans.
- **Hotline Kontak Taktis**: Damkar (113), Ambulans (118/119), BASARNAS.
- **Lapor Kejadian Baru**: Formulir laporan dengan atribut lokasi, kondisi, estimasi korban, **unggah foto** (_Drag & Drop_, konversi Base64).
- **Status Laporan**: Tabel dinamis dengan dot status (merah/biru/hijau) dan modal detail lengkap.

### 5. EmberBot Chatbot Widget
- AI chatbot taktis di pojok kanan bawah untuk informasi posko terdekat, logistik, prosedur dokumen, dan tips keselamatan.
- Mendukung integrasi dinamis dengan **Ollama**, **Google Gemini**, **OpenAI**, dan **GitHub Models**.

---

## Arsitektur & Teknologi Stack

### Backend
| Teknologi | Keterangan |
|---|---|
| **Java 17 / Spring Boot 3.2+** | Framework REST API modular |
| **Spring Data JPA & Hibernate** | ORM ke basis data |
| **MySQL Database** | Basis data relasional utama |
| **Maven** | Manajemen dependensi |

### Frontend
| Teknologi | Keterangan |
|---|---|
| **Vanilla HTML5 & CSS3** | Struktur semantik, desain kustom responsif (_tactical dark theme_) |
| **Vanilla JavaScript (ES6)** | State global, DOM manipulation, SPA router, Fetch API |
| **Leaflet.js** | Peta interaktif |
| **FontAwesome** | Paket ikon |
| **jsPDF & AutoTable** | Ekspor laporan PDF |

---

## Struktur Proyek

```
├── .env.example              # Contoh konfigurasi environment
├── .env                      # File konfigurasi lokal (di-ignore oleh git)
├── .gitignore
├── README.md
│
├── backend/                  # Backend Spring Boot (Maven)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/emberlord/
│       │   ├── EmberLordApplication.java
│       │   ├── controller/       # REST & Config Controllers
│       │   │   ├── ConfigController.java         # Endpoint konfigurasi dinamis
│       │   │   ├── DonasiController.java         # Donasi Barang
│       │   │   ├── DonasiDanaController.java     # Donasi Dana & Buku Kas
│       │   │   ├── GlobalExceptionHandler.java   # Exception Handler global
│       │   │   ├── KorbanController.java         # Pemulihan Dokumen/Korban
│       │   │   └── LaporanKejadianController.java # Laporan Kejadian / SOS
│       │   ├── entity/           # JPA Entities
│       │   │   ├── DonasiBarang.java
│       │   │   ├── DonasiDana.java
│       │   │   ├── Korban.java
│       │   │   └── LaporanKejadian.java
│       │   └── repository/       # JPA Repositories
│       │       ├── DonasiRepository.java
│       │       ├── DonasiDanaRepository.java
│       │       ├── KorbanRepository.java
│       │       └── LaporanKejadianRepository.java
│       └── resources/
│           └── application.properties
│
└── frontend/                 # Frontend SPA
    ├── index.html
    ├── config.js             # Konfigurasi frontend default
    ├── app.js                # Logika utama SPA & Integrasi API / Chatbot
    └── styles.css            # Tema tactical dark mode & tata letak
```

---

## API Endpoints

Semua endpoint berada di bawah `http://localhost:8080/api/` dengan CORS `*`.

### Konfigurasi Dinamis
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/env-config.js` | Mengambil konfigurasi environment dari `.env` backend dalam format JavaScript untuk dioverride ke frontend secara otomatis |

### Donasi Barang (`/api/donasi`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/donasi` | Tambah donasi baru |
| `GET` | `/api/donasi` | Ambil semua donasi |
| `GET` | `/api/donasi/{id}` | Ambil donasi by ID |
| `PUT` | `/api/donasi/{id}` | Update donasi |
| `DELETE` | `/api/donasi/{id}` | Hapus donasi |

### Donasi Dana (`/api/donasi-dana`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/donasi-dana` | Tambah donasi dana baru |
| `GET` | `/api/donasi-dana` | Ambil semua donasi dana |
| `GET` | `/api/donasi-dana/{id}` | Ambil donasi dana by ID |
| `PUT` | `/api/donasi-dana/{id}` | Update donasi dana |
| `DELETE` | `/api/donasi-dana/{id}` | Hapus donasi dana |

### Korban (`/api/korban`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/korban` | Tambah profil korban baru |
| `GET` | `/api/korban` | Ambil semua profil korban |
| `GET` | `/api/korban/{id}` | Ambil profil korban by ID |
| `PUT` | `/api/korban/{id}` | Update profil korban |
| `DELETE` | `/api/korban/{id}` | Hapus profil korban |

### Laporan Kejadian (`/api/laporan-kejadian`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/laporan-kejadian` | Tambah laporan baru |
| `GET` | `/api/laporan-kejadian` | Ambil semua laporan |
| `GET` | `/api/laporan-kejadian/{id}` | Ambil laporan by ID |
| `PUT` | `/api/laporan-kejadian/{id}` | Update laporan |
| `DELETE` | `/api/laporan-kejadian/{id}` | Hapus laporan |

---

## EmberBot Chatbot

EmberBot berjalan langsung di sisi frontend, namun konfigurasinya dinamis disuntikkan dari backend `.env`. Di bawah ini adalah langkah persiapan masing-masing provider:

### Opsi 1: Ollama Lokal (Gratis & Offline)
1. **Instal Ollama**: Unduh dari [ollama.com](https://ollama.com/).
2. **Download Model**: Jalankan perintah berikut di terminal:
   ```bash
   ollama pull llama3.2
   ```
3. **Izinkan CORS**: Karena frontend dipanggil dari browser (port/origin berbeda), CORS Ollama harus diizinkan:
   * **Windows**:
     * Buka **System Properties** → **Environment Variables**.
     * Tambah **User/System Variable** baru: `OLLAMA_ORIGINS` dengan nilai `*`.
     * Restart Ollama dari system tray (Quit lalu jalankan lagi).
   * **Mac / Linux**:
     ```bash
     export OLLAMA_ORIGINS=*
     ollama serve
     ```
4. Set variabel di `.env`:
   ```properties
   LLM_PROVIDER=ollama
   OLLAMA_API_URL=http://localhost:11434/v1/chat/completions
   OLLAMA_MODEL=llama3.2
   ```

### Opsi 2: Google Gemini (Online)
1. Dapatkan API Key Gemini.
2. Set variabel di `.env`:
   ```properties
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   GEMINI_MODEL=gemini-2.5-flash
   ```

### Opsi 3: OpenAI (Online)
1. Dapatkan API Key OpenAI.
2. Set variabel di `.env`:
   ```properties
   LLM_PROVIDER=openai
   OPENAI_API_KEY=YOUR_OPENAI_API_KEY
   OPENAI_MODEL=gpt-4o-mini
   ```

### Opsi 4: GitHub Models API (Online)
1. Dapatkan token dari [GitHub Developer Settings](https://github.com/settings/tokens).
2. Set variabel di `.env`:
   ```properties
   LLM_PROVIDER=github
   GITHUB_TOKEN=YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
   GITHUB_MODEL=gpt-4o-mini
   GITHUB_API_URL=https://models.inference.ai.azure.com/chat/completions
   ```

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| **Port 8080 sudah digunakan** | Sesuaikan port dengan menyetel `SERVER_PORT=8085` (atau port lain) di `.env`. Pastikan frontend memanggil URL backend yang sesuai. |
| **Koneksi database error / Access Denied** | Pastikan MySQL Server aktif, kredensial (`SPRING_DATASOURCE_USERNAME` dan `SPRING_DATASOURCE_PASSWORD`) di `.env` sudah benar, dan database `db_emberlord` telah dibuat (`CREATE DATABASE db_emberlord;`). |
| **Foto tidak terupload** | Periksa ukuran file (maksimal 15MB sesuai setting `MAX_FILE_SIZE`). |
| **Chatbot tidak merespons (Ollama)** | Pastikan Ollama sudah berjalan (`ollama serve`), pastikan environment variable `OLLAMA_ORIGINS=*` sudah aktif, dan buka frontend via live server (bukan `file://`). |
| **Chatbot API Authorization Error** | Periksa kecocokan API Key/Token di `.env` untuk masing-masing provider yang dipilih. |

---

## Lisensi

Proyek ini dikembangkan untuk tujuan edukasi mata kuliah **Pemrograman Berorientasi Objek (PBO)**.

