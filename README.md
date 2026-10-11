# Galaksi Kita

Web roadmap kenangan berdua bertema galaksi.

- `index.html`: halaman pengunjung. Hanya melihat, mendengar musik, dan menjelajah.
- `admin.html`: halaman pemilik di alamat `/admin`. Perlu login. Tambah dan hapus kenangan, unggah foto, atur nama, tanggal, dan musik.
- Data, foto, dan musik disimpan di Supabase. Hosting di Vercel, kode di GitHub.

## Langkah 1: Supabase (database dan penyimpanan foto)

1. Daftar di supabase.com, klik **New project**. Isi nama bebas, buat password database, pilih region terdekat (misalnya Singapore).
2. Buka **SQL Editor > New query**. Buka file `supabase/schema.sql`, ganti semua `GANTI_DENGAN_EMAIL_KAMU` dengan emailmu, tempel seluruh isinya, lalu klik **Run**.
3. Buka **Authentication > Users > Add user > Create new user**. Isi emailmu (harus sama dengan email di langkah 2) dan kata sandi, centang **Auto Confirm User**.
4. Buka **Authentication > Sign In / Providers** (atau Settings), matikan **Allow new users to sign up**. Ini mencegah orang lain mendaftar.
5. Buka **Project Settings > API**. Salin **Project URL** dan **anon public key**.

## Langkah 2: Isi config.js

Buka `config.js`, ganti `GANTI_DENGAN_PROJECT_URL` dan `GANTI_DENGAN_ANON_KEY` dengan dua nilai dari langkah 1 nomor 5.

## Langkah 3: GitHub

1. Buat repository baru di github.com (boleh private), misalnya `galaksi-kita`.
2. Klik **Add file > Upload files**, tarik semua isi folder ini (termasuk folder `supabase`), lalu **Commit changes**.

Atau lewat terminal di dalam folder ini:

```
git init
git add .
git commit -m "Galaksi Kita"
git branch -M main
git remote add origin https://github.com/NAMAMU/galaksi-kita.git
git push -u origin main
```

## Langkah 4: Vercel

1. Masuk ke vercel.com dengan akun GitHub, klik **Add New > Project**, lalu pilih repository `galaksi-kita`.
2. **Framework Preset**: Other. Kosongkan Build Command dan Output Directory. Klik **Deploy**.
3. Setelah selesai, kamu dapat alamat seperti `https://galaksi-kita.vercel.app`.

## Langkah 5: Hubungkan alamat ke Supabase

Di Supabase buka **Authentication > URL Configuration**, isi **Site URL** dengan alamat Vercel-mu, lalu simpan.

## Cara memakai

- **Pengunjung**: kirim alamat utama, misalnya `https://galaksi-kita.vercel.app/`. Halaman ini tidak punya tombol edit dan tidak menautkan ke halaman pemilik.
- **Pemilik**: buka `https://galaksi-kita.vercel.app/admin`, masuk dengan email dan kata sandi, lalu tambah kenangan. Foto dan musik langsung bisa dilihat pengunjung.

## Keamanan

Pembatasan akses dijaga oleh Supabase, bukan oleh tombol yang disembunyikan. Siapa pun boleh membaca, tetapi hanya akun dengan emailmu yang boleh menulis atau mengunggah. Simpan kata sandi dengan baik dan jangan bagikan `/admin` beserta kata sandinya.

## Batas paket gratis

- Penyimpanan Supabase gratis sekitar 1 GB. Foto otomatis dikecilkan sebelum diunggah.
- Project Supabase gratis dijeda kalau tidak ada aktivitas sekitar seminggu. Buka halamannya sesekali, atau aktifkan kembali dari dashboard Supabase.

## Mencoba di komputer sendiri

Jalankan `npx serve .` di folder ini, lalu buka alamat yang muncul. Membuka file langsung dengan klik dua kali bisa gagal memuat data.
