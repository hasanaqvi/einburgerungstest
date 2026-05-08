import { useState, useCallback, useEffect } from 'react';
import type { Question } from './data/questions';
import { type Progress, loadProgress, updateQuestion, resetProgress, exportProgress } from './lib/progress';
import { buildQueue, buildMockExam } from './lib/queue';
import { HomeScreen } from './components/HomeScreen';
import { PracticeScreen } from './components/PracticeScreen';
import { MockExamScreen } from './components/MockExamScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { BrowseScreen } from './components/BrowseScreen';
import { SettingsScreen } from './components/SettingsScreen';

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

type Screen = 'home' | 'practice' | 'mock' | 'results' | 'browse' | 'settings';

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
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [progress, setProgress] = useState<Progress>(loadProgress);

  const refreshProgress = useCallback(() => setProgress(loadProgress()), []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  function handleAnswer(questionId: number, isCorrect: boolean) {
    updateQuestion(questionId, isCorrect);
    refreshProgress();
  }

  function handlePracticeComplete(answers: (number | null)[]) {
    if (!sessionQuestions) return;
    setSessionResult({ questions: sessionQuestions, answers, isMock: false });
    setScreen('results');
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

  function startPractice() {
    setSessionQuestions(buildQueue());
    setScreen('practice');
  }

  function startMock() {
    setSessionQuestions(buildMockExam());
    setScreen('mock');
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
    case 'home':
      return (
        <HomeScreen
          progress={progress}
          onPractice={startPractice}
          onMockExam={startMock}
          onBrowse={() => setScreen('browse')}
          onSettings={() => setScreen('settings')}
        />
      );

    case 'practice':
      return sessionQuestions ? (
        <PracticeScreen
          questions={sessionQuestions}
          progress={progress}
          settings={settings}
          onAnswer={handleAnswer}
          onComplete={handlePracticeComplete}
          onHome={() => setScreen('home')}
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
          onPracticeAgain={startPractice}
          onHome={() => setScreen('home')}
        />
      ) : null;

    case 'browse':
      return (
        <BrowseScreen
          progress={progress}
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
  }
}
