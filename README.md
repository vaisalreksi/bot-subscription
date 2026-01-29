# Bot Subscription

Discord bot untuk sistem subscription menggunakan Discord.js v14.

## 📋 Prerequisites

- Node.js v18.0.0 atau lebih baru
- Discord Bot Token dari [Discord Developer Portal](https://discord.com/developers/applications)

## 🚀 Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd bot-subscription
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   
   Buat file `.env` di root folder:
   ```env
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_client_id
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
│   └── commands/             # Folder untuk commands
│       └── ping.js           # Command /ping
├── scripts/
│   └── build.js              # Build script
├── .env                      # Environment variables (tidak di-commit)
├── .gitignore
├── nodemon.json              # Nodemon configuration
├── package.json
└── README.md
```

## 🛠️ Menambahkan Command Baru

1. Buat file baru di `src/commands/`, contoh `hello.js`:

```javascript
import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Menyapa user'),

    async execute(interaction) {
        await interaction.reply(`Halo, ${interaction.user.username}! 👋`);
    }
};
```

2. Jalankan deploy commands:
```bash
npm run deploy-commands
```

3. Restart bot (otomatis jika menggunakan `npm run dev`)

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
| `GOOGLE_PRIVATE_KEY` | Service Account Private Key (dengan `\n` untuk newlines) |
| `GOOGLE_CLIENT_EMAIL` | Service Account Email |
| `GOOGLE_CLIENT_ID` | Service Account Client ID |
| `GOOGLE_SHEET_ID` | ID Google Spreadsheet |
| `GOOGLE_SHEET_VPS_RANGE` | Range untuk data VPS (default: `VPS!A:E`) |
| `GOOGLE_SHEET_GOOGLE_RANGE` | Range untuk data Google (default: `Google!A:E`) |
| `GOOGLE_SHEET_DOMAIN_RANGE` | Range untuk data Domain (default: `Domain!A:E`) |

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
   - Copy nilai berikut ke `.env`:
     ```env
     GOOGLE_PROJECT_ID=project_id
     GOOGLE_PRIVATE_KEY_ID=private_key_id
     GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
     GOOGLE_CLIENT_EMAIL=xxx@xxx.iam.gserviceaccount.com
     GOOGLE_CLIENT_ID=client_id
     ```

5. **Share Google Sheet**
   - Buka Google Sheet yang ingin diakses
   - Klik **Share**
   - Tambahkan email service account (`GOOGLE_CLIENT_EMAIL`)
   - Berikan akses **Viewer**

6. **Konfigurasi Sheet ID**
   - Copy Sheet ID dari URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
   - Tambahkan ke `.env`:
     ```env
     GOOGLE_SHEET_ID=your_sheet_id
     ```

## 📋 Struktur Google Sheet

Buat 3 sheet dengan nama: `VPS`, `Google`, `Domain`

Contoh struktur (baris pertama adalah header):
| Nama | Provider | Expiry Date | Status | Notes |
|------|----------|-------------|--------|-------|
| Server 1 | DigitalOcean | 2024-12-31 | Active | Main server |

## 🤖 Slash Commands

| Command | Deskripsi |
|---------|-----------|
| `/ping` | Cek respon bot dan latency |
| `/profile` | Lihat profil Discord kamu |
| `/check` | Cek status subscription (VPS/Google/Domain) |

## 🔗 Links

- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord.js Guide](https://discordjs.guide/)

## 📄 License

ISC
