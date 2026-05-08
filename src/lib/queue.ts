import { questions, type Topic, type Question } from '../data/questions';
import { loadProgress } from './progress';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function prioritizePool(pool: Question[]): Question[] {
  const progress = loadProgress();

  const unseen: Question[] = [];
  const low: Array<{ q: Question; confidence: number }> = [];
  const mid: Array<{ q: Question; lastSeen: number }> = [];
  const mastered: Question[] = [];

  for (const q of pool) {
    const p = progress[q.id];
    if (!p || p.attempts === 0) {
      unseen.push(q);
    } else if (p.confidence < 0.5) {
      low.push({ q, confidence: p.confidence });
    } else if (p.confidence < 0.8 || p.attempts < 3) {
      mid.push({ q, lastSeen: p.lastSeen ? new Date(p.lastSeen).getTime() : 0 });
    } else {
      mastered.push(q);
    }
  }

  low.sort((a, b) => a.confidence - b.confidence);
  mid.sort((a, b) => a.lastSeen - b.lastSeen);

  return [
    ...shuffle(unseen),
    ...low.map(({ q }) => q),
    ...mid.map(({ q }) => q),
    ...shuffle(mastered),
  ];
}

export function buildQueue(topic: Topic | 'all' = 'all'): Question[] {
  const pool = topic === 'all' ? questions : questions.filter(q => q.topic === topic);
  return prioritizePool(pool);
}

export function buildMockExam(): Question[] {
  const berlinQs = questions.filter(q => q.berlin);
  const nationalQs = questions.filter(q => !q.berlin);
  const national = shuffle(nationalQs).slice(0, 30);
  const berlin = shuffle(berlinQs).slice(0, 3);
  return shuffle([...national, ...berlin]);
}
