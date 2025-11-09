# Resort Music Player - Remote Control Frontend

A Next.js application for remotely controlling multiple Raspberry Pi music players via Tailscale.

## Features

- 🎵 Control multiple music players from one interface
- 🔊 Real-time playback control (play, pause, skip)
- 📊 Live status updates every 5 seconds
- 🎚️ Volume control
- 💾 Storage health monitoring
- 🌐 Secure access via Tailscale IPs

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Raspberry Pi Tailscale IPs:
```
NEXT_PUBLIC_PI1_IP=100.104.127.38
NEXT_PUBLIC_PI2_IP=100.114.175.61
NEXT_PUBLIC_API_PORT=5000
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push your code to GitHub

2. Import project in Vercel

3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_PI1_IP`
   - `NEXT_PUBLIC_PI2_IP`
   - `NEXT_PUBLIC_API_PORT`

4. Deploy!

## Requirements

- Node.js 18+
- Access to Raspberry Pi via Tailscale network
- Music player backend running on Raspberry Pis

## Architecture

```
Frontend (Vercel) → Tailscale Network → Raspberry Pi (Flask API)
```

The frontend connects directly to your Raspberry Pi devices using their Tailscale IPs, providing secure remote access without exposing ports to the internet.
