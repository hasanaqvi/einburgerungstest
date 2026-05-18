const STORAGE_KEY = 'einbuergerungstest_vocab_learned';

export function loadVocabLearned(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markVocabLearned(index: number): Set<number> {
  const learned = loadVocabLearned();
  learned.add(index);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...learned]));
  return learned;
}

export function unmarkVocabLearned(index: number): Set<number> {
  const learned = loadVocabLearned();
  learned.delete(index);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...learned]));
  return learned;
}

export function resetVocabProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}
