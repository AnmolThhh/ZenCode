import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Coffee, Zap } from 'lucide-react';

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function StatPill({ label, value, color }) {
  return (
    <div
      className="flex flex-col items-center gap-2 px-8 py-4 rounded-2xl"
      style={{
        background: 'rgba(24,24,27,0.85)',
        border: `1px solid ${color}33`,
      }}
    >
      <span
        className="text-[10px] tracking-widest uppercase"
        style={{ color: '#71717a', fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </span>
      <span
        className="text-base font-bold"
        style={{ color, fontFamily: 'var(--font-mono)' }}
      >
        {value}
      </span>
    </div>
  );
}

export default function TimerView({
  sessionActive,
  onBreak,
  tabHidden,
  focusSeconds,
  breakSeconds,
  straySeconds,
  onStart,
  onEnd,
  onBreakStart,
  onResume,
}) {
  const displayTime = useMemo(() => formatTime(focusSeconds), [focusSeconds]);
  const displayBreak = useMemo(() => formatTime(breakSeconds), [breakSeconds]);
  const focusMins = Math.floor(focusSeconds / 60);

  const statusLabel = useMemo(() => {
    if (!sessionActive) return 'READY';
    if (onBreak) return 'ON BREAK';
    if (tabHidden) return 'STRAY';
    return 'IN FLOW';
  }, [sessionActive, onBreak, tabHidden]);

  const statusColor = useMemo(() => {
    if (!sessionActive) return '#52525b';
    if (onBreak) return '#f59e0b';
    if (tabHidden) return '#f87171';
    return '#34d399';
  }, [sessionActive, onBreak, tabHidden]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 gap-8 overflow-y-auto no-scrollbar py-10">

      {/* Status Badge */}
      <motion.div
        key={statusLabel}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 px-5 py-2 rounded-full text-xs tracking-[0.25em] uppercase font-semibold"
        style={{
          background: `${statusColor}15`,
          border: `1px solid ${statusColor}40`,
          color: statusColor,
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{
            background: statusColor,
            boxShadow: sessionActive && !onBreak ? `0 0 8px ${statusColor}` : 'none',
            animation: sessionActive && !onBreak ? 'pulse 2s infinite' : 'none',
          }}
        />
        {statusLabel}
      </motion.div>

      {/* Main Timer Display */}
      <div className="relative flex flex-col items-center gap-3">
        {sessionActive && !onBreak && (
          <div
            className="absolute inset-0 blur-3xl -z-10 rounded-full"
            style={{
              background: 'radial-gradient(ellipse, rgba(52,211,153,0.1) 0%, transparent 70%)',
              transform: 'scale(2.5)',
            }}
          />
        )}

        <motion.div
          key={`timer-${sessionActive}-${onBreak}-${tabHidden}`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="font-black text-center"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(5rem, 16vw, 9rem)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: onBreak ? '#71717a' : tabHidden ? '#7f1d1d' : sessionActive ? '#ffffff' : '#3f3f46',
            textShadow: sessionActive && !onBreak && !tabHidden
              ? '0 0 60px rgba(255,255,255,0.12)'
              : 'none',
            transition: 'color 0.4s ease',
          }}
        >
          {displayTime}
        </motion.div>

        <div
          className="text-xs tracking-[0.35em] uppercase"
          style={{ color: '#3f3f46', fontFamily: 'var(--font-mono)' }}
        >
          focus time
        </div>
      </div>

      {/* Break Timer */}
      <AnimatePresence>
        {onBreak && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="flex flex-col items-center gap-2"
          >
            <div
              className="font-bold text-center"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(2rem, 7vw, 3.5rem)',
                color: '#f59e0b',
                textShadow: '0 0 24px rgba(245,158,11,0.3)',
              }}
            >
              {displayBreak}
            </div>
            <div
              className="text-[10px] tracking-[0.3em] uppercase"
              style={{ color: '#78716c', fontFamily: 'var(--font-mono)' }}
            >
              break time
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Pills */}
      <AnimatePresence>
        {sessionActive && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="flex gap-4 flex-wrap justify-center"
          >
            <StatPill label="Focus" value={`${focusMins}m`} color="#34d399" />
            <StatPill label="Break" value={`${Math.floor(breakSeconds / 60)}m`} color="#f59e0b" />
            <StatPill label="Stray" value={`${Math.floor(straySeconds / 60)}m`} color="#f87171" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 w-full max-w-sm px-4">
        {!sessionActive ? (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onStart}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-sm tracking-widest uppercase"
            style={{
              background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
              color: '#000',
              fontFamily: 'var(--font-mono)',
              boxShadow: '0 6px 28px rgba(52,211,153,0.35)',
            }}
          >
            <Play size={17} fill="currentColor" />
            Start Session
          </motion.button>
        ) : (
          <div className="flex gap-4 w-full">
            {!onBreak ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onBreakStart}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-xs tracking-wider uppercase"
                style={{
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.35)',
                  color: '#f59e0b',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <Coffee size={15} />
                Take Break
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onResume}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-xs tracking-wider uppercase"
                style={{
                  background: 'rgba(52,211,153,0.12)',
                  border: '1px solid rgba(52,211,153,0.35)',
                  color: '#34d399',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <Zap size={15} />
                Resume Work
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onEnd}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-xs tracking-wider uppercase"
              style={{
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                color: '#f87171',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Square size={14} fill="currentColor" />
              End Session
            </motion.button>
          </div>
        )}
      </div>

      {/* Motivational footer */}
      {!sessionActive && (
        <p
          className="text-xs text-zinc-700 tracking-widest text-center"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          deep work starts here
        </p>
      )}
    </div>
  );
}
