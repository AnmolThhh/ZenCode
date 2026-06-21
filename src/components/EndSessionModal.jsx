import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Trophy, X, Zap } from 'lucide-react';

function formatDuration(seconds) {
  if (!seconds) return '0s';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

const COLORS = {
  focus: '#34d399',
  break: '#f59e0b',
  stray: '#f87171',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs"
      style={{
        background: 'rgba(24,24,27,0.97)',
        border: '1px solid rgba(63,63,70,0.7)',
        fontFamily: 'var(--font-mono)',
        color: '#d4d4d8',
      }}
    >
      <span style={{ color: COLORS[name.toLowerCase()] }}>{name}</span>: {formatDuration(value)}
    </div>
  );
};

export default function EndSessionModal({ session, highScore, onClose }) {
  const isNewHighScore = session.focus > 0 && session.focus >= highScore;

  const pieData = useMemo(() => {
    const arr = [];
    if (session.focus > 0) arr.push({ name: 'Focus', value: session.focus });
    if (session.break > 0) arr.push({ name: 'Break', value: session.break });
    if (session.stray > 0) arr.push({ name: 'Stray', value: session.stray });
    if (arr.length === 0) arr.push({ name: 'Focus', value: 1 }); // fallback
    return arr;
  }, [session]);

  const totalTime = session.focus + session.break + session.stray;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.85, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative w-full max-w-sm flex flex-col gap-6 p-8 rounded-3xl"
        style={{
          background: 'rgba(14,14,18,0.98)',
          border: '1px solid rgba(63,63,70,0.7)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          {isNewHighScore && (
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
              style={{
                background: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(129,140,248,0.2))',
                border: '1px solid rgba(52,211,153,0.4)',
                color: '#34d399',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Trophy size={12} />
              New High Score!
            </motion.div>
          )}
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Session Complete
          </h2>
          <p className="text-xs text-zinc-500 tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>
            total time: {formatDuration(totalTime)}
          </p>
        </div>

        {/* Pie Chart */}
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                animationBegin={200}
                animationDuration={800}
              >
                {pieData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name.toLowerCase()] || '#52525b'}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Stats */}
        <div className="flex flex-col gap-3">
          {[
            { key: 'focus', label: 'Focus', value: session.focus },
            { key: 'break', label: 'Break', value: session.break },
            { key: 'stray', label: 'Stray', value: session.stray },
          ]
            .filter((r) => r.value > 0)
            .map(({ key, label, value }) => {
              const pct = totalTime > 0 ? Math.round((value / totalTime) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-4">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: COLORS[key] }}
                  />
                  <span
                    className="text-xs text-zinc-400 flex-1"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: COLORS[key], fontFamily: 'var(--font-mono)' }}
                  >
                    {formatDuration(value)}
                  </span>
                  <span
                    className="text-[10px] text-zinc-600 w-8 text-right"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
        </div>

        {/* Congrats or Nudge */}
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-2xl"
          style={{
            background: isNewHighScore
              ? 'rgba(52,211,153,0.08)'
              : 'rgba(24,24,27,0.8)',
            border: isNewHighScore
              ? '1px solid rgba(52,211,153,0.2)'
              : '1px solid rgba(63,63,70,0.4)',
          }}
        >
          <Zap size={13} style={{ color: isNewHighScore ? '#34d399' : '#52525b', shrink: 0 }} />
          <p
            className="text-xs leading-relaxed"
            style={{
              color: isNewHighScore ? '#a7f3d0' : '#71717a',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {isNewHighScore
              ? `Outstanding! ${formatDuration(session.focus)} is your new personal best. Keep building momentum.`
              : session.focus > 0
              ? `Good session. ${formatDuration(session.focus)} of focused work completed. Stay consistent.`
              : 'Every journey starts somewhere. Begin your next session and build the habit.'}
          </p>
        </div>

        {/* Close CTA */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          className="w-full py-4 rounded-2xl text-sm font-bold tracking-wider"
          style={{
            background: 'rgba(63,63,70,0.4)',
            border: '1px solid rgba(63,63,70,0.6)',
            color: '#d4d4d8',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
