# Xerumi API

Xerumi API adalah REST API berbasis Node.js yang menyediakan berbagai endpoint utilitas, AI, scraping, downloader, pencarian, dan konten acak (random). API ini dirancang modular, setiap fitur dipisahkan dalam route terdedikasi agar mudah dikembangkan dan dipelihara.

Dibuat oleh **aerixxx**.

---

## Teknologi

- Node.js
- Express.js
- CommonJS module system
- RESTful API
- Modular route loader

---

## Struktur Dasar

/routes ├─ Aiimg.js ├─ Nswf.js ├─ Rmke.js ├─ ai-hydromind.js ├─ ai-openai.js ├─ chatbot.js ├─ roleAI.js ├─ Aalwqanine.js ├─ AnimeDao.js ├─ Belita.js ├─ Jadwaljawa.js ├─ Komjkj.js ├─ New.js ├─ anime-news.js ├─ home.js ├─ kompa.js ├─ api.js ├─ limit.js ├─ Downspoty.js ├─ Instagram.js ├─ capcut.js ├─ douyin.js ├─ snackvidio.js ├─ tiktok.js ├─ videy.js ├─ Iphone-chat.js ├─ Paketikok.js ├─ Pust.js ├─ random-bluearchive.js ├─ random-nsfw.js ├─ random-papayang.js ├─ random-waifu.js ├─ remove-clothes.js ├─ Lirik.js ├─ Spotipys.js ├─ fdroid.js ├─ googleimage.js ├─ happymod.js ├─ npm.js ├─ playstore.js ├─ search-youtube.js ├─ sfile.js ├─ tiktok-search.js ├─ xnxx.js ├─ Gote.js ├─ Hdl.js ├─ Mailsend.js ├─ Nsfwcek.js ├─ Rbg.js ├─ Togibli.js ├─ emojimix.js ├─ hostinfo.js └─ tts.js

---

## Fitur API

### AI & Chat
- **Aiimg** – Generate gambar berbasis AI.
- **ai-openai** – Integrasi OpenAI (text-based AI).
- **ai-hydromind** – AI alternatif / custom logic.
- **chatbot** – Chat AI endpoint.
- **roleAI** – AI dengan role / persona khusus.
- **Iphone-chat** – Simulasi gaya chat iPhone.
- **tts** – Text to Speech.

### Anime & Otaku
- **AnimeDao** – Data & streaming info anime.
- **anime-news** – Berita anime terbaru.
- **random-waifu** – Gambar waifu acak.
- **random-bluearchive** – Konten Blue Archive acak.

### News & Informasi
- **Belita** – Berita umum.
- **kompa** – Scraping Kompas.
- **New** – News aggregator.
- **Jadwaljawa** – Informasi jadwal Jawa.
- **hostinfo** – Informasi host / server.

### Downloader & Media
- **tiktok** – Downloader video TikTok.
- **tiktok-search** – Pencarian video TikTok.
- **Instagram** – Downloader Instagram.
- **Downspoty / Spotipys** – Downloader Spotify.
- **douyin** – Downloader Douyin.
- **snackvidio** – Downloader SnackVideo.
- **capcut** – Asset / template CapCut.
- **videy** – Video downloader.
- **sfile** – Downloader Sfile.

### Search & Scraping
- **googleimage** – Pencarian gambar Google.
- **search-youtube** – Pencarian YouTube.
- **npm** – Informasi package NPM.
- **playstore** – Data aplikasi Play Store.
- **fdroid** – Data aplikasi F-Droid.
- **happymod** – Data aplikasi HappyMod.
- **Pust** – Utility pencarian teks.
- **Lirik** – Pencarian lirik lagu.

### Utility & Tools
- **api** – Informasi API & status.
- **home** – Landing endpoint.
- **limit** – Rate limit / kuota request.
- **emojimix** – Kombinasi emoji.
- **Gote / Hdl / Togibli** – Endpoint utilitas tambahan.
- **Mailsend** – Kirim email.
- **Rbg** – Remove background image.
- **Rmke** – Remake / reprocess konten.
- **Paketikok** – Paket data / utility provider.

### Random & NSFW
- **random-nsfw** – Konten NSFW acak.
- **Nsfwcek** – Deteksi NSFW.
- **Nswf** – NSFW endpoint.
- **xnxx** – Scraping konten dewasa.
- **remove-clothes** – AI image manipulation.
- **random-papayang** – Konten random.

---

## Spesifikasi Umum

- Method: `GET` / `POST`
- Response: JSON
- Error handling terpusat
- Modular route loader
- Mudah ditambahkan route baru
- Support async/await

---

## Contoh Response Umum

```json
{
  "status": true,
  "creator": "aerixxx",
  "data": {}
}


---

Catatan

Beberapa endpoint membutuhkan parameter query tertentu.

Endpoint tertentu memiliki limit request.

Konten NSFW disediakan terpisah sesuai route.



---

Lisensi

Private / Internal Use
© aerixxx