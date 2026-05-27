import { useState, useCallback, useEffect } from 'react';
import { questions as allQuestions, type Question, type Topic } from './data/questions';
import { type Progress, loadProgress, updateQuestion, resetProgress, exportProgress, saveSession, loadSession, clearSession } from './lib/progress';
import { loadBookmarks, toggleBookmark } from './lib/bookmarks';
import { buildQueue, buildMockExam } from './lib/queue';
import { HomeScreen } from './components/HomeScreen';
import { PracticeScreen } from './components/PracticeScreen';
import { MockExamScreen } from './components/MockExamScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { BrowseScreen } from './components/BrowseScreen';
import { BookmarksScreen } from './components/BookmarksScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { VocabularyScreen } from './components/VocabularyScreen';

export interface AppSettings {
  showQuestionTranslation: boolean;
  showAnswerTranslation: boolean;
  darkMode: boolean;
}

export interface SessionResult {
  questions: Question[];
  answers: (number | null)[];
  isMock: boolean;
}

type Screen = 'home' | 'practice' | 'mock' | 'results' | 'browse' | 'bookmarks' | 'settings' | 'vocabulary';

const SETTINGS_KEY = 'einbuergerungstest_settings';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const s = raw
      ? (JSON.parse(raw) as AppSettings)
      : { showQuestionTranslation: false, showAnswerTranslation: true, darkMode: false };
    // Apply immediately to avoid flash of wrong theme
    document.documentElement.classList.toggle('dark', !!s.darkMode);
    return s;
  } catch {
    return { showQuestionTranslation: false, showAnswerTranslation: true, darkMode: false };
  }
}

function saveSettings(s: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [sessionQuestions, setSessionQuestions] = useState<Question[] | null>(null);
  const [sessionInitialIndex, setSessionInitialIndex] = useState(0);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [bookmarks, setBookmarks] = useState<Set<number>>(loadBookmarks);

  const refreshProgress = useCallback(() => setProgress(loadProgress()), []);

  function handleToggleBookmark(id: number) {
    setBookmarks(toggleBookmark(id));
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  function handleAnswer(questionId: number, isCorrect: boolean) {
    updateQuestion(questionId, isCorrect);
    refreshProgress();
  }

  function handlePracticeComplete(answers: (number | null)[]) {
    if (!sessionQuestions) return;
    clearSession();
    setSessionResult({
      questions: sessionQuestions.slice(sessionInitialIndex),
      answers: answers.slice(sessionInitialIndex),
      isMock: false,
    });
    setScreen('results');
  }

  function handlePracticePause(currentIndex: number) {
    if (!sessionQuestions) return;
    saveSession(sessionQuestions.map(q => q.id), currentIndex);
    setScreen('home');
  }

  function handleMockComplete(answers: (number | null)[]) {
    if (!sessionQuestions) return;
    sessionQuestions.forEach((q, i) => {
      const ans = answers[i];
      if (ans !== null) updateQuestion(q.id, ans === q.ans);
    });
    refreshProgress();
    setSessionResult({ questions: sessionQuestions, answers, isMock: true });
    setScreen('results');
  }

  function startPractice(topic: Topic | 'all' = 'all') {
    const qs = buildQueue(topic);
    setSessionQuestions(qs);
    setSessionInitialIndex(0);
    saveSession(qs.map(q => q.id), 0);
    setScreen('practice');
  }

  function resumePractice() {
    const session = loadSession();
    if (!session) { startPractice(); return; }
    const questionMap = new Map(allQuestions.map(q => [q.id, q]));
    const qs = session.queueIds
      .map(id => questionMap.get(id))
      .filter((q): q is Question => q !== undefined);
    setSessionQuestions(qs);
    setSessionInitialIndex(session.index);
    setScreen('practice');
  }

  function startMock() {
    setSessionQuestions(buildMockExam());
    setScreen('mock');
  }

  function startPracticeBookmarks() {
    const ids = [...bookmarks];
    if (ids.length === 0) return;
    const questionMap = new Map(allQuestions.map(q => [q.id, q]));
    const qs = ids
      .map(id => questionMap.get(id))
      .filter((q): q is Question => q !== undefined)
      .sort(() => Math.random() - 0.5);
    setSessionQuestions(qs);
    setSessionInitialIndex(0);
    saveSession(qs.map(q => q.id), 0);
    setScreen('practice');
  }

  function handleUpdateSettings(updates: Partial<AppSettings>) {
    const next = { ...settings, ...updates };
    setSettings(next);
    saveSettings(next);
  }

  function handleResetProgress() {
    resetProgress();
    refreshProgress();
  }

  function handleExportProgress() {
    const data = exportProgress();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `einbuergerungstest_progress_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImportProgress(json: string) {
    try {
      const data = JSON.parse(json);
      localStorage.setItem('einbuergerungstest_progress', JSON.stringify(data));
      refreshProgress();
    } catch {
      alert('Could not import progress — invalid file.');
    }
  }

  switch (screen) {
    case 'home': {
      const session = loadSession();
      const savedSession = session ? { index: session.index, total: session.queueIds.length } : null;
      return (
        <HomeScreen
          progress={progress}
          bookmarkCount={bookmarks.size}
          savedSession={savedSession}
          onPractice={savedSession ? resumePractice : () => startPractice('all')}
          onPracticeByTopic={startPractice}
          onMockExam={startMock}
          onBrowse={() => setScreen('browse')}
          onVocabulary={() => setScreen('vocabulary')}
          onBookmarks={() => setScreen('bookmarks')}
          onSettings={() => setScreen('settings')}
        />
      );
    }

    case 'practice':
      return sessionQuestions ? (
        <PracticeScreen
          questions={sessionQuestions}
          initialIndex={sessionInitialIndex}
          progress={progress}
          bookmarks={bookmarks}
          onAnswer={handleAnswer}
          onComplete={handlePracticeComplete}
          onPause={handlePracticePause}
          onToggleBookmark={handleToggleBookmark}
        />
      ) : null;

    case 'mock':
      return sessionQuestions ? (
        <MockExamScreen
          questions={sessionQuestions}
          onComplete={handleMockComplete}
          onHome={() => setScreen('home')}
        />
      ) : null;

    case 'results':
      return sessionResult ? (
        <ResultsScreen
          result={sessionResult}
          onPracticeAgain={() => startPractice('all')}
          onHome={() => setScreen('home')}
        />
      ) : null;

    case 'browse':
      return (
        <BrowseScreen
          progress={progress}
          bookmarks={bookmarks}
          onToggleBookmark={handleToggleBookmark}
          onHome={() => setScreen('home')}
        />
      );

    case 'bookmarks':
      return (
        <BookmarksScreen
          bookmarks={bookmarks}
          progress={progress}
          onToggleBookmark={handleToggleBookmark}
          onPracticeBookmarks={startPracticeBookmarks}
          onHome={() => setScreen('home')}
        />
      );

    case 'settings':
      return (
        <SettingsScreen
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onResetProgress={handleResetProgress}
          onExportProgress={handleExportProgress}
          onImportProgress={handleImportProgress}
          onHome={() => setScreen('home')}
        />
      );

    case 'vocabulary':
      return <VocabularyScreen onHome={() => setScreen('home')} />;
  }
}
