/* ==========================================================================
   LOGIKA CLIENT-SIDE EMBERLORD (SPA & INTEGRASI CRUD REST API BACKEND)
   Bahasa Komentar: Bahasa Indonesia
   ========================================================================== */

// Konfigurasi Endpoint REST API Java Spring Boot (lihat config.js)
const API_BASE_URL = (typeof CONFIG !== 'undefined') ? CONFIG.API_BASE_URL : 'http://localhost:8080/api';

// State global aplikasi
let currentEditingDonasiId = null;
let currentEditingDonasiDanaId = null;
let currentEditingKorbanId = null;

// Cache data global untuk filtering, searching, dan ekspor
let listKorban = [];
let listDonasiBarang = [];
let listDonasiDana = [];
let listLaporan = [];

// Data Kebutuhan Logistik Lengkap Mock
const LIST_LOGISTIK_LENGKAP = [
    { nama: "Popok Bayi (Pack)", target: 50, terpenuhi: 35, posko: "Posko Sektor A (Pengungsian Balita)", prioritas: "Tinggi" },
    { nama: "Selimut Hangat", target: 100, terpenuhi: 40, posko: "Sektor C (Lansia)", prioritas: "Tinggi" },
    { nama: "Paket Sembako Ready-to-Eat", target: 200, terpenuhi: 170, posko: "Posko Induk (Relawan)", prioritas: "Sedang" },
    { nama: "Tenda Darurat Keluarga", target: 15, terpenuhi: 3, posko: "Sektor B", prioritas: "Kritis" },
    { nama: "Masker N95 (Box)", target: 80, terpenuhi: 80, posko: "Posko Sektor A & B", prioritas: "Selesai" },
    { nama: "Obat-obatan / Parasetamol (Box)", target: 40, terpenuhi: 10, posko: "Posko Medis Sektor B", prioritas: "Tinggi" },
    { nama: "Air Mineral (Dus)", target: 500, terpenuhi: 450, posko: "Semua Posko Evakuasi", prioritas: "Tinggi" },
    { nama: "Susu Bayi & Balita (Kaleng)", target: 60, terpenuhi: 20, posko: "Posko Sektor A", prioritas: "Tinggi" },
    { nama: "Pakaian Layak Pakai (Paket)", target: 150, terpenuhi: 150, posko: "Balai Desa", prioritas: "Selesai" },
    { nama: "Kasur Lipat", target: 80, terpenuhi: 30, posko: "GOR Pemuda & Balai Desa", prioritas: "Tinggi" },
    { nama: "Alat Mandi / Sabun & Pasta Gigi", target: 120, terpenuhi: 60, posko: "Semua Posko Evakuasi", prioritas: "Sedang" }
];

// Variabel Global Peta Leaflet
let map = null;
let currentTileLayer = null;
let userGpsMarker = null;
let userGpsCircle = null;
let currentLayerType = 'roadmap'; // 'roadmap' atau 'satellite'

// Elemen DOM saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    initSPARouter();
    initAuthModal();
    initChatbot();
    initSOSButton();
    initMap();
    initDonationTabs();
    initIncidentPhotoUpload();
    initLaporanDetailModal();
    initLogistikModal(); // Inisialisasi modal logistik lengkap

    // Muat data awal dari API backend
    fetchDonasi();
    fetchDonasiDana();
    fetchKorban();
    fetchLaporan();

    // Event handler untuk form submit CRUD
    document.getElementById('form-donasi').addEventListener('submit', handleDonasiSubmit);
    document.getElementById('form-donasi-dana').addEventListener('submit', handleDonasiDanaSubmit);
    document.getElementById('form-korban').addEventListener('submit', handleKorbanSubmit);
    document.getElementById('form-laporan-kejadian').addEventListener('submit', handleLaporanKejadianSubmit);

    // Event listener untuk tombol muat ulang data
    document.getElementById('btn-refresh-donasi').addEventListener('click', fetchDonasi);
    document.getElementById('btn-refresh-donasi-dana').addEventListener('click', fetchDonasiDana);
    document.getElementById('btn-refresh-korban').addEventListener('click', fetchKorban);

    // Batalkan pengeditan
    document.getElementById('btn-cancel-edit-donasi').addEventListener('click', cancelDonasiEdit);
    document.getElementById('btn-cancel-edit-donasi-dana').addEventListener('click', cancelDonasiDanaEdit);
    document.getElementById('btn-cancel-edit-korban').addEventListener('click', cancelKorbanEdit);

    // Filter pencarian global sederhana
    document.getElementById('global-search').addEventListener('input', handleGlobalSearch);

    // Event listeners untuk Filter & Search tabel Korban
    document.getElementById('search-korban-nama').addEventListener('input', applyKorbanFilters);
    document.getElementById('filter-korban-kelompok').addEventListener('change', applyKorbanFilters);

    // Event listeners untuk Filter & Search tabel Donasi Barang
    document.getElementById('search-donasi-nama').addEventListener('input', applyDonasiBarangFilters);
    document.getElementById('filter-donasi-status').addEventListener('change', applyDonasiBarangFilters);

    // Event listeners untuk Filter & Search tabel Donasi Dana
    document.getElementById('search-donasi-dana-nama').addEventListener('input', applyDonasiDanaFilters);
    document.getElementById('filter-donasi-dana-status').addEventListener('change', applyDonasiDanaFilters);

    // Event listeners tombol Ekspor PDF
    document.getElementById('btn-export-pdf-donasi').addEventListener('click', exportPdfDonasiBarang);
    document.getElementById('btn-export-pdf-donasi-dana').addEventListener('click', exportPdfDonasiDana);
    document.getElementById('btn-export-pdf-korban').addEventListener('click', exportPdfKorban);
});

/* ==========================================================================
   1. ROUTER SPA (SINGLE PAGE APPLICATION) SISI KLIEN
   ========================================================================== */
function initSPARouter() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.dashboard-view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Hapus kelas aktif dari semua nav
            navItems.forEach(nav => nav.classList.remove('active'));
            // Tambahkan kelas aktif pada item terpilih
            item.classList.add('active');

            // Ambil view target
            const targetViewId = item.getAttribute('data-target');

            // Sembunyikan semua view, tampilkan view target
            views.forEach(view => {
                if (view.id === targetViewId) {
                    view.classList.add('active');
                    // Paksa rendering ulang peta Leaflet jika aktif agar ukuran map tidak rusak (grey tiles)
                    if (targetViewId === 'view-map' && map) {
                        setTimeout(() => {
                            map.invalidateSize();
                        }, 100);
                    }
                } else {
                    view.classList.remove('active');
                }
            });
        });
    });
}

/* ==========================================================================
   2. OPERASI CRUD DONASI BARANG (FETCH API)
   ========================================================================== */

// READ: Mendapatkan semua data donasi
async function fetchDonasi() {
    const tbody = document.getElementById('tbody-donasi');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><i class="fa-solid fa-spinner fa-spin"></i> Menghubungi server backend...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/donasi`);
        if (!response.ok) throw new Error('Gagal mengambil data donasi');

        const donasiList = await response.json();
        listDonasiBarang = donasiList; // Cache data ke state global
        applyDonasiBarangFilters();    // Terapkan filter & render table
    } catch (error) {
        console.error('Error fetchDonasi:', error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-red">
            <i class="fa-solid fa-triangle-exclamation"></i> Gagal memuat data dari server backend (${error.message}). <br>
            Pastikan server Spring Boot menyala di port 8080.
        </td></tr>`;
    }
}

// RENDER: Merender array donasi ke tabel UI
function renderDonasiTable(donasiList) {
    const tbody = document.getElementById('tbody-donasi');
    tbody.innerHTML = '';

    if (donasiList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Belum ada komitmen donasi barang terdaftar.</td></tr>';
        return;
    }

    donasiList.forEach(donasi => {
        const tr = document.createElement('tr');

        // Pilih badge berdasarkan status pengiriman
        let badgeClass = 'status-warning';
        if (donasi.statusPengiriman === 'Pending') badgeClass = 'status-danger';
        else if (donasi.statusPengiriman === 'Dikirim') badgeClass = 'status-warning';
        else if (donasi.statusPengiriman === 'Diterima') badgeClass = 'status-success';
        else if (donasi.statusPengiriman === 'Diproses') badgeClass = 'status-warning';

        tr.innerHTML = `
            <td><span class="text-cyan font-bold">#DB-${donasi.id}</span></td>
            <td>${escapeHTML(donasi.namaDonatur)}</td>
            <td>${escapeHTML(donasi.namaBarang)}</td>
            <td><span class="value-highlight">${donasi.jumlah} Unit</span></td>
            <td><span class="badge-status ${badgeClass}">${donasi.statusPengiriman.toUpperCase()}</span></td>
            <td class="text-right">
                <button class="btn-action-icon" onclick="editDonasi(${donasi.id})" title="Perbarui Status / Edit"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="btn-action-icon btn-delete" onclick="deleteDonasi(${donasi.id})" title="Batalkan Donasi"><i class="fa-regular fa-trash-can"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// CREATE / UPDATE: Submit form komitmen donasi
async function handleDonasiSubmit(e) {
    e.preventDefault();

    const namaDonatur = document.getElementById('donasi-donatur').value;
    const namaBarang = document.getElementById('donasi-barang').value;
    const jumlah = parseInt(document.getElementById('donasi-jumlah').value);
    const statusPengiriman = document.getElementById('donasi-status').value;

    const donasiData = { namaDonatur, namaBarang, jumlah, statusPengiriman };

    try {
        let response;
        if (currentEditingDonasiId) {
            // Mode UPDATE (PUT)
            response = await fetch(`${API_BASE_URL}/donasi/${currentEditingDonasiId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donasiData)
            });
        } else {
            // Mode CREATE (POST)
            response = await fetch(`${API_BASE_URL}/donasi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donasiData)
            });
        }

        if (!response.ok) throw new Error('Gagal mengirim komitmen donasi ke database');

        // Reset form & reload data
        document.getElementById('form-donasi').reset();
        cancelDonasiEdit();
        fetchDonasi();
        alert(currentEditingDonasiId ? 'Data donasi berhasil diperbarui!' : 'Komitmen donasi berhasil didaftarkan secara transparan!');
    } catch (error) {
        console.error('Error submit donasi:', error);
        alert(`Gagal menyimpan data donasi: ${error.message}`);
    }
}

// EDIT TRIGGER: Memasukkan data ke form untuk diedit
async function editDonasi(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/donasi/${id}`);
        if (!response.ok) throw new Error('Gagal mengambil detail donasi');

        const donasi = await response.json();

        // Isi nilai input form
        document.getElementById('donasi-id').value = donasi.id;
        document.getElementById('donasi-donatur').value = donasi.namaDonatur;
        document.getElementById('donasi-barang').value = donasi.namaBarang;
        document.getElementById('donasi-jumlah').value = donasi.jumlah;
        document.getElementById('donasi-status').value = donasi.statusPengiriman;

        // Set mode edit
        currentEditingDonasiId = donasi.id;
        document.getElementById('btn-submit-donasi').innerHTML = '<i class="fa-solid fa-pen-fancy"></i> PERBARUI DONASI';
        document.getElementById('btn-cancel-edit-donasi').classList.remove('d-none');

        // Scroll ke form
        document.getElementById('form-donasi').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error editDonasi:', error);
        alert(`Gagal memuat detail donasi: ${error.message}`);
    }
}

// CANCEL EDIT: Keluar dari mode edit donasi
function cancelDonasiEdit() {
    currentEditingDonasiId = null;
    document.getElementById('donasi-id').value = '';
    document.getElementById('btn-submit-donasi').innerHTML = '<i class="fa-solid fa-paper-plane"></i> KIRIM DONASI SEKARANG';
    document.getElementById('btn-cancel-edit-donasi').classList.add('d-none');
    document.getElementById('form-donasi').reset();
}

// DELETE: Membatalkan/menghapus donasi barang
async function deleteDonasi(id) {
    if (!confirm('Apakah Anda yakin ingin membatalkan/menghapus komitmen donasi ini?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/donasi/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Gagal menghapus donasi dari server');

        fetchDonasi();
        alert('Klaim pembatalan donasi diproses, entri berhasil dihapus.');
    } catch (error) {
        console.error('Error deleteDonasi:', error);
        alert(`Gagal menghapus donasi: ${error.message}`);
    }
}

/* Helper formatting Rupiah */
function formatRupiah(amount) {
    return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

/* Inisialisasi Tab Donasi */
function initDonationTabs() {
    const tabBarang = document.getElementById('tab-donasi-barang');
    const tabDana = document.getElementById('tab-donasi-dana');
    const formBarang = document.getElementById('form-donasi');
    const formDana = document.getElementById('form-donasi-dana');
    const cardBarang = document.getElementById('card-donasi-barang');
    const cardDana = document.getElementById('card-donasi-dana');

    if (tabBarang && tabDana && formBarang && formDana && cardBarang && cardDana) {
        tabBarang.addEventListener('click', () => {
            tabBarang.classList.add('active');
            tabDana.classList.remove('active');
            formBarang.classList.remove('d-none');
            formDana.classList.add('d-none');
            cardBarang.classList.remove('d-none');
            cardDana.classList.add('d-none');
        });

        tabDana.addEventListener('click', () => {
            tabDana.classList.add('active');
            tabBarang.classList.remove('active');
            formDana.classList.remove('d-none');
            formBarang.classList.add('d-none');
            cardDana.classList.remove('d-none');
            cardBarang.classList.add('d-none');
        });
    }
}

/* READ DANA: Mendapatkan semua data donasi dana */
async function fetchDonasiDana() {
    const tbody = document.getElementById('tbody-donasi-dana');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><i class="fa-solid fa-spinner fa-spin"></i> Menghubungi server backend...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/donasi-dana`);
        if (!response.ok) throw new Error('Gagal mengambil data donasi dana');

        const donasiDanaList = await response.json();
        listDonasiDana = donasiDanaList;    // Cache data ke state global
        applyDonasiDanaFilters();           // Terapkan filter & render table
        updateFinancialStats(donasiDanaList);
    } catch (error) {
        console.error('Error fetchDonasiDana:', error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-red">
            <i class="fa-solid fa-triangle-exclamation"></i> Gagal memuat data dari server backend (${error.message}). <br>
            Pastikan server Spring Boot menyala di port 8080.
        </td></tr>`;
    }
}

/* RENDER DANA: Merender array donasi dana ke tabel UI */
function renderDonasiDanaTable(donasiDanaList) {
    const tbody = document.getElementById('tbody-donasi-dana');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (donasiDanaList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Belum ada komitmen donasi dana tunai terdaftar.</td></tr>';
        return;
    }

    donasiDanaList.forEach(donasi => {
        const tr = document.createElement('tr');

        let badgeClass = 'status-warning';
        if (donasi.statusTransaksi === 'Pending') badgeClass = 'status-danger';
        else if (donasi.statusTransaksi === 'Gagal') badgeClass = 'status-full';
        else if (donasi.statusTransaksi === 'Berhasil') badgeClass = 'status-success';

        tr.innerHTML = `
            <td><span class="text-cyan font-bold">#DD-${donasi.id}</span></td>
            <td>${escapeHTML(donasi.namaDonatur)}</td>
            <td><span class="value-highlight">${formatRupiah(donasi.jumlahDana)}</span></td>
            <td>${escapeHTML(donasi.metodePembayaran)}</td>
            <td><span class="badge-status ${badgeClass}">${donasi.statusTransaksi.toUpperCase()}</span></td>
            <td class="text-right">
                <button class="btn-action-icon" onclick="editDonasiDana(${donasi.id})" title="Perbarui Status / Edit"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="btn-action-icon btn-delete" onclick="deleteDonasiDana(${donasi.id})" title="Batalkan Donasi"><i class="fa-regular fa-trash-can"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* UPDATE STATS: Memperbarui visual buku kas secara dinamis */
function updateFinancialStats(donasiDanaList) {
    const baseTotal = 1450230000;
    const totalNew = donasiDanaList
        .filter(d => d.statusTransaksi === 'Berhasil')
        .reduce((sum, d) => sum + d.jumlahDana, 0);
    const finalTotal = baseTotal + totalNew;

    const finCards = document.querySelectorAll('.financial-stats-grid .fin-card');
    if (finCards.length >= 3) {
        const totalMasukVal = finCards[0].querySelector('.fin-value');
        if (totalMasukVal) {
            totalMasukVal.textContent = formatRupiah(finalTotal);
        }

        const allocCircleVal = finCards[1].querySelector('.alloc-val');
        if (allocCircleVal) {
            allocCircleVal.textContent = (finalTotal / 1000000000).toFixed(2) + 'B';
        }

        const pengeluaran = 842100500;
        const sisaSaldo = finalTotal - pengeluaran;
        const sisaSaldoDesc = finCards[2].querySelector('.fin-desc');
        if (sisaSaldoDesc) {
            sisaSaldoDesc.innerHTML = `Sisa Saldo Kas: <b>${formatRupiah(sisaSaldo)}</b>`;
        }
    }
}

/* CREATE / UPDATE: Submit form komitmen donasi dana */
async function handleDonasiDanaSubmit(e) {
    e.preventDefault();

    const namaDonatur = document.getElementById('donasi-dana-donatur').value;
    const jumlahDana = parseFloat(document.getElementById('donasi-dana-jumlah').value);
    const metodePembayaran = document.getElementById('donasi-dana-metode').value;
    const statusTransaksi = document.getElementById('donasi-dana-status').value;
    const noRekeningHp = document.getElementById('donasi-dana-pengirim').value;
    const peruntukanDana = document.getElementById('donasi-dana-peruntukan').value;

    const donasiDanaData = { namaDonatur, jumlahDana, metodePembayaran, statusTransaksi, noRekeningHp, peruntukanDana };

    try {
        let response;
        if (currentEditingDonasiDanaId) {
            response = await fetch(`${API_BASE_URL}/donasi-dana/${currentEditingDonasiDanaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donasiDanaData)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/donasi-dana`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donasiDanaData)
            });
        }

        if (!response.ok) throw new Error('Gagal mengirim komitmen donasi dana ke database');

        document.getElementById('form-donasi-dana').reset();
        cancelDonasiDanaEdit();
        fetchDonasiDana();
        alert(currentEditingDonasiDanaId ? 'Data donasi dana berhasil diperbarui!' : 'Komitmen donasi dana berhasil didaftarkan secara transparan!');
    } catch (error) {
        console.error('Error submit donasi dana:', error);
        alert(`Gagal menyimpan data donasi dana: ${error.message}`);
    }
}

/* EDIT TRIGGER DANA: Memasukkan data ke form untuk diedit */
async function editDonasiDana(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/donasi-dana/${id}`);
        if (!response.ok) throw new Error('Gagal mengambil detail donasi dana');

        const donasiDana = await response.json();

        document.getElementById('donasi-dana-id').value = donasiDana.id;
        document.getElementById('donasi-dana-donatur').value = donasiDana.namaDonatur;
        document.getElementById('donasi-dana-jumlah').value = donasiDana.jumlahDana;
        document.getElementById('donasi-dana-metode').value = donasiDana.metodePembayaran;
        document.getElementById('donasi-dana-status').value = donasiDana.statusTransaksi;
        document.getElementById('donasi-dana-pengirim').value = donasiDana.noRekeningHp || '';
        document.getElementById('donasi-dana-peruntukan').value = donasiDana.peruntukanDana || 'Bebas (Dialokasikan Tim)';

        currentEditingDonasiDanaId = donasiDana.id;
        document.getElementById('btn-submit-donasi-dana').innerHTML = '<i class="fa-solid fa-pen-fancy"></i> PERBARUI DONASI DANA';
        document.getElementById('btn-cancel-edit-donasi-dana').classList.remove('d-none');

        document.getElementById('form-donasi-dana').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error editDonasiDana:', error);
        alert(`Gagal memuat detail donasi dana: ${error.message}`);
    }
}

/* CANCEL EDIT DANA: Keluar dari mode edit donasi dana */
function cancelDonasiDanaEdit() {
    currentEditingDonasiDanaId = null;
    document.getElementById('donasi-dana-id').value = '';
    document.getElementById('btn-submit-donasi-dana').innerHTML = '<i class="fa-solid fa-paper-plane"></i> KOMITMEN DONASI DANA SEKARANG';
    document.getElementById('btn-cancel-edit-donasi-dana').classList.add('d-none');
    document.getElementById('form-donasi-dana').reset();
}

/* DELETE DANA: Membatalkan/menghapus donasi dana */
async function deleteDonasiDana(id) {
    if (!confirm('Apakah Anda yakin ingin membatalkan/menghapus komitmen donasi dana ini?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/donasi-dana/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Gagal menghapus donasi dana dari server');

        fetchDonasiDana();
        alert('Klaim pembatalan donasi dana diproses, entri berhasil dihapus.');
    } catch (error) {
        console.error('Error deleteDonasiDana:', error);
        alert(`Gagal menghapus donasi dana: ${error.message}`);
    }
}


/* ==========================================================================
   3. OPERASI CRUD KORBAN BENCANA (FETCH API)
   ========================================================================== */

// READ: Mendapatkan semua data korban
async function fetchKorban() {
    const tbody = document.getElementById('tbody-korban');
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4"><i class="fa-solid fa-spinner fa-spin"></i> Menghubungi server backend...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/korban`);
        if (!response.ok) throw new Error('Gagal mengambil data korban');

        const korbanList = await response.json();
        listKorban = korbanList;   // Cache data ke state global
        applyKorbanFilters();      // Terapkan filter & render table
    } catch (error) {
        console.error('Error fetchKorban:', error);
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-red">
            <i class="fa-solid fa-triangle-exclamation"></i> Gagal memuat data korban dari server (${error.message}). <br>
            Pastikan Spring Boot berjalan di port 8080.
        </td></tr>`;
    }
}

// RENDER: Merender array korban ke tabel UI
function renderKorbanTable(korbanList) {
    const tbody = document.getElementById('tbody-korban');
    tbody.innerHTML = '';

    if (korbanList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">Belum ada profil korban bencana terdaftar.</td></tr>';
        return;
    }

    korbanList.forEach(korban => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td><span class="text-cyan font-bold">#K-${korban.id}</span></td>
            <td>${escapeHTML(korban.nama)}</td>
            <td><code>${escapeHTML(korban.nik)}</code></td>
            <td><code>${escapeHTML(korban.nomorKK)}</code></td>
            <td><span class="badge-status status-warning">${escapeHTML(korban.kelompokRentan)}</span></td>
            <td><span class="text-orange font-bold">${escapeHTML(korban.statusRumah)}</span></td>
            <td><span class="text-muted">${escapeHTML(korban.alamatAsal)}</span></td>
            <td class="text-right">
                <button class="btn-action-icon" onclick="editKorban(${korban.id})" title="Edit Profil"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="btn-action-icon btn-delete" onclick="deleteKorban(${korban.id})" title="Hapus Profil"><i class="fa-regular fa-trash-can"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// CREATE / UPDATE: Submit form profil korban
async function handleKorbanSubmit(e) {
    e.preventDefault();

    const nama = document.getElementById('korban-nama').value;
    const NIK = document.getElementById('korban-nik').value;
    const nomorKK = document.getElementById('korban-kk').value;
    const kelompokRentan = document.getElementById('korban-kelompok').value;
    const statusRumah = document.getElementById('korban-rumah').value;
    const alamatAsal = document.getElementById('korban-alamat').value;

    const korbanData = { nama, nik: NIK, nomorKK, kelompokRentan, statusRumah, alamatAsal };

    try {
        let response;
        if (currentEditingKorbanId) {
            // Mode UPDATE (PUT)
            response = await fetch(`${API_BASE_URL}/korban/${currentEditingKorbanId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(korbanData)
            });
        } else {
            // Mode CREATE (POST)
            response = await fetch(`${API_BASE_URL}/korban`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(korbanData)
            });
        }

        if (!response.ok) throw new Error('Gagal menyimpan profil korban');

        // Reset form & reload data
        document.getElementById('form-korban').reset();
        cancelKorbanEdit();
        fetchKorban();
        alert(currentEditingKorbanId ? 'Profil korban berhasil diperbarui!' : 'Profil korban baru berhasil didaftarkan ke basis data pusat!');
    } catch (error) {
        console.error('Error submit korban:', error);
        alert(`Gagal menyimpan data korban: ${error.message}`);
    }
}

// EDIT TRIGGER: Memasukkan data korban ke form untuk diedit
async function editKorban(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/korban/${id}`);
        if (!response.ok) throw new Error('Gagal mengambil data korban');

        const korban = await response.json();

        // Isi nilai input form
        document.getElementById('korban-id').value = korban.id;
        document.getElementById('korban-nama').value = korban.nama;
        document.getElementById('korban-nik').value = korban.nik; // H2 memetakan NIK ke nik (case-insensitive JSON key)
        document.getElementById('korban-kk').value = korban.nomorKK;
        document.getElementById('korban-kelompok').value = korban.kelompokRentan;
        document.getElementById('korban-rumah').value = korban.statusRumah;
        document.getElementById('korban-alamat').value = korban.alamatAsal;

        // Set mode edit
        currentEditingKorbanId = korban.id;
        document.getElementById('form-korban-title').innerHTML = '<i class="fa-solid fa-user-pen"></i> Edit Profil Korban';
        document.getElementById('btn-submit-korban').innerHTML = '<i class="fa-solid fa-user-check"></i> SIMPAN PERUBAHAN PROFIL';
        document.getElementById('btn-cancel-edit-korban').classList.remove('d-none');

        // Scroll ke form
        document.getElementById('form-korban').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error editKorban:', error);
        alert(`Gagal memuat profil korban: ${error.message}`);
    }
}

// CANCEL EDIT: Keluar dari mode edit korban
function cancelKorbanEdit() {
    currentEditingKorbanId = null;
    document.getElementById('korban-id').value = '';
    document.getElementById('form-korban-title').innerHTML = '<i class="fa-solid fa-user-plus"></i> Registrasi Akun & Profil Korban';
    document.getElementById('btn-submit-korban').innerHTML = '<i class="fa-solid fa-user-check"></i> DAFTARKAN PROFIL KORBAN';
    document.getElementById('btn-cancel-edit-korban').classList.add('d-none');
    document.getElementById('form-korban').reset();
}

// DELETE: Menghapus data korban
async function deleteKorban(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus profil korban bencana ini secara permanen?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/korban/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Gagal menghapus profil dari database');

        fetchKorban();
        alert('Data profil korban berhasil dihapus dari database.');
    } catch (error) {
        console.error('Error deleteKorban:', error);
        alert(`Gagal menghapus data korban: ${error.message}`);
    }
}


/* ==========================================================================
   4. MODAL MASUK / DAFTAR AKUN
   ========================================================================== */
function initAuthModal() {
    const modal = document.getElementById('modal-login');
    const openBtn = document.getElementById('btn-login-trigger');
    const closeBtn = document.getElementById('btn-close-login-modal');

    // Cek status login saat pertama kali dimuat
    const checkLoginStatus = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        updateLoginStateUI(isLoggedIn);
    };

    openBtn.addEventListener('click', () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            handleLogoutFlow();
        } else {
            modal.classList.add('active');
        }
    });

    closeBtn.addEventListener('click', () => modal.classList.remove('active'));

    // Klik di luar area modal untuk menutup
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Pemicu login dari sidebar
    const sidebarLoginTrigger = document.getElementById('btn-sidebar-login-trigger');
    if (sidebarLoginTrigger) {
        sidebarLoginTrigger.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }

    // Tombol logout di sidebar
    const sidebarLogoutBtn = document.getElementById('btn-sidebar-logout');
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', () => {
            handleLogoutFlow();
        });
    }

    function handleLogoutFlow() {
        if (confirm('Apakah Anda yakin ingin keluar dari akun?')) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRole');
            updateLoginStateUI(false);
        }
    }

    // Handle Auth Tabs (Masuk vs Daftar)
    const tabLogin = document.getElementById('auth-tab-login');
    const tabRegister = document.getElementById('auth-tab-register');
    const btnSubmit = document.getElementById('btn-login-submit');

    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        btnSubmit.innerHTML = 'Masuk Sekarang <i class="fa-solid fa-arrow-right-to-bracket ml-2"></i>';
    });

    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        btnSubmit.innerHTML = 'Daftar Akun Baru <i class="fa-solid fa-user-plus ml-2"></i>';
    });

    // Handle Role Selectors
    const roleKorban = document.getElementById('role-korban');
    const roleRelawan = document.getElementById('role-relawan');

    roleKorban.addEventListener('click', () => {
        roleKorban.classList.add('active');
        roleRelawan.classList.remove('active');
    });

    roleRelawan.addEventListener('click', () => {
        roleRelawan.classList.add('active');
        roleKorban.classList.remove('active');
    });

    // Password Toggle Visibility
    const togglePass = document.getElementById('toggle-password');
    const passInput = document.getElementById('auth-password');

    togglePass.addEventListener('click', () => {
        const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passInput.setAttribute('type', type);
        togglePass.classList.toggle('fa-eye');
        togglePass.classList.toggle('fa-eye-slash');
    });

    // Submit Auth Form (Simulasi)
    document.getElementById('form-auth-submit').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;

        // Ambil peran yang dipilih
        const isRelawan = roleRelawan.classList.contains('active');
        const roleName = isRelawan ? 'Relawan / Donatur' : 'Korban';

        alert(`Autentikasi berhasil sebagai ${roleName} untuk: ${email}. Akses portal darurat diizinkan.`);
        modal.classList.remove('active');

        // Simpan state login
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', roleName);

        updateLoginStateUI(true);
    });

    function updateLoginStateUI(isLoggedIn) {
        const userBadge = document.getElementById('sidebar-user-badge');
        const loginPrompt = document.getElementById('sidebar-login-prompt');

        if (isLoggedIn) {
            userBadge.classList.remove('d-none');
            loginPrompt.classList.add('d-none');

            const email = localStorage.getItem('userEmail') || 'Budi Santoso';
            const role = localStorage.getItem('userRole') || 'Korban';
            const userNameEl = userBadge.querySelector('.user-name');
            const userIdEl = userBadge.querySelector('.user-id');

            if (email.includes('@')) {
                const namePart = email.split('@')[0];
                const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                userNameEl.textContent = displayName;
                userIdEl.textContent = role; // Tampilkan peran user (Korban atau Relawan)
            } else {
                userNameEl.textContent = 'Budi Santoso';
                userIdEl.textContent = 'ID: EL-99203';
            }

            // Ubah tombol di navbar atas jadi logout
            if (openBtn) {
                openBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> Keluar';
                openBtn.style.backgroundColor = 'var(--border-color)';
                openBtn.style.boxShadow = 'none';
            }
        } else {
            userBadge.classList.add('d-none');
            loginPrompt.classList.remove('d-none');

            // Kembalikan tombol di navbar atas jadi masuk
            if (openBtn) {
                openBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Masuk / Daftar Akun Korban';
                openBtn.style.backgroundColor = 'var(--safety-orange)';
                openBtn.style.boxShadow = '0 4px 12px rgba(255, 107, 0, 0.2)';
            }
        }
    }

    // Panggil saat inisialisasi
    checkLoginStatus();
}


/* ==========================================================================
   5. INTERAKSI WIDGET AI CHATBOT (EMBERBOT SUPPORT)
   ========================================================================== */
function initChatbot() {
    const trigger = document.getElementById('chatbot-trigger');
    const windowEl = document.getElementById('chatbot-window');
    const closeBtn = document.getElementById('btn-close-chat');
    const sendBtn = document.getElementById('btn-send-chat');
    const chatInput = document.getElementById('chatbot-input');
    const messagesBody = document.getElementById('chatbot-messages');

    // Buka / Tutup chat window
    trigger.addEventListener('click', () => {
        windowEl.classList.toggle('active');
    });

    closeBtn.addEventListener('click', () => {
        windowEl.classList.remove('active');
    });

    // Kirim pesan dengan tombol kirim
    sendBtn.addEventListener('click', () => {
        sendChatMessage();
    });

    // Kirim pesan dengan Enter
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });

    // ── Konfigurasi LLM Provider (lihat config.js) ────────────────────────
    const CFG = typeof CONFIG !== 'undefined' ? CONFIG : {};
    const LLM_PROVIDER = CFG.LLM_PROVIDER || 'ollama';
    const OLLAMA_MODEL = CFG.OLLAMA_MODEL || 'llama3.2';
    const OLLAMA_URL = CFG.OLLAMA_API_URL || 'http://localhost:11434/v1/chat/completions';
    const OPENAI_KEY = CFG.OPENAI_API_KEY || '';
    const OPENAI_MODEL = CFG.OPENAI_MODEL || 'gpt-4o-mini';
    const GEMINI_KEY = CFG.GEMINI_API_KEY || '';
    const GEMINI_MODEL = CFG.GEMINI_MODEL || 'gemini-2.5-flash';
    const GITHUB_TOKEN = CFG.GITHUB_TOKEN || '';
    const GITHUB_MODEL = CFG.GITHUB_MODEL || 'gpt-4o-mini';
    const GITHUB_URL = CFG.GITHUB_API_URL || 'https://models.inference.ai.azure.com/chat/completions';

    const SYSTEM_PROMPT = `Kamu adalah EmberBot, asisten AI resmi aplikasi EmberLord — platform respons bencana darurat.
Tugasmu membantu korban bencana, relawan, dan donatur dengan informasi yang akurat, cepat, dan empatik.

Konteks aplikasi EmberLord:
- Posko aktif: GOR Pemuda (142 slot), Masjid Al-Ikhlas (300+ slot), Balai Desa
- Logistik mendesak: Popok Bayi (70%), Selimut Hangat (40%), Tenda Darurat (20%)
- Layanan: Registrasi Korban, Portal Donasi Barang & Dana, Pemulihan Dokumen, Hotline Darurat
- Dukcapil Keliling: Posko 3 Sukamaju pukul 08:00-12:00 WIB

Jawab dalam Bahasa Indonesia yang ramah, jelas, dan ringkas.`;

    // Riwayat percakapan untuk konteks multi-turn
    let chatHistory = [];

    // Kirim pesan ke LLM berdasarkan provider yang dipilih
    async function sendChatMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        appendMessage('user', text);
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;

        const typingId = appendTypingIndicator();
        messagesBody.scrollTop = messagesBody.scrollHeight;

        chatHistory.push({ role: "user", content: text });

        try {
            let balasan;

            if (LLM_PROVIDER === 'gemini') {
                // ── Google Gemini ──────────────────────────────────────────
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;
                const messages = chatHistory.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }));
                const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: messages,
                        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
                    })
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error?.message || `HTTP ${res.status}`);
                }
                const data = await res.json();
                balasan = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            } else {
                // ── OpenAI-compatible (Ollama, OpenAI, GitHub) ─────────────
                let url, token, model;
                if (LLM_PROVIDER === 'openai') {
                    url = 'https://api.openai.com/v1/chat/completions';
                    token = OPENAI_KEY;
                    model = OPENAI_MODEL;
                } else if (LLM_PROVIDER === 'github') {
                    url = GITHUB_URL;
                    token = GITHUB_TOKEN;
                    model = GITHUB_MODEL;
                } else {
                    url = OLLAMA_URL;
                    token = '';
                    model = OLLAMA_MODEL;
                }
                const headers = { "Content-Type": "application/json" };
                if (token) headers["Authorization"] = `Bearer ${token}`;
                const res = await fetch(url, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        model,
                        messages: [
                            { role: "system", content: SYSTEM_PROMPT },
                            ...chatHistory
                        ],
                        temperature: 0.7,
                        max_tokens: 512
                    })
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error?.message || `HTTP ${res.status}`);
                }
                const data = await res.json();
                balasan = data.choices?.[0]?.message?.content || '';
            }

            // Simpan balasan ke riwayat (max 20 pesan terakhir)
            chatHistory.push({ role: "assistant", content: balasan });
            if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

            removeTypingIndicator(typingId);
            appendMessage('bot', balasan.replace(/\n/g, '<br>'));

        } catch (error) {
            console.error('EmberBot error:', error);
            removeTypingIndicator(typingId);
            appendMessage('bot', `⚠️ EmberBot gangguan: <b>${error.message}</b>.<br>Periksa konfigurasi provider ${LLM_PROVIDER}.`);
        } finally {
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();
            messagesBody.scrollTop = messagesBody.scrollHeight;
        }
    }

    function appendMessage(sender, content) {
        const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;
        msgDiv.innerHTML = `
            <p>${content}</p>
            <span class="message-time">${time}</span>
        `;
        messagesBody.appendChild(msgDiv);
    }

    function appendTypingIndicator() {
        const id = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator-msg';
        typingDiv.id = id;
        typingDiv.innerHTML = `
            <p><i class="fa-solid fa-circle-notch fa-spin"></i> EmberBot sedang berpikir...</p>
        `;
        messagesBody.appendChild(typingDiv);
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
}


/* ==========================================================================
   6. TOMBOL DARURAT SOS & PELAPORAN INCIDENT
   ========================================================================== */
function initSOSButton() {
    const sosBtn = document.getElementById('btn-sos-trigger');
    if (sosBtn) {
        sosBtn.addEventListener('click', () => {
            alert('🚨 PROTOKOL SOS DIKIRIM! Koordinasi GPS Anda telah dikirim ke server BASARNAS & Ambulans terdekat. Tetap tenang dan cari tempat perlindungan.');
        });
    }
}

let currentUploadedPhotoBase64 = null;

// Mengatur unggah foto kejadian
function initIncidentPhotoUpload() {
    const dragDropZone = document.getElementById('drag-drop-zone');
    const fileInput = document.getElementById('incident-photo');
    const promptContainer = document.getElementById('drag-drop-prompt');
    const previewContainer = document.getElementById('photo-preview-container');
    const previewImg = document.getElementById('photo-preview');
    const removeBtn = document.getElementById('btn-remove-photo');

    if (!dragDropZone || !fileInput) return;

    // Trigger click on file input
    dragDropZone.addEventListener('click', (e) => {
        if (e.target === fileInput || e.target.closest('#photo-preview-container')) return;
        fileInput.click();
    });

    fileInput.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Handle file change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handlePhotoFile(file);
    });

    // Handle Drag & Drop
    dragDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragDropZone.style.borderColor = 'var(--tech-cyan)';
    });

    dragDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragDropZone.style.borderColor = 'var(--border-color)';
    });

    dragDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dragDropZone.style.borderColor = 'var(--border-color)';
        const file = e.dataTransfer.files[0];
        handlePhotoFile(file);
    });

    // Remove photo
    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            resetPhotoUpload();
        });
    }

    function handlePhotoFile(file) {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar (JPG, PNG, dll.)');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('Ukuran gambar maksimal 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            currentUploadedPhotoBase64 = event.target.result;
            previewImg.src = currentUploadedPhotoBase64;
            promptContainer.classList.add('d-none');
            previewContainer.classList.remove('d-none');
        };
        reader.readAsDataURL(file);
    }

    window.resetPhotoUpload = function () {
        fileInput.value = '';
        currentUploadedPhotoBase64 = null;
        previewImg.src = '';
        previewContainer.classList.add('d-none');
        promptContainer.classList.remove('d-none');
    };

    // Auto-load mock photo if URL parameter mockPhoto=true is present (for testing/subagent verification)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mockPhoto') === 'true') {
        currentUploadedPhotoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        previewImg.src = currentUploadedPhotoBase64;
        promptContainer.classList.add('d-none');
        previewContainer.classList.remove('d-none');
    }
}

// Inisialisasi Modal Detail
function initLaporanDetailModal() {
    const modal = document.getElementById('modal-laporan-detail');
    const closeBtn = document.getElementById('btn-close-laporan-modal');

    if (modal && closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}

// Laporan Kejadian Baru
async function handleLaporanKejadianSubmit(e) {
    e.preventDefault();
    const lokasi = document.getElementById('incident-loc').value;
    const kondisi = document.getElementById('incident-condition').value;
    const estimasiKorbanInput = document.getElementById('incident-victims').value;
    const estimasiKorban = estimasiKorbanInput ? parseInt(estimasiKorbanInput) : null;
    const foto = currentUploadedPhotoBase64; // Data Base64 dari FileReader

    const laporanData = { lokasi, kondisi, estimasiKorban, foto };

    try {
        const response = await fetch(`${API_BASE_URL}/laporan-kejadian`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(laporanData)
        });

        if (!response.ok) throw new Error('Gagal mengirim laporan kejadian ke database');

        document.getElementById('form-laporan-kejadian').reset();
        if (window.resetPhotoUpload) window.resetPhotoUpload();

        fetchLaporan();
        alert('Laporan Kejadian Berhasil Terkirim secara Resmi! Petugas akan segera memverifikasi laporan Anda.');
    } catch (error) {
        console.error('Error submit laporan kejadian:', error);
        alert(`Gagal mengirim laporan: ${error.message}`);
    }
}

// READ REPORTS: Mendapatkan seluruh data laporan kejadian dari API
async function fetchLaporan() {
    const tbody = document.getElementById('tbody-laporan');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4"><i class="fa-solid fa-spinner fa-spin"></i> Menghubungi server backend...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/laporan-kejadian`);
        if (!response.ok) throw new Error('Gagal mengambil data laporan kejadian');

        const laporanList = await response.json();
        listLaporan = laporanList; // Cache data ke state global
        renderLaporanTable(laporanList);
    } catch (error) {
        console.error('Error fetchLaporan:', error);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red">
            <i class="fa-solid fa-triangle-exclamation"></i> Gagal memuat data laporan dari server backend (${error.message}).
        </td></tr>`;
    }
}

// RENDER REPORTS: Merender array laporan ke tabel UI
function renderLaporanTable(laporanList) {
    const tbody = document.getElementById('tbody-laporan');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (laporanList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">Belum ada laporan kejadian aktif terdaftar.</td></tr>';
        return;
    }

    laporanList.forEach(laporan => {
        const tr = document.createElement('tr');

        let badgeClass = 'badge-neutral';
        const cond = laporan.kondisi.toLowerCase();
        if (cond.includes('kebakaran') || cond.includes('api') || cond.includes('runtuhan')) {
            badgeClass = 'badge-danger';
        }

        let dotClass = 'red-dot'; // Pending / default
        if (laporan.statusLaporan === 'Petugas Menuju Lokasi') {
            dotClass = 'blue-dot';
        } else if (laporan.statusLaporan === 'Selesai') {
            dotClass = 'green-dot';
        }

        tr.innerHTML = `
            <td><span class="text-cyan font-bold">#EB-${laporan.id}</span></td>
            <td><span class="category-badge ${badgeClass}">${escapeHTML(laporan.kondisi)}</span></td>
            <td>${escapeHTML(laporan.waktuLapor)}</td>
            <td><span class="dot ${dotClass}"></span> ${escapeHTML(laporan.statusLaporan)}</td>
            <td class="text-right">
                <button class="btn-action-icon" onclick="viewLaporanDetail(${laporan.id})" title="Lihat Detail Kejadian"><i class="fa-regular fa-eye"></i></button>
                <button class="btn-action-icon btn-delete" onclick="deleteLaporan(${laporan.id})" title="Hapus Laporan"><i class="fa-regular fa-trash-can"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// VIEW DETAIL: Menampilkan detail laporan secara interaktif dengan Modal Kustom
async function viewLaporanDetail(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/laporan-kejadian/${id}`);
        if (!response.ok) throw new Error('Gagal mengambil detail laporan');

        const laporan = await response.json();

        const contentDiv = document.getElementById('laporan-detail-content');
        if (!contentDiv) return;

        let fotoHtml = '';
        if (laporan.foto) {
            fotoHtml = `
                <div style="margin-top: 10px;">
                    <span style="display: block; font-weight: 600; color: var(--text-muted); margin-bottom: 6px;">Foto Kondisi Lapangan:</span>
                    <img src="${laporan.foto}" alt="Foto Lapangan" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color);">
                </div>
            `;
        } else {
            fotoHtml = `
                <div style="margin-top: 10px; padding: 16px; text-align: center; border: 1px dashed var(--border-color); border-radius: 6px; color: var(--text-muted);">
                    <i class="fa-regular fa-image" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                    Tidak ada foto terlampir
                </div>
            `;
        }

        contentDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px 12px; align-items: baseline;">
                <span style="font-weight: 600; color: var(--text-muted);">Ticket ID:</span>
                <span class="text-cyan font-bold">#EB-${laporan.id}</span>

                <span style="font-weight: 600; color: var(--text-muted);">Kategori:</span>
                <span>${escapeHTML(laporan.kondisi)}</span>

                <span style="font-weight: 600; color: var(--text-muted);">Lokasi:</span>
                <span>${escapeHTML(laporan.lokasi)}</span>

                <span style="font-weight: 600; color: var(--text-muted);">Estimasi Korban:</span>
                <span>${laporan.estimasiKorban !== null ? laporan.estimasiKorban + ' Orang' : 'Tidak Ada / Tidak Diketahui'}</span>

                <span style="font-weight: 600; color: var(--text-muted);">Waktu Lapor:</span>
                <span>${escapeHTML(laporan.waktuLapor)}</span>

                <span style="font-weight: 600; color: var(--text-muted);">Status Laporan:</span>
                <span>${escapeHTML(laporan.statusLaporan)}</span>
            </div>
            ${fotoHtml}
        `;

        const modal = document.getElementById('modal-laporan-detail');
        if (modal) {
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error viewLaporanDetail:', error);
        alert(`Gagal mengambil detail laporan: ${error.message}`);
    }
}

// DELETE REPORT: Menghapus laporan kejadian dari server
async function deleteLaporan(id) {
    if (!confirm('Apakah Anda yakin ingin membatalkan/menghapus laporan kejadian ini?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/laporan-kejadian/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Gagal menghapus laporan kejadian dari server');

        fetchLaporan();
        alert('Laporan kejadian berhasil dihapus/dibatalkan.');
    } catch (error) {
        console.error('Error deleteLaporan:', error);
        alert(`Gagal menghapus laporan: ${error.message}`);
    }
}



/* ==========================================================================
   7. PENCARIAN GLOBAL SEDERHANA & UTILITY
   ========================================================================== */
function handleGlobalSearch(e) {
    const query = e.target.value.toLowerCase();

    // Cari di tabel donasi barang
    const donasiRows = document.querySelectorAll('#tbody-donasi tr');
    donasiRows.forEach(row => {
        if (row.cells.length < 5) return;
        const text = row.innerText.toLowerCase();
        if (text.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });

    // Cari di tabel donasi dana
    const donasiDanaRows = document.querySelectorAll('#tbody-donasi-dana tr');
    donasiDanaRows.forEach(row => {
        if (row.cells.length < 5) return;
        const text = row.innerText.toLowerCase();
        if (text.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });

    // Cari di tabel laporan kejadian
    const laporanRows = document.querySelectorAll('#tbody-laporan tr');
    laporanRows.forEach(row => {
        if (row.cells.length < 4) return;
        const text = row.innerText.toLowerCase();
        if (text.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });

    // Cari di tabel korban
    const korbanRows = document.querySelectorAll('#tbody-korban tr');
    korbanRows.forEach(row => {
        if (row.cells.length < 7) return;
        const text = row.innerText.toLowerCase();
        if (text.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Helper untuk menghindari serangan XSS
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

/* ==========================================================================
   8. INTEGRASI LEAFLET MAP & GPS TRACKING (KOTA SEMARANG)
   ========================================================================== */
function initMap() {
    const semarangLat = -6.9932;
    const semarangLng = 110.4203;

    // Matikan zoom control bawaan Leaflet karena kita menggunakan tombol kustom di kanan bawah
    map = L.map('map', {
        zoomControl: false,
        center: [semarangLat, semarangLng],
        zoom: 13
    });

    // Layer Peta Google Maps standard
    const googleRoadmap = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps'
    });

    // Layer Satelit Google Maps
    const googleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps'
    });

    // Tambahkan peta standard saat awal dimuat
    googleRoadmap.addTo(map);
    currentTileLayer = googleRoadmap;

    // Tambahkan marker Posko di Kota Semarang
    // 1. GOR Tri Lomba Juang
    L.marker([-6.9897, 110.4207]).addTo(map)
        .bindPopup('<b>Posko 1: GOR Tri Lomba Juang</b><br>Kapasitas: 142 Slot tersisa.<br>Status: Normal');

    // 2. Masjid Agung Jawa Tengah (MAJT)
    L.marker([-6.9839, 110.4455]).addTo(map)
        .bindPopup('<b>Posko 2: Masjid Agung Jawa Tengah</b><br>Kapasitas: 300+ Slot tersisa.<br>Status: Leluasa');

    // 3. Halaman Kantor Balai Kota Semarang
    L.marker([-6.9806, 110.4162]).addTo(map)
        .bindPopup('<b>Posko 3: Balai Kota Semarang</b><br>Kapasitas: Penuh.<br>Status: Sangat Padat');

    // Tambahkan Lingkaran Zona Bahaya Kebakaran di Semarang
    L.circle([-6.9950, 110.4250], {
        color: '#FF6B00',
        fillColor: 'rgba(255, 107, 0, 0.25)',
        fillOpacity: 0.4,
        radius: 400
    }).addTo(map).bindPopup('<b>🚨 ZONA BAHAYA UTAMA (KEBAKARAN)</b><br>Harap jauhi radius area ini.');

    // Hubungkan kontrol tombol kustom
    document.getElementById('btn-map-zoomin').addEventListener('click', () => {
        map.zoomIn();
    });

    document.getElementById('btn-map-zoomout').addEventListener('click', () => {
        map.zoomOut();
    });

    document.getElementById('btn-map-layer').addEventListener('click', () => {
        if (currentLayerType === 'roadmap') {
            map.removeLayer(googleRoadmap);
            googleSatellite.addTo(map);
            currentTileLayer = googleSatellite;
            currentLayerType = 'satellite';
        } else {
            map.removeLayer(googleSatellite);
            googleRoadmap.addTo(map);
            currentTileLayer = googleRoadmap;
            currentLayerType = 'roadmap';
        }
    });

    document.getElementById('btn-map-gps').addEventListener('click', () => {
        focusOnUserLocation();
    });

    // Jalankan deteksi GPS otomatis secara real-time
    trackUserLocation();
}

function trackUserLocation() {
    if (!navigator.geolocation) {
        console.log("Geolocation/GPS tidak didukung oleh peramban ini.");
        return;
    }

    // Mengamati perubahan lokasi perangkat pengguna secara real-time
    navigator.geolocation.watchPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            updateGpsMarker(lat, lng, accuracy);
        },
        (error) => {
            console.warn("Gagal mendapatkan akses GPS perangkat: ", error.message);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
        }
    );
}

function updateGpsMarker(lat, lng, accuracy) {
    if (userGpsMarker) {
        userGpsMarker.setLatLng([lat, lng]);
        userGpsCircle.setLatLng([lat, lng]);
        userGpsCircle.setRadius(accuracy);
    } else {
        // Ikon kustom berupa dot biru dengan denyut animasi CSS
        const userIcon = L.divIcon({
            className: 'user-gps-marker',
            html: '<div class="gps-dot"></div><div class="gps-pulse"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        userGpsMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map)
            .bindPopup('<b>Lokasi Anda Saat Ini</b>');

        userGpsCircle = L.circle([lat, lng], {
            radius: accuracy,
            color: '#00D2FF',
            fillColor: '#00D2FF',
            fillOpacity: 0.15,
            weight: 1
        }).addTo(map);
    }
}

function focusOnUserLocation() {
    if (userGpsMarker) {
        const latLng = userGpsMarker.getLatLng();
        map.setView(latLng, 16, { animate: true });
    } else {
        // Minta posisi sekali jika watchPosition belum terpicu
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;

                updateGpsMarker(lat, lng, accuracy);
                map.setView([lat, lng], 16, { animate: true });
            },
            (error) => {
                alert("Gagal mengakses GPS perangkat Anda. Pastikan izin lokasi telah diberikan.");
            }
        );
    }
}

/* ==========================================================================
   KONTROL FILTER & SEARCHING TABEL (DASHBOARD REAL-TIME UPDATE)
   ========================================================================== */

// 1. FILTER & SEARCH KORBAN
function applyKorbanFilters() {
    const searchQuery = document.getElementById('search-korban-nama').value.toLowerCase();
    const kelompokFilter = document.getElementById('filter-korban-kelompok').value;

    const filteredList = listKorban.filter(korban => {
        const matchesName = korban.nama.toLowerCase().includes(searchQuery);
        const matchesKelompok = !kelompokFilter || korban.kelompokRentan === kelompokFilter;
        return matchesName && matchesKelompok;
    });

    renderKorbanTable(filteredList);
}

// 2. FILTER & SEARCH DONASI BARANG
function applyDonasiBarangFilters() {
    const searchQuery = document.getElementById('search-donasi-nama').value.toLowerCase();
    const statusFilter = document.getElementById('filter-donasi-status').value;

    const filteredList = listDonasiBarang.filter(donasi => {
        const matchesName = donasi.namaDonatur.toLowerCase().includes(searchQuery);
        const matchesStatus = !statusFilter || donasi.statusPengiriman === statusFilter;
        return matchesName && matchesStatus;
    });

    renderDonasiTable(filteredList);
}

// 3. FILTER & SEARCH DONASI DANA
function applyDonasiDanaFilters() {
    const searchQuery = document.getElementById('search-donasi-dana-nama').value.toLowerCase();
    const statusFilter = document.getElementById('filter-donasi-dana-status').value;

    const filteredList = listDonasiDana.filter(donasi => {
        const matchesName = donasi.namaDonatur.toLowerCase().includes(searchQuery);
        const matchesStatus = !statusFilter || donasi.statusTransaksi === statusFilter;
        return matchesName && matchesStatus;
    });

    renderDonasiDanaTable(filteredList);
}

// 4. MODAL LOGISTIK LENGKAP
function initLogistikModal() {
    const modal = document.getElementById('modal-logistik');
    const openBtn = document.getElementById('btn-lihat-logistik');
    const closeBtn = document.getElementById('btn-close-logistik-modal');
    const searchInput = document.getElementById('search-logistik');
    const filterSelect = document.getElementById('filter-priority-logistik');

    if (openBtn && modal && closeBtn) {
        openBtn.addEventListener('click', () => {
            modal.classList.add('active');
            renderLogistikLengkap();
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value;
            const priority = filterSelect.value;
            renderLogistikLengkap(query, priority);
        });
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            const query = searchInput.value;
            const priority = filterSelect.value;
            renderLogistikLengkap(query, priority);
        });
    }
}

function renderLogistikLengkap(query = '', priorityFilter = '') {
    const tbody = document.getElementById('tbody-logistik-lengkap');
    if (!tbody) return;
    tbody.innerHTML = '';

    const q = query.toLowerCase();
    const filteredList = LIST_LOGISTIK_LENGKAP.filter(item => {
        const matchesName = item.nama.toLowerCase().includes(q);
        const matchesPriority = !priorityFilter || item.prioritas === priorityFilter;
        return matchesName && matchesPriority;
    });

    if (filteredList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Barang logistik tidak ditemukan.</td></tr>';
        return;
    }

    filteredList.forEach(item => {
        const tr = document.createElement('tr');

        let priorityClass = 'status-success'; // Selesai
        if (item.prioritas === 'Kritis') priorityClass = 'status-danger';
        else if (item.prioritas === 'Tinggi') priorityClass = 'status-warning';
        else if (item.prioritas === 'Sedang') priorityClass = 'status-warning';
        else if (item.prioritas === 'Selesai') priorityClass = 'status-success';

        const sisa = Math.max(0, item.target - item.terpenuhi);
        const statusText = item.prioritas.toUpperCase();

        tr.innerHTML = `
            <td><b>${escapeHTML(item.nama)}</b></td>
            <td><span class="value-highlight">${item.target} Unit</span></td>
            <td><span class="text-green">${item.terpenuhi} Unit</span></td>
            <td><span class="${sisa > 0 ? 'text-red font-bold' : 'text-green'}">${sisa} Unit</span></td>
            <td><span class="text-muted">${escapeHTML(item.posko)}</span></td>
            <td><span class="badge-status ${priorityClass}">${statusText}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

/* ==========================================================================
   EKSPOR PDF — Menggunakan jsPDF + AutoTable
   ========================================================================== */

/**
 * Helper: membuat dokumen jsPDF dengan header standar EmberLord.
 * @param {string} judul - Judul laporan yang ditampilkan di PDF.
 * @returns {{ doc: jsPDF, startY: number }}
 */
function _buatDokumenPDF(judul) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date();
    const tanggal = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const waktu = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Header merah EmberLord
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 0, pageWidth, 22, 'F');

    // Judul di header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('EMBERLORD — PORTAL LOGISTIK & RESPONS BENCANA', pageWidth / 2, 10, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(judul.toUpperCase(), pageWidth / 2, 17, { align: 'center' });

    // Sub-header: tanggal & waktu cetak
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Dicetak: ${tanggal}, ${waktu}`, 14, 28);

    return { doc, startY: 32 };
}

/**
 * Ekspor tabel Donasi Barang ke PDF.
 */
function exportPdfDonasiBarang() {
    if (!listDonasiBarang || listDonasiBarang.length === 0) {
        alert('Tidak ada data donasi barang untuk diekspor.');
        return;
    }

    const { doc, startY } = _buatDokumenPDF('Laporan Tabel Donasi Barang');

    const head = [['ID Donasi', 'Nama Donatur', 'Jenis Barang', 'Jumlah', 'Status Pengiriman']];
    const body = listDonasiBarang.map(d => [
        d.id ?? '-',
        d.namaDonatur ?? '-',
        d.jenisBarang ?? '-',
        d.jumlah ?? '-',
        d.statusPengiriman ?? '-'
    ]);

    doc.autoTable({
        head,
        body,
        startY,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 }
    });

    doc.save(`EmberLord_Donasi_Barang_${Date.now()}.pdf`);
}

/**
 * Ekspor tabel Donasi Dana Tunai ke PDF.
 */
function exportPdfDonasiDana() {
    if (!listDonasiDana || listDonasiDana.length === 0) {
        alert('Tidak ada data donasi dana untuk diekspor.');
        return;
    }

    const { doc, startY } = _buatDokumenPDF('Laporan Tabel Donasi Dana Tunai');

    const head = [['ID Donasi', 'Nama Donatur', 'Nominal (Rp)', 'Metode Pembayaran', 'Status Transaksi']];
    const body = listDonasiDana.map(d => [
        d.id ?? '-',
        d.namaDonatur ?? '-',
        d.nominal != null ? Number(d.nominal).toLocaleString('id-ID') : '-',
        d.metodePembayaran ?? '-',
        d.statusTransaksi ?? '-'
    ]);

    doc.autoTable({
        head,
        body,
        startY,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 }
    });

    doc.save(`EmberLord_Donasi_Dana_${Date.now()}.pdf`);
}

/**
 * Ekspor tabel Korban Terdaftar ke PDF.
 */
function exportPdfKorban() {
    if (!listKorban || listKorban.length === 0) {
        alert('Tidak ada data korban untuk diekspor.');
        return;
    }

    const { doc, startY } = _buatDokumenPDF('Laporan Profil Korban Terdaftar');

    const head = [['ID', 'Nama Korban', 'Usia', 'Kelompok Rentan', 'Kondisi Kesehatan', 'Alamat / Lokasi']];
    const body = listKorban.map(k => [
        k.id ?? '-',
        k.namaKorban ?? '-',
        k.usia != null ? `${k.usia} thn` : '-',
        k.kelompokRentan ?? '-',
        k.kondisiKesehatan ?? '-',
        k.alamat ?? '-'
    ]);

    doc.autoTable({
        head,
        body,
        startY,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 }
    });

    doc.save(`EmberLord_Korban_${Date.now()}.pdf`);
}