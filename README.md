# Einbürgerungstest Practice App

A mobile-friendly German citizenship test practice app covering all 300 national questions plus the 10 Berlin state-specific questions (310 total).

## Features

- Smart practice queue using an SM-2-inspired confidence algorithm
- Mock exam mode (33 questions, pass mark 17/33)
- Flexible practice sessions with topic filtering and resume
- Context explanations shown after each answer across all 310 questions
- Vocabulary flashcard screen — 178 key terms with 3D flip animation, example sentences, and learned-card tracking
- Progress tracking persisted to localStorage (seen and mastered per topic)
- Browse and search all 310 questions with mastery indicators
- Dark mode
- Export and import progress as JSON
- Works offline — no backend, no external APIs

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Adding question data

Open `src/data/questions.ts` and replace the placeholder `questions` array with the full 310-question dataset. Each entry must match this shape:

```ts
{
  id: number,          // 1-300 for national, 301-310 for Berlin
  topic: 0 | 1 | 2 | 'berlin',
  de: string,          // German question text
  en: string,          // English translation of the question
  opts: [              // exactly 4 answer options
    { de: string, en: string },
    { de: string, en: string },
    { de: string, en: string },
    { de: string, en: string },
  ],
  ans: number,         // 0-indexed index of the correct option
  berlin?: true,       // present only on the 10 Berlin questions
}
```

Topics:
- `0` — Leben in der Demokratie (national)
- `1` — Geschichte und Verantwortung (national)
- `2` — Menschen in Deutschland (national)
- `'berlin'` — Berlin state questions (also set `berlin: true`)

## Building for production

```bash
npm run build
```

Output is in the `dist/` folder.

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import the project in the [Vercel dashboard](https://vercel.com/new).
3. Vercel will auto-detect Vite. No extra configuration needed — `vercel.json` handles SPA routing.

Or deploy directly from the CLI:

```bash
npm i -g vercel
vercel
```
