# Spinwheel Project

Spinwheel app berbasis Next.js untuk mengelola hadiah, background, dan admin panel.

## Current Behavior

- Background image **disimpan di VPS filesystem**
- Upload image masuk ke:
  - `public/uploads/backgrounds/`
- Background aktif disimpan di:
  - `public/uploads/backgrounds/current.json`
- Jadi untuk testing sekarang: **ya, image ditaruh di VPS**

## Tech Stack

- Next.js 16
- React 19
- PostgreSQL
- JWT auth via cookie
- Local file storage untuk background image

## Environment Setup

Copy env example:

```bash
cp .env.example .env
```

Lalu isi value penting:
- `JWT_SECRET`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_MAX`

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

Buka:
- App: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

## Production Build

```bash
npm run build
npm start
```

## Docker Deployment

Project ini sudah disiapkan untuk dijalankan via Docker.

### Build image

```bash
docker build -t spinwheel-app .
```

### Run container

```bash
docker run -d \
  --name spinwheel-app \
  -p 3010:3000 \
  -v spinwheel_backgrounds:/app/public/uploads/backgrounds \
  --restart unless-stopped \
  spinwheel-app
```

### Or use Docker Compose

```bash
docker compose up -d --build
```

## Important: Persistent Storage

Karena background image disimpan ke filesystem container, maka **WAJIB** pakai volume persisten:

- mount ke path: `/app/public/uploads/backgrounds`

Kalau volume tidak dipasang:
- upload background bisa hilang saat container di-recreate
- image bisa reset

## VPS Lain: Yang Harus Disiapkan

Kalau next user mau deploy project ini ke VPS lain, siapkan:

### 1. Server basics
- Docker
- Docker Compose plugin
- Reverse proxy (opsional tapi disarankan)
- Domain/subdomain
- SSL (Let's Encrypt / Nginx Proxy Manager / Caddy)

### 2. Source code
Clone project ke server:

```bash
git clone <repo-url>
cd dupoin_prj_spinwheel
```

### 3. PostgreSQL access
App pakai PostgreSQL via environment variables.

Isi `.env`:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_MAX`

Dan auth admin pakai tabel:
- `spinwheel_users`

### 4. Persistent volume
Wajib mount:
- `/app/public/uploads/backgrounds`

### 5. Port mapping
Default container:
- internal port `3000`

Contoh external:
- `3010:3000`

### 6. Reverse proxy example
Misal pakai Nginx:
- domain `spinwheel.example.com`
- proxy ke `http://127.0.0.1:3010`

## Recommended Next Improvements

Untuk deployment lintas VPS yang lebih rapi, disarankan next step:

1. pindahkan background upload ke object storage:
   - Supabase Storage
   - Cloudflare R2
   - S3

Dengan begitu app jadi lebih portable dan tidak tergantung filesystem lokal VPS.

## Current Limitation

Saat ini background image memang bisa ditaruh di VPS dan itu valid untuk testing/production sederhana.

Tapi kalau nanti:
- multi-server
- auto-scaling
- migrate VPS
- container sering recreate

maka storage object (S3/R2/Supabase Storage) akan lebih aman dibanding local filesystem.
