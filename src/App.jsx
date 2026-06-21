import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Timer, CheckSquare, BarChart2, User } from "lucide-react";

import Navbar from "./components/Navbar";
import Dock from "./components/Dock";
import TimerView from "./components/TimerView";
import TaskView from "./components/TaskView";
import StatsView from "./components/StatsView";
import ProfileView from "./components/ProfileView";
import EndSessionModal from "./components/EndSessionModal";

// ---------- localStorage helpers ----------
const STORAGE_KEYS = {
  sessions: "zencore_sessions",
  tasks: "zencore_tasks",
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ---------- Slide variants ----------
const variants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

const VIEWS = [
  { label: "Timer", Icon: Timer },
  { label: "Tasks", Icon: CheckSquare },
  { label: "Stats", Icon: BarChart2 },
  { label: "Profile", Icon: User },
];

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const prevIndex = useRef(0);

  // -------- Theme --------
  const [theme, setTheme] = useState(
    () => localStorage.getItem("zencore_theme") || "zencore",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("zencore_theme", theme);
  }, [theme]);

  // -------- Timer State --------
  const [sessionActive, setSessionActive] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [tabHidden, setTabHidden] = useState(false); // true = user tabbed away
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [straySeconds, setStraySeconds] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [lastSession, setLastSession] = useState(null);

  // Refs so the single visibilitychange listener always reads live values
  const sessionActiveRef = useRef(false);
  const onBreakRef = useRef(false);
  const strayStartRef = useRef(null);
  const strayAccRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => {
    sessionActiveRef.current = sessionActive;
  }, [sessionActive]);
  useEffect(() => {
    onBreakRef.current = onBreak;
  }, [onBreak]);

  // -------- Tasks State --------
  const [tasks, setTasks] = useState(() =>
    loadFromStorage(STORAGE_KEYS.tasks, []),
  );

  // -------- Sessions History --------
  const [sessions, setSessions] = useState(() =>
    loadFromStorage(STORAGE_KEYS.sessions, []),
  );

  // Persist tasks
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.tasks, tasks);
  }, [tasks]);

  // Persist sessions
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.sessions, sessions);
  }, [sessions]);

  // -------- Focus Timer — pauses when tabbed away OR on break --------
  // tabHidden gates the interval so focus and stray never double-count
  useEffect(() => {
    if (!sessionActive || onBreak || tabHidden) return;
    const id = setInterval(() => setFocusSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [sessionActive, onBreak, tabHidden]);

  // -------- Break Timer --------
  useEffect(() => {
    if (!onBreak) return;
    const id = setInterval(() => setBreakSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [onBreak]);

  // -------- Stray Tracker — single mount-time listener using refs --------
  // When tab hides: pause focus (via tabHidden state), start stray clock
  // When tab shows: stop stray clock, add elapsed, resume focus
  useEffect(() => {
    const handleVisibility = () => {
      const isActive = sessionActiveRef.current;
      const isOnBreak = onBreakRef.current;

      if (document.hidden) {
        // Tab left
        setTabHidden(true); // pauses the focus interval immediately
        if (isActive && !isOnBreak) {
          strayStartRef.current = Date.now();
        }
      } else {
        // Tab returned
        setTabHidden(false); // resumes the focus interval
        if (strayStartRef.current !== null) {
          const elapsed = Math.floor(
            (Date.now() - strayStartRef.current) / 1000,
          );
          if (elapsed > 0) {
            strayAccRef.current += elapsed;
            setStraySeconds((s) => s + elapsed);
          }
          strayStartRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []); // mount once — refs keep values fresh

  // -------- Session Controls --------
  const handleStartSession = useCallback(() => {
    setSessionActive(true);
    sessionActiveRef.current = true;
    setOnBreak(false);
    onBreakRef.current = false;
    setTabHidden(document.hidden); // respect current tab state at start
    setFocusSeconds(0);
    setBreakSeconds(0);
    setStraySeconds(0);
    strayAccRef.current = 0;
    strayStartRef.current = document.hidden ? Date.now() : null;
  }, []);

  const handleEndSession = useCallback(() => {
    setSessionActive(false);
    sessionActiveRef.current = false;
    setOnBreak(false);
    onBreakRef.current = false;
    setTabHidden(false);

    // Flush any pending stray (ended while tabbed away)
    let totalStray = strayAccRef.current;
    if (strayStartRef.current !== null) {
      totalStray += Math.floor((Date.now() - strayStartRef.current) / 1000);
      strayStartRef.current = null;
    }

    const newSession = {
      id: Date.now(),
      date: new Date().toISOString(),
      focus: focusSeconds,
      break: breakSeconds,
      stray: totalStray,
    };

    setSessions((prev) => {
      const updated = [newSession, ...prev];
      saveToStorage(STORAGE_KEYS.sessions, updated);
      return updated;
    });

    setLastSession(newSession);
    setShowModal(true);

    setFocusSeconds(0);
    setBreakSeconds(0);
    setStraySeconds(0);
    strayAccRef.current = 0;
  }, [focusSeconds, breakSeconds]);

  const handleTakeBreak = useCallback(() => {
    // Flush any pending stray before break
    if (strayStartRef.current !== null) {
      const elapsed = Math.floor((Date.now() - strayStartRef.current) / 1000);
      if (elapsed > 0) {
        strayAccRef.current += elapsed;
        setStraySeconds((s) => s + elapsed);
      }
      strayStartRef.current = null;
    }
    setOnBreak(true);
    onBreakRef.current = true;
    setTabHidden(false); // reset tab state for break
  }, []);

  const handleResumeWork = useCallback(() => {
    setOnBreak(false);
    onBreakRef.current = false;
    // If currently tabbed away, immediately start stray tracking again
    if (document.hidden) {
      strayStartRef.current = Date.now();
      setTabHidden(true);
    }
  }, []);

  // -------- View Navigation --------
  const navigateTo = useCallback((idx) => {
    const dir = idx > prevIndex.current ? 1 : -1;
    prevIndex.current = idx;
    setDirection(dir);
    setActiveIndex(idx);
  }, []);

  const highScore =
    sessions.length > 0 ? Math.max(...sessions.map((s) => s.focus)) : 0;

  return (
    <div
      className="flex flex-col h-screen overflow-hidden select-none"
      style={{
        background: "var(--app-bg)",
        color: "var(--text-1)",
        transition: "background 0.35s ease, color 0.35s ease",
      }}
    >
      <Navbar theme={theme} setTheme={setTheme} />

      {/* Main viewport */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "tween",
              ease: [0.32, 0.72, 0, 1],
              duration: 0.28,
            }}
            className="absolute inset-0 flex flex-col"
          >
            {activeIndex === 0 && (
              <TimerView
                sessionActive={sessionActive}
                onBreak={onBreak}
                tabHidden={tabHidden}
                focusSeconds={focusSeconds}
                breakSeconds={breakSeconds}
                straySeconds={straySeconds}
                onStart={handleStartSession}
                onEnd={handleEndSession}
                onBreakStart={handleTakeBreak}
                onResume={handleResumeWork}
              />
            )}
            {activeIndex === 1 && (
              <TaskView tasks={tasks} setTasks={setTasks} />
            )}
            {activeIndex === 2 && <StatsView sessions={sessions} />}
            {activeIndex === 3 && <ProfileView />}
          </motion.div>
        </AnimatePresence>
      </div>

      <Dock views={VIEWS} activeIndex={activeIndex} onNavigate={navigateTo} />

      <AnimatePresence>
        {showModal && lastSession && (
          <EndSessionModal
            session={lastSession}
            highScore={highScore}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
