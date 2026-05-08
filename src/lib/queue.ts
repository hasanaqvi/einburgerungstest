import { questions, type Question } from '../data/questions';
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

function pickWithMasteryRatio(prioritized: Question[], count: number): Question[] {
  const progress = loadProgress();

  const nonMastered = prioritized.filter(q => {
    const p = progress[q.id];
    return !p || p.confidence < 0.8 || p.attempts < 3;
  });
  const mastered = prioritized.filter(q => {
    const p = progress[q.id];
    return p && p.confidence >= 0.8 && p.attempts >= 3;
  });

  const masteredSlots = Math.floor(count / 10);
  const regularSlots = count - masteredSlots;

  const result: Question[] = [
    ...nonMastered.slice(0, regularSlots),
    ...mastered.slice(0, masteredSlots),
  ];

  // Fill any remaining slots if non-mastered pool was too small
  if (result.length < count) {
    const extra = mastered.slice(masteredSlots).slice(0, count - result.length);
    result.push(...extra);
  }

  return result.slice(0, count);
}

export function buildQueue(count = 20): Question[] {
  const berlinQs = questions.filter(q => q.berlin);
  const nationalQs = questions.filter(q => !q.berlin);

  const byTopic: Record<number, Question[]> = { 0: [], 1: [], 2: [] };
  for (const q of nationalQs) {
    byTopic[q.topic as number].push(q);
  }

  const totalNational = nationalQs.length || 1;
  const totalBerlin = berlinQs.length || 1;
  const total = totalNational + totalBerlin;

  const berlinCount = Math.max(1, Math.round((totalBerlin / total) * count));
  const nationalCount = count - berlinCount;

  // Proportional split across 3 national topics
  const topicCounts: number[] = [0, 1, 2].map(t =>
    Math.round((byTopic[t].length / totalNational) * nationalCount)
  );
  // Fix rounding drift on topic 0
  const drift = nationalCount - topicCounts.reduce((a, b) => a + b, 0);
  topicCounts[0] = Math.max(0, topicCounts[0] + drift);

  const result: Question[] = [];
  for (let t = 0; t < 3; t++) {
    const sorted = prioritizePool(byTopic[t]);
    result.push(...pickWithMasteryRatio(sorted, topicCounts[t]));
  }

  const sortedBerlin = prioritizePool(berlinQs);
  result.push(...pickWithMasteryRatio(sortedBerlin, berlinCount));

  return shuffle(result).slice(0, count);
}

export function buildMockExam(): Question[] {
  const berlinQs = questions.filter(q => q.berlin);
  const nationalQs = questions.filter(q => !q.berlin);
  const national = shuffle(nationalQs).slice(0, 30);
  const berlin = shuffle(berlinQs).slice(0, 3);
  return shuffle([...national, ...berlin]);
}
