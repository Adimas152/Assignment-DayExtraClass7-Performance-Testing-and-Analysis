# Assignment Day Extra Class 7 - Performance Testing and Analysis (JMeter)

## 📌 Deskripsi
Assignment ini bertujuan untuk melakukan **Performance Testing** pada website **Resonance** menggunakan **Apache JMeter**, kemudian melakukan **analisa hasil testing** berdasarkan metrik utama seperti:
- Response Time
- Latency
- Error Rate
- Throughput

Target website yang diuji: **https://resonance.dibimbing.id/**

---

## 🎯 Objectives
1. Mengidentifikasi komponen-komponen report performance testing
2. Melakukan performance testing menggunakan JMeter
3. Generate summary report performance testing
4. Menganalisis summary report performance testing
5. Memberikan rekomendasi dan saran terkait performa aplikasi yang diuji

---

## 🧰 Tools
- Apache JMeter
- HTML Report (JMeter Dashboard Report)

---

## 🗂️ Struktur File di Repository
- `*.jmx` → Test plan JMeter
- `*.jtl` → Result log per skenario (5 users, 25 users, 50 users)
- Folder `result-5users/`, `result-25users/`, `result-50users/` → Export HTML Dashboard Report
- `Analysis Report.pdf` → Dokumen analisa lengkap + screenshot hasil report

---

## 🧪 Skenario Performance Testing
Pengujian dilakukan menggunakan 3 variasi jumlah user:
- **5 Users**
- **25 Users**
- **50 Users**

Endpoint yang diuji (sesuai test plan):
- POST Login
- POST Create User
- POST Create Ticket
- GET My Ticket
- GET Ticket Active

---

## 📊 Ringkasan Hasil Utama (Highlight)

### ✅ Skenario 25 Users (berdasarkan Summary Table)
- Total: **35.702 samples**, **15.756 fail**, **error rate 44,13%**
- Throughput total: **197,10 transaksi/detik**
- Endpoint paling banyak error:
    - **GET My Ticket**: 4.453 samples, 3.943 fail (**88,55%**)
    - **Get Ticket Active**: 4.451 samples, 3.888 fail (**87,35%**)
    - **POST Create Ticket**: 4.459 samples, 3.944 fail (**88,45%**)
    - **POST Create User**: 4.471 samples, 3.981 fail (**89,04%**)
- Endpoint yang stabil:
    - **POST Login**: 4.467 samples, fail **0 (0,00%)**

Kesimpulan singkat: Pada 25 users sistem mulai tidak stabil karena mayoritas request utama gagal walaupun throughput terlihat tinggi.

---

### ❌ Skenario 50 Users (berdasarkan Summary Table)
- Total: **36.333 samples**, **16.643 fail**, **error rate 45,81%**
- Throughput total: **200,13 transaksi/detik**
- Endpoint paling banyak error:
    - **GET My Ticket**: 4.518 samples, 4.234 fail (**93,71%**)
    - **Get Ticket Active**: 4.512 samples, 4.231 fail (**93,77%**)
    - **POST Create Ticket**: 4.529 samples, 4.091 fail (**90,33%**)
    - **POST Create User**: 4.558 samples, 4.087 fail (**89,67%**)
- Endpoint yang stabil tapi melambat:
    - **POST Login**: 4.554 samples, fail **0 (0,00%)**, average **550,82 ms**

Jenis error dominan (dari ringkasan error):
- **500/Internal Server Error** = **16.326 error** (98,10% dari semua error)
- **Test failed: code expected to equal ...** = **317 error** (1,90% dari semua error)

Kesimpulan singkat: Pada 50 users sistem cenderung overload, error 500 mendominasi dan max response time naik tinggi (hingga 13.433 ms).

---

## 🧾 Penjelasan Error yang Muncul
- **500/Internal Server Error**  
  Mengindikasikan server gagal memproses request, biasanya terkait overload resource / query database berat / koneksi database penuh.
- **“Test failed: code expected to equal …”**  
  Mengindikasikan **Response Assertion gagal**, karena test mengharapkan status code tertentu (misalnya 200) namun server mengembalikan code berbeda (seringnya 500 saat overload).

---

## ✅ Rekomendasi & Saran Perbaikan
1. Fokus utama perbaikan pada **stabilitas backend** karena error dominan adalah **500**.
2. Evaluasi **query database + indexing + connection pooling**, terutama untuk endpoint:
    - GET My Ticket
    - Get Ticket Active
3. Pertimbangkan **caching** untuk endpoint GET yang sering dipanggil agar tidak membebani database.
4. Terapkan proteksi saat overload seperti **rate limiting / queue / graceful fallback** agar tidak langsung menghasilkan banyak 500.
5. Gunakan metrik percentile (P95/P99) sebagai target performa, bukan hanya average.

---
