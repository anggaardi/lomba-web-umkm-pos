Dokumentasi Konsep Sistem (Draft .md)
Kamu bisa copy–paste isi di bawah ini ke file misalnya documentation.md / PROPOSAL_WEBDEV_FUSHIONTECHXKOMIK2026.md dan edit data tim, judul, dsb.
SmartBizFNB – Platform Manajemen UMKM F&B Multi-Tenant
1. Latar Belakang

UMKM di sektor Food & Beverage (F&B) sering menghadapi masalah dalam pengelolaan operasional harian, seperti pencatatan pesanan yang masih manual, stok bahan baku yang tidak terkontrol, serta kesulitan memantau performa penjualan secara real-time. Kondisi ini menyebabkan:

    Pemborosan bahan baku karena stok tidak terdata dengan baik.
    Antrian panjang dan kesalahan pesanan di kasir.
    Pemilik usaha kesulitan melihat laporan penjualan harian/bulanan.
    Sulit mengelola lebih dari satu outlet atau cabang.
    Di sisi lain, banyak UMKM F&B yang belum siap membangun sistem sendiri, baik dari sisi biaya maupun kemampuan teknis. Dibutuhkan solusi multi-tenant: satu platform yang dapat digunakan banyak UMKM secara bersamaan, namun data tiap UMKM tetap terpisah, aman, dan tidak saling mengganggu.
    SmartBizFNB hadir sebagai platform manajemen bisnis F&B multi-tenant yang membantu UMKM mengelola menu, pesanan, stok, dan laporan penjualan secara terintegrasi, dengan fokus pada:
    Smart: logika sistem yang membantu keputusan (misalnya rekomendasi restock bahan).
    Scalable: siap digunakan banyak tenant (UMKM) dan mudah dikembangkan.
    Secure: pemisahan data antar tenant yang ketat dan aman.

2. Tujuan Sistem
    Membantu UMKM F&B mengelola operasional harian
        Pencatatan pesanan (POS) yang rapi dan real-time.
        Pengelolaan menu, harga, diskon, dan kategori produk.
    Meningkatkan kontrol stok & bahan baku
        Monitoring stok yang terhubung langsung dengan pesanan.
        Notifikasi stok menipis dan rekomendasi restock.
    Memberikan insight bisnis yang mudah dipahami
        Laporan penjualan (harian/mingguan/bulanan).
        Analisis produk terlaris dan jam ramai.
    Menyediakan platform multi-tenant yang aman dan terisolasi
        Satu sistem untuk banyak UMKM.
        Data tiap tenant terpisah dan tidak saling terlihat.
    Mendukung skenario pertumbuhan
        Dukungan multi-outlet untuk satu tenant.
        Siap integrasi ke kanal lain (misal marketplace, delivery, atau payment gateway) di masa depan.

3. Konsep Multi-Tenant
3.1 Definisi

Multi-tenant berarti satu aplikasi dan satu deployment dapat digunakan oleh banyak UMKM (tenant) sekaligus. Setiap tenant memiliki:

    Data bisnis sendiri (menu, stok, order, karyawan, laporan).
    Pengaturan sendiri (logo, nama brand, pajak, metode pembayaran).
    User dan role sendiri (owner, kasir, staf dapur).

3.2 Prinsip Utama Multi-Tenant di Sistem Ini

    Isolasi Data
        Setiap record penting (Tenant, Branch, User, Product, Transaction, Ingredient, dll.) memiliki kolom tenantId.
        Query selalu difilter dengan tenantId dari sesi/login (Server-Side Enforcement).
        Tidak ada akses lintas tenant dalam query normal.
    Isolasi Akses (Auth & Role)
        User hanya bisa mengakses data tenant tempat dia terdaftar.
        Role (SUPER_ADMIN, ADMIN, STAFF) membatasi fitur yang bisa diakses.
    Konfigurasi Dinamis Per Tenant (Smart Settings)
        Setiap Tenant memiliki konfigurasi unik yang disimpan dalam kolom JSON `settings`.
        Konfigurasi meliputi: Pajak (PPN), Service Charge, serta kustomisasi Struk (Header/Footer).
        Data konfigurasi ditarik secara otomatis saat Kasir (STAFF) membuka POS berdasarkan identitas tenant mereka.

4. Fitur Utama (Minimal Wajib Ada)

Fitur-fitur ini penting untuk memenuhi kriteria teknis minimum, arsitektur backend, dan penilaian non-teknis (UX, keamanan, skalabilitas).
4.1 Manajemen Tenant & Akun

    Registrasi Tenant (UMKM)
        Form pendaftaran untuk pemilik usaha (nama usaha, kategori F&B, alamat, kontak).
        Otomatis membuat satu tenant dan satu user owner.
    Manajemen User Per Tenant
        Owner dapat membuat akun: manager, kasir, staf_dapur.
        Pengaturan role dan hak akses (kasir hanya akses POS, staf dapur hanya lihat antrian order, owner lihat semua).

    Dampak ke konflik kritis:

        Mengurangi risiko data tercampur karena setiap user dikaitkan dengan tenant_id.
        Menghindari akses tidak sah ke data tenant lain.

4.2 POS (Point of Sale) Dasar

    Antarmuka kasir untuk:
        Memilih outlet (jika UMKM punya lebih dari satu cabang).
        Memilih meja/take-away (opsional).
        Menambahkan item ke keranjang dari daftar menu.
        Menghitung total otomatis, diskon, pajak, service charge.
        Mencatat metode pembayaran (cash, e-wallet, transfer).
    Status pesanan:
        Draft → Paid → Completed (opsional: Cancelled).

    Dampak ke konflik kritis:

        Perlu atomic update saat membuat order dan mengurangi stok.
        Harus memastikan order milik tenant X tidak bisa diakses tenant Y.

4.3 Manajemen Menu & Kategori

    CRUD menu:
        Nama, kategori (makanan, minuman, snack), harga, status (aktif/nonaktif).
        Opsi variasi (misal: size S/M/L, hot/ice) – bisa disederhanakan dulu.
    Kategori menu dikelola per tenant.

    Dampak ke konflik kritis:

        Pastikan menu selalu di-filter tenant_id dan (jika relevan) outlet_id.

4.4 Manajemen Inventory & Bahan Baku

    Daftar bahan baku:
        Nama bahan, satuan (gram, liter, pcs), stok saat ini, stok minimum.
    Pencatatan mutasi stok:
        Stok masuk (pembelian/penerimaan bahan).
        Stok keluar (terpakai dari pesanan POS).
    Otomatis pengurangan stok ketika order Paid:
        Mapping sederhana: 1 menu = konsumsi beberapa bahan baku (basic recipe).

    Dampak ke konflik kritis:

        Butuh mekanisme transaksi database atau locking untuk menghindari double-reduce stok saat banyak order bersamaan.
        Butuh validasi agar stok tidak negatif (atau set minimal 0 dengan warning).

4.5 Laporan Penjualan & Insight Dasar

    Laporan per tenant:
        Total penjualan per hari/minggu/bulan.
        Top menu terlaris.
        Rekap transaksi per outlet.
    Export sederhana (PDF/CSV) opsional, atau cukup tampilan di web.

    Dampak ke konflik kritis:

        Query agregasi harus selalu filter tenant_id.
        Pastikan laporan hanya berdasarkan order dengan status Paid/Completed.

4.6 Autentikasi & Autorisasi

    Login menggunakan email + password (atau bisa tambahkan OTP di masa depan).
    Session management (misal NextAuth dengan JWT/session):
        Menyimpan user_id, tenant_id, role.
    Middleware/guard:
        Setiap request ke API dashboard harus melewati cek auth + tenant.

    Dampak ke konflik kritis:

        Jika guard tidak konsisten, risiko terbesar adalah data bocor antar tenant.
        Middleware wajib standar: ambil tenant_id dari session, jangan dari client input bebas.

5. Fitur Tambahan “Smart” & Diferensiasi (Nilai Inovasi)

Ini fitur yang bisa menaikkan nilai di aspek Inovasi & Skalabilitas, dan bisa diimplementasikan bertahap.
5.1 Smart Restock Recommendation

    Sistem menganalisis:
        Riwayat pemakaian bahan baku.
        Kecepatan habisnya stok (pemakaian per hari).
    Memberi rekomendasi:
        Bahan mana yang harus direstock.
        Estimasi jumlah restock berdasarkan pola 7/14 hari terakhir.
    Notifikasi sederhana di dashboard: “Bahan X diperkirakan habis dalam 2 hari, rekomendasi restock: 3 kg”.

5.2 Antrian Dapur Real-Time

    View khusus untuk staf_dapur:
        List order yang baru masuk.
        Status per item (sedang disiapkan, siap diantar).
    Update status real-time (bisa pakai polling/simple revalidate dulu, tidak harus websocket).

5.3 QR Order per Meja / Outlet

    Generate QR per meja atau per tenant:
        Pelanggan scan → buka halaman order sederhana.
        Pelanggan pilih menu → kirim pesanan → masuk ke sistem POS sebagai draft order kasir.
    Kasir hanya perlu konfirmasi & terima pembayaran.

5.4 Integrasi WhatsApp (Opsional / Future)

    Kirim ringkasan pesanan ke nomor pelanggan via WhatsApp (bisa pakai link template dahulu, belum perlu API resmi).
    Misal: https://wa.me/?text=Ringkasan+pesanan+Anda+....

6. Desain Database Tingkat Tinggi

    Catatan: ini gambaran konseptual, tidak harus 100% sama di implementasi, tapi menunjukkan arsitektur backend dan skala multi-tenant.
    Tabel inti (minimal):

    tenants
        id
        name
        business_type (F&B, coffee shop, dll.)
        address, phone
        settings (JSON opsional: pajak, service charge, dsb.)
    users
        id
        tenant_id
        name
        email
        password_hash
        role (OWNER, MANAGER, CASHIER, KITCHEN)
    outlets
        id
        tenant_id
        name
        address
    products
        id
        tenant_id
        name
        category
        price
        is_active
    ingredients
        id
        tenant_id
        name
        unit (gram, liter, pcs)
        current_stock
        min_stock
    recipes (relasi produk → bahan baku)
        id
        tenant_id
        product_id
        ingredient_id
        qty_per_product
    stock_movements
        id
        tenant_id
        ingredient_id
        type (IN, OUT)
        quantity
        source (PURCHASE, SALE, ADJUSTMENT)
        created_at
    orders
        id
        tenant_id
        outlet_id
        order_number
        status (DRAFT, PAID, COMPLETED, CANCELLED)
        total_amount
        payment_method
        created_at
    order_items
        id
        order_id
        product_id
        quantity
        price
        subtotal

7. Pencegahan Konflik Kritis di Lingkungan Multi-Tenant

Bagian ini penting untuk meyakinkan juri di aspek Keamanan, Efisiensi, dan Skalabilitas.
7.1 Isolasi Data Tenant

    Semua tabel bisnis wajib punya tenant_id.
    Middleware backend:
        Mendapatkan tenant_id dari session login.
        Memastikan semua query baca/tulis selalu menyertakan filter tenant_id.
    Tidak boleh menerima tenant_id mentah dari body request untuk operasi kritis (harus dari session).

7.2 Konsistensi Stok & Order

    Saat order dibuat dan dibayar:
        Gunakan transaksi database:
            Buat order + order_items.
            Hitung total konsumsi bahan baku berdasarkan recipes.
            Insert stock_movements dan update current_stock.
        Jika salah satu step gagal → rollback.
    Cegah stok negatif:
        Validasi: jika stok kurang, tampilkan peringatan di POS (bisa tetap izinkan dengan flag “stok minus” atau blok, tergantung desain).

7.3 Autorisasi & Hak Akses

    Middleware auth & role:
        Cek apakah user login.
        Cek role sesuai endpoint:
            OWNER/MANAGER: boleh akses laporan, setting tenant.
            CASHIER: akses POS & daftar menu.
            KITCHEN: akses antrian dapur saja.
    Semua endpoint yang mengakses data tenant wajib:
        Verify user.tenant_id === data.tenant_id.

7.4 Audit Log Sederhana

    Minimal log:
        Pencatatan siapa yang membuat order, mengubah stok, dan membuat user baru.
    Ini membantu debugging jika ada konflik data atau error di demo.

8. User Interface & User Experience (High-Level)

    Dashboard Owner
        Ringkasan penjualan hari ini.
        Notifikasi stok menipis.
        Grafik penjualan sederhana.
    Halaman POS (Kasir)
        Layout sederhana: kategori di sisi kiri, daftar menu di tengah, keranjang di kanan.
        Optimasi untuk tablet / layar kecil.
        Tombol besar, warna kontras tapi tidak berlebihan.
    Halaman Inventory
        Tabel bahan baku + indikator warna (merah = stok kurang, kuning = mendekati minimum, hijau = aman).
    Halaman Laporan
        Filter tanggal, outlet, dan metode pembayaran.
        Tabel + grafik ringkas.

9. Keamanan & Efisiensi

    Keamanan
        Hash password (bcrypt atau sejenis).
        Validasi input di backend (panjang string, format email, dsb.).
        Hindari menampilkan error internal ke user (gunakan pesan generik, log detail di server).
    Efisiensi
        Query menggunakan indeks pada kolom tenant_id, created_at.
        Pagination untuk tabel besar (order, stok).
        Caching ringan (opsional) untuk dashboard ringkasan.

10. Skalabilitas & Roadmap Pengembangan

    Skalabilitas Jangka Pendek
        Arsitektur multi-tenant dengan satu database namun terstruktur (bisa nanti di-split per tenant jika perlu).
        Dukungan multi-outlet per tenant.
    Roadmap Fitur Lanjutan
        Integrasi pembayaran online / e-wallet.
        Integrasi dengan marketplace atau layanan delivery.
        Modul loyalty (poin pelanggan).
        Paket langganan (subscription) per tenant.

11. Dokumentasi & Demo

    Proposal Ide (dokumen ini dapat dijadikan dasar):
        Latar belakang, tujuan, solusi, arsitektur, dan fitur utama.
    Dokumentasi Teknis (PDF terpisah)
        Diagram arsitektur sistem (frontend–backend–database).
        ERD database.
        Flow utama (create order, update stok, generate report).
    Video Demo (≤ 5 menit)
        Alur: login sebagai owner → lihat dashboard → tambah menu & stok → login kasir → buat order → lihat stok berkurang & laporan penjualan.
    Link Deployment & Source Code
        Deployment di Vercel / Netlify / hosting lain.
        Repository GitHub (readme menjelaskan cara running lokal + env).

Ringkasannya
Fitur wajib: multi-tenant auth + role, POS dasar, manajemen menu, inventory terhubung dengan order, laporan, dan dashboard.
Fitur “smart”: rekomendasi restock, antrian dapur, QR order, insight penjualan.
Pencegahan konflik kritis: semua tabel pakai tenant_id, query selalu terfilter, transaksi database untuk order & stok, middleware auth/role yang ketat, audit log sederhana.
Kalau kamu mau, langkah berikutnya aku bisa: (1) menyesuaikan struktur di atas dengan stack yang sudah kamu pakai di project ini (Next.js, Prisma, dsb), atau (2) bikin versi singkat khusus untuk proposal PDF dan versi teknis khusus dokumentasi sistem.


# Dokumentasi Fitur Finansial: Diskon, Pajak, & Service Charge
Dokumen ini merinci logika perhitungan finansial dan skenario operasional untuk platform SmartBizFNB.

## 1. Komponen Finansial

### 1.1 Pajak (Tax)
*   **Default**: PPN 11% (dapat diatur per tenant).
*   **Metode**: 
    *   *Tax-Exclusive*: Pajak ditambahkan di atas subtotal (Harga + Pajak).
    *   *Tax-Inclusive*: Pajak sudah termasuk dalam harga jual (Harga Nett).

### 1.2 Biaya Layanan (Service Charge)
*   **Default**: 5% (dapat diatur per tenant).
*   **Karakteristik**: Dihitung dari subtotal sebelum pajak.

### 1.3 Diskon (Discount)
*   **Diskon Per Item**: Potongan harga untuk menu spesifik.
*   **Diskon Global**: Potongan harga untuk total seluruh transaksi.
*   **Tipe**: Persentase (%) atau Nominal (Rp).

---

## 2. Rumus Perhitungan Standar
Urutan perhitungan sangat penting untuk menghindari kesalahan nilai:

1.  **Gross Subtotal**: `Sum(Price * Quantity)`
2.  **Item Discount**: `Sum(Item_Discount_Amount)`
3.  **Net Subtotal**: `Gross Subtotal - Item Discount`
4.  **Service Charge**: `Net Subtotal * Service_Charge_%`
5.  **Taxable Amount**: `Net Subtotal + Service Charge`
6.  **Tax (PPN)**: `Taxable Amount * Tax_%`
7.  **Global Discount**: `(Net Subtotal + Service Charge + Tax) * Global_Discount_%` (atau nominal)
8.  **Grand Total**: `(Taxable Amount + Tax) - Global Discount`

---

## 3. Skenario Operasional (Logic Test Cases)

### 3.1 Skenario Diskon Bertumpuk
**Kasus**: Pelanggan membeli Kopi (Rp 20.000) dengan diskon item 10%, ditambah diskon member (global) 5%. Pajak 11% dan Service 5%.
*   **Harga Kopi setelah diskon item**: 20.000 - 2.000 = 18.000.
*   **Service Charge (5%)**: 18.000 * 5% = 900.
*   **Pajak (11%)**: (18.000 + 900) * 11% = 2.079.
*   **Subtotal sebelum diskon global**: 18.000 + 900 + 2.079 = 20.979.
*   **Diskon Global (5%)**: 20.979 * 5% = 1.049.
*   **Grand Total**: 20.979 - 1.049 = **19.930**.

### 3.2 Skenario Stok Menipis (Race Condition)
**Kasus**: Stok Susu sisa 1 liter (cukup untuk 4 cup). Dua kasir menekan tombol "Bayar" secara bersamaan untuk pesanan masing-masing 3 cup.
*   **Proses**: Sistem menggunakan *Database Transaction* (Prisma `$transaction`).
*   **Hasil**: Kasir pertama berhasil (stok jadi 0.25L). Kasir kedua gagal dengan pesan: *"Stok bahan baku tidak mencukupi untuk pesanan ini"*.
*   **Tujuan**: Menjamin integritas data inventaris di lingkungan multi-user.

### 3.3 Skenario Tax-Inclusive (Harga Nett)
**Kasus**: Menu "Nasi Goreng" harga Rp 25.000 (Sudah termasuk Pajak 11%).
*   **Dasar Pengenaan Pajak (DPP)**: 25.000 / 1.11 = 22.522.
*   **Nilai Pajak**: 25.000 - 22.522 = 2.478.
*   **Tujuan**: Laporan pendapatan (Revenue) dicatat sebesar 22.522, sedangkan 2.478 dicatat sebagai Hutang Pajak.

### 3.4 Skenario Pembulatan (Rounding)
**Kasus**: Total transaksi menghasilkan angka desimal seperti Rp 19.930,50.
*   **Kebijakan**: Pembulatan ke bawah (Floor) atau ke atas (Ceiling) ke kelipatan Rp 100 terdekat sesuai pengaturan Tenant.
*   **Hasil**: Rp 19.900 atau Rp 20.000.

### 3.5 Skenario Void (Pembatalan Transaksi)
**Kasus**: Transaksi sudah selesai tapi pelanggan ingin membatalkan karena salah input.
*   **Proses**: Admin melakukan Void.
*   **Dampak**: 
    1. Status transaksi menjadi `CANCELLED`.
    2. Stok bahan baku yang terpotong otomatis dikembalikan (Restored) berdasarkan `Recipe`.
    3. Log aktivitas mencatat: *"User [X] melakukan Void pada Transaksi [Y] - Alasan: Salah Input"*.