# Bot Subscription

Discord bot untuk sistem subscription management dengan integrasi Google Sheets.

## 📋 Prerequisites

- Node.js v18.0.0 atau lebih baru
- Discord Bot Token dari [Discord Developer Portal](https://discord.com/developers/applications)
- Google Cloud Project dengan Sheets API enabled
- Service Account credentials

## 🚀 Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/vaisalreksi/bot-subscription.git
   cd bot-subscription
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   
   Copy `.env.example` ke `.env` dan isi semua nilai:
   ```bash
   cp .env.example .env
   ```

4. **Deploy slash commands**
   ```bash
   npm run deploy-commands
   ```

5. **Jalankan bot**
   ```bash
   npm run dev
   ```

## 📜 Scripts

| Script | Command | Deskripsi |
|--------|---------|-----------|
| `npm run dev` | `nodemon src/index.js` | Development mode dengan hot-reload |
| `npm start` | `node src/index.js` | Production mode |
| `npm run build` | `node scripts/build.js` | Build ke folder `dist/` |
| `npm run deploy-commands` | Deploy slash commands ke Discord |

## 📁 Struktur Folder

```
bot-subscription/
├── src/
│   ├── index.js              # Entry point utama
│   ├── deploy-commands.js    # Script deploy slash commands
│   ├── commands/             # Folder untuk commands
│   │   ├── ping.js           # Command /ping
│   │   ├── profile.js        # Command /profile
│   │   ├── check.js          # Command /check
│   │   ├── payment.js        # Command /payment
│   │   ├── addbill.js        # Command /addbill
│   │   ├── subscription.js   # Command /subscription
│   │   └── reset.js          # Command /reset
│   └── services/
│       └── googleSheets.js   # Google Sheets API service
├── scripts/
│   └── build.js              # Build script
├── .env                      # Environment variables (tidak di-commit)
├── .env.example              # Template environment
├── .gitignore
├── nodemon.json              # Nodemon configuration
├── package.json
└── README.md
```

## 🤖 Slash Commands

| Command | Deskripsi |
|---------|-----------|
| `/ping` | Cek respon bot dan latency |
| `/profile` | Lihat profil Discord kamu |
| `/check` | Cek tagihan subscription (VPS/Google/Domain) |
| `/payment` | Record pembayaran dengan bukti gambar |
| `/addbill` | Tambah tagihan dengan nominal |
| `/subscription` | Lihat data subscription dalam tabel |
| `/reset` | Reset data subscription (dengan password) |

### Detail Commands

#### `/check type:<vps/google/domain>`
Cek tagihan berdasarkan username:
- Username `cucudukun`: membaca dari kolom F15 (Google) atau G15 (VPS/Domain)
- Username lain: membaca dari kolom D15 (Google) atau E15 (VPS/Domain)

#### `/payment type:<vps/google/domain> proof:<image>`
Record pembayaran dengan bukti:
- Username `cucudukun`: insert tanggal ke kolom G (G3:G14)
- Username lain: insert tanggal ke kolom E (E3:E14)

#### `/addbill type:<vps/google/domain> nominal:<amount> proof:<image>`
Tambah tagihan:
- Insert tanggal ke kolom B (B3:B14)
- Insert nominal ke kolom C (C3:C14)

#### `/subscription type:<vps/google/domain>`
Menampilkan data dari range A1:G15 dalam format tabel.

#### `/reset type:<vps/google/domain> password:<password>`
Reset data di ranges: B3:C14, E3:E14, G3:G14

## 📝 Environment Variables

### Discord
| Variable | Deskripsi |
|----------|-----------|
| `TOKEN` | Discord Bot Token |
| `CLIENT_ID` | Discord Application Client ID |

### Google Sheets API
| Variable | Deskripsi |
|----------|-----------|
| `GOOGLE_PROJECT_ID` | Google Cloud Project ID |
| `GOOGLE_PRIVATE_KEY_ID` | Service Account Private Key ID |
| `GOOGLE_PRIVATE_KEY` | Service Account Private Key |
| `GOOGLE_CLIENT_EMAIL` | Service Account Email |
| `GOOGLE_CLIENT_ID` | Service Account Client ID |
| `GOOGLE_SHEET_ID` | ID Google Spreadsheet |

### Reset Command
| Variable | Deskripsi |
|----------|-----------|
| `RESET_PASSWORD` | Password untuk command /reset |

## ☁️ Setup Google Sheets API

1. **Buat Project di Google Cloud Console**
   - Buka [Google Cloud Console](https://console.cloud.google.com/)
   - Buat project baru atau pilih yang sudah ada

2. **Enable Google Sheets API**
   - Pergi ke **APIs & Services > Library**
   - Cari "Google Sheets API" dan enable

3. **Buat Service Account**
   - Pergi ke **APIs & Services > Credentials**
   - Klik **Create Credentials > Service Account**
   - Isi nama dan create
   - Klik service account yang dibuat, lalu tab **Keys**
   - **Add Key > Create new key > JSON**
   - Download file JSON

4. **Konfigurasi Environment**
   - Buka file JSON yang didownload
   - Copy nilai ke `.env`

5. **Share Google Sheet**
   - Buka Google Sheet yang ingin diakses
   - Klik **Share**
   - Tambahkan email service account (`GOOGLE_CLIENT_EMAIL`)
   - Berikan akses **Editor** (untuk write access)

## 📋 Struktur Google Sheet

Buat **3 sheet** dengan nama: `Google`, `VPS`, `Domain`

Contoh struktur (kolom A-G, row 1-15):

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Header | Tanggal | Nominal | Total | Payment | Total | Payment |
| ... | ... | ... | ... | ... | ... | ... |

- **B3:C14** - Tanggal & Nominal tagihan
- **E3:E14** - Payment dates (user biasa)
- **G3:G14** - Payment dates (cucudukun)
- **D15/E15** - Total tagihan (user biasa)
- **F15/G15** - Total tagihan (cucudukun)

## 🚢 Deployment Production

1. Build project:
   ```bash
   npm run build
   ```

2. Di folder `dist/`:
   ```bash
   cd dist
   npm install --production
   ```

3. Buat file `.env` dengan credentials

4. Jalankan:
   ```bash
   npm start
   ```

## 🔗 Links

- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Sheets API](https://developers.google.com/sheets/api)

## 📄 License

ISC
