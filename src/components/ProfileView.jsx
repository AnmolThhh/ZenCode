import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitFork, Mail, Code2 } from 'lucide-react';

// ─── Cycling tech subtitle ────────────────────────────────────────────────
const TECH_STACK = [
  { label: 'HTML', color: '#e34f26' },
  { label: 'CSS', color: '#264de4' },
  { label: 'JS', color: '#f7df1e' },
  { label: 'TypeScript', color: '#3178c6' },
  { label: 'React', color: '#61dafb' },
  { label: 'Next.js', color: '#cccccc' },
  { label: 'Node.js', color: '#68a063' },
  { label: 'Express', color: '#a3a3a3' },
];

function TechCycler() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % TECH_STACK.length);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  const tech = TECH_STACK[index];

  return (
    <div className="flex items-center justify-center gap-2 mt-2 h-6 overflow-hidden">
      <Code2
        size={11}
        style={{ color: tech.color, flexShrink: 0, transition: 'color 0.3s ease' }}
      />
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="text-xs font-semibold tracking-widest"
          style={{
            fontFamily: 'var(--font-mono)',
            color: tech.color,
            textShadow: `0 0 14px ${tech.color}70`,
          }}
        >
          {tech.label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ─── Links ────────────────────────────────────────────────────────────────
const LINKS = [
  {
    id: 'github',
    Icon: GitFork,
    label: 'GitHub',
    href: 'https://github.com/AnmolThhh',
    value: '@AnmolThhh',
    color: '#818cf8',
  },
  {
    id: 'email',
    Icon: Mail,
    label: 'Email',
    href: 'mailto:anmolth2005@gmail.com',
    value: 'anmolth2005@gmail.com',
    color: '#f59e0b',
  },
];

// ─── Main view ────────────────────────────────────────────────────────────
export default function ProfileView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-10 py-10 gap-6 overflow-y-auto no-scrollbar">

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="w-full max-w-md flex flex-col gap-7 p-9 rounded-3xl"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
          transition: 'background 0.35s ease, border-color 0.35s ease',
        }}
      >

        {/* Avatar + Name + TechCycler */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #34d399 0%, #818cf8 50%, #f59e0b 100%)',
                padding: '2.5px',
              }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{ background: 'var(--app-bg)' }}
              >
                <span
                  className="text-2xl font-black"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}
                >
                  AT
                </span>
              </div>
            </div>
            <span
              className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2"
              style={{ background: '#34d399', borderColor: 'var(--app-bg)' }}
            />
          </div>

          <div className="text-center">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}
            >
              Anmol Thapa
            </h1>
            <TechCycler />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: 'var(--border)' }} />

        {/* Links */}
        <div className="flex flex-col gap-4">
          {LINKS.map(({ id, Icon, label, href, value, color }, i) => (
            <motion.a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
              whileHover={{ x: 5, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl group"
              style={{
                background: `${color}08`,
                border: `1px solid ${color}22`,
                textDecoration: 'none',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${color}50`;
                e.currentTarget.style.background = `${color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${color}22`;
                e.currentTarget.style.background = `${color}08`;
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}15` }}
              >
                <Icon size={17} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[10px] uppercase tracking-widest mb-0.5"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-4)' }}
                >
                  {label}
                </div>
                <div
                  className="text-sm font-medium truncate"
                  style={{ fontFamily: 'var(--font-mono)', color }}
                >
                  {value}
                </div>
              </div>

              <svg
                width="13" height="13" viewBox="0 0 12 12" fill="none"
                className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                style={{ color: 'var(--text-4)' }}
              >
                <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.a>
          ))}
        </div>

        {/* Footer badge */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          <span
            className="text-[10px] tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-4)' }}
          >
            ZenCore v1.0
          </span>
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
        </div>

      </motion.div>
    </div>
  );
}
