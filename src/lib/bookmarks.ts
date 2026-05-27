const STORAGE_KEY = 'einbuergerungstest_bookmarks';

export function loadBookmarks(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

export function toggleBookmark(id: number): Set<number> {
  const bookmarks = loadBookmarks();
  if (bookmarks.has(id)) {
    bookmarks.delete(id);
  } else {
    bookmarks.add(id);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...bookmarks]));
  return bookmarks;
}
