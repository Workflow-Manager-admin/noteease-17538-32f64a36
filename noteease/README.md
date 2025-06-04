# NoteEase

A simple and intuitive notes application built with Astro and JavaScript (ES6+) that allows users to create, edit, delete, and organize their personal notes.

## Features

- Create and edit notes with title and content
- Categorize notes for better organization
- Search notes by title and content
- Delete unwanted notes
- Responsive design for desktop and mobile devices
- Local storage for persistence

## Theme Colors

- Primary: #1976D2 (Blue)
- Secondary: #FFFFFF (White)
- Accent: #FFC107 (Amber)

## Project Structure

```
noteease/
├── public/
│   ├── favicon.svg
│   └── styles/
│       └── global.css
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── NoteCard.astro
│   │   ├── NoteEditor.astro
│   │   ├── NoteList.astro
│   │   ├── NoteViewer.astro
│   │   ├── SearchBar.astro
│   │   └── Sidebar.astro
│   ├── layouts/
│   │   └── MainLayout.astro
│   ├── pages/
│   │   └── index.astro
│   ├── store/
│   │   └── notesStore.js
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Build

To build the project for production:

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Preview

To preview the production build:

```bash
npm run preview
```

## Technology Stack

- Astro
- JavaScript (ES6+)
- CSS3
