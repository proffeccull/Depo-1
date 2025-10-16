# ChainGive Web App

Web application for the ChainGive platform built with Next.js 15.

## Features

- 🔐 Authentication with tRPC
- 📊 Dashboard with user stats
- 💰 Coin balance and transaction history
- 🎨 Modern UI with Tailwind CSS
- 🔄 State management with Zustand
- 📱 Responsive design

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persistence
- **API**: tRPC for type-safe APIs
- **Data Fetching**: TanStack Query
- **TypeScript**: Full type safety

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable components
├── hooks/              # Custom hooks
├── store/              # Zustand stores
├── utils/              # Utilities and configurations
└── services/           # External services
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint