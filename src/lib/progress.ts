const STORAGE_KEY = 'einbuergerungstest_progress';

export interface QuestionProgress {
  attempts: number;
  correct: number;
  lastSeen: string | null;
  confidence: number;
}

export type Progress = Record<number, QuestionProgress>;

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Progress) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function updateQuestion(id: number, isCorrect: boolean): void {
  const progress = loadProgress();
  const current: QuestionProgress = progress[id] ?? {
    attempts: 0,
    correct: 0,
    lastSeen: null,
    confidence: 0,
  };

  const newConfidence = isCorrect
    ? Math.min(1, current.confidence + 0.15 * (1 - current.confidence))
    : Math.max(0, current.confidence - 0.3);

  progress[id] = {
    attempts: current.attempts + 1,
    correct: current.correct + (isCorrect ? 1 : 0),
    lastSeen: new Date().toISOString(),
    confidence: newConfidence,
  };

  saveProgress(progress);
}

export function isMastered(p: QuestionProgress): boolean {
  return p.confidence >= 0.8 && p.attempts >= 3;
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportProgress(): string {
  return JSON.stringify(loadProgress(), null, 2);
}

const SESSION_KEY = 'einbuergerungstest_session';

export interface Session {
  queueIds: number[];
  index: number;
}

export function saveSession(queueIds: number[], index: number): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ queueIds, index }));
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
