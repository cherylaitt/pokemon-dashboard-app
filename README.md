# Pokemon Dashboard App

A beautiful, scrollable Next.js dashboard displaying Pokemon from the PokeAPI.

## Features

- 🎨 Modern, responsive UI with gradient background
- 📱 Mobile-friendly design
- 🔄 Real-time data fetching from PokeAPI
- 🎴 Beautiful Pokemon cards with images, types, and stats
- 📜 Scrollable grid layout

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **CSS Modules** - Scoped styling
- **PokeAPI** - Pokemon data source

## Project Structure

```
pokemon-dashboard-app/
├── app/
│   ├── components/
│   │   ├── PokemonCard.tsx
│   │   └── PokemonCard.module.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── page.module.css
│   └── globals.css
├── package.json
├── tsconfig.json
└── next.config.js
```

## API

This app fetches Pokemon data from [PokeAPI](https://pokeapi.co/api/v2/pokemon?limit=50).
