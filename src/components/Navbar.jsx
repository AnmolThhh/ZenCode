import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check } from "lucide-react";

const THEMES = [
  {
    id: "zencore",
    name: "ZenCore",
    bg: "#09090b",
    surface: "#18181b",
    accent: "#34d399",
    mode: "dark",
  },
  {
    id: "gruvbox",
    name: "Gruvbox",
    bg: "#282828",
    surface: "#32302f",
    accent: "#fabd2f",
    mode: "dark",
  },
  {
    id: "mocha",
    name: "Mocha",
    bg: "#1e1e2e",
    surface: "#313244",
    accent: "#cba6f7",
    mode: "dark",
  },
  {
    id: "latte",
    name: "Latte",
    bg: "#eff1f5",
    surface: "#dce0e8",
    accent: "#8839ef",
    mode: "light",
  },
  {
    id: "parchment",
    name: "Parchment",
    bg: "#f5f0e8",
    surface: "#e4dcd5",
    accent: "#d65d0e",
    mode: "light",
  },
];

export default function Navbar({ theme, setTheme }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const activeTheme = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <nav
      style={{
        background: "var(--navbar-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        transition: "background 0.35s ease",
      }}
      className="z-50 flex items-center justify-between px-8 py-4 shrink-0 relative"
    >
      {/* Left: Identity */}
      <div className="flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span
          className="text-xs font-semibold tracking-widest "
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-2)" }}
        >
          [Anmol Thapa] | [at2558392@gmail.com]
        </span>
      </div>

      {/* Right: Theme pill + CTA */}
      <div className="flex items-center gap-3" ref={ref}>
        {/* Theme toggle button */}
        <div className="relative">
          <motion.button
            onClick={() => setOpen((o) => !o)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide"
            style={{
              background: open
                ? `${activeTheme.accent}20`
                : "rgba(128,128,128,0.08)",
              border: `1px solid ${open ? activeTheme.accent + "50" : "var(--border)"}`,
              color: open ? activeTheme.accent : "var(--text-2)",
              fontFamily: "var(--font-mono)",
              transition: "all 0.2s ease",
            }}
          >
            {/* Live accent dot */}
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: activeTheme.accent,
                boxShadow: `0 0 6px ${activeTheme.accent}`,
              }}
            />
            <Palette size={12} />
            <span>{activeTheme.name}</span>
          </motion.button>

          {/* Dropdown panel */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className="absolute right-0 top-full mt-2 z-50 p-4 rounded-2xl"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-s)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                  minWidth: "260px",
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-[10px] uppercase tracking-widest"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-3)",
                    }}
                  >
                    Theme
                  </span>
                  <span
                    className="text-[10px] font-semibold"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: activeTheme.accent,
                    }}
                  >
                    {activeTheme.name} · {activeTheme.mode}
                  </span>
                </div>

                {/* Swatches */}
                <div className="flex items-start justify-between gap-2">
                  {THEMES.map((t) => {
                    const isActive = theme === t.id;
                    return (
                      <motion.button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          setOpen(false);
                        }}
                        whileHover={{ scale: 1.1, y: -3 }}
                        whileTap={{ scale: 0.93 }}
                        title={t.name}
                        className="flex flex-col items-center gap-1.5"
                        style={{ cursor: "pointer" }}
                      >
                        {/* Circle */}
                        <div
                          className="relative w-11 h-11 rounded-xl flex items-center justify-center"
                          style={{
                            background: t.bg,
                            border: isActive
                              ? `2.5px solid ${t.accent}`
                              : "2px solid rgba(128,128,128,0.2)",
                            boxShadow: isActive
                              ? `0 0 0 3px ${t.accent}35, 0 4px 16px rgba(0,0,0,0.3)`
                              : "0 2px 8px rgba(0,0,0,0.2)",
                            transition: "all 0.22s ease",
                          }}
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              background: t.accent,
                              boxShadow: `0 0 8px ${t.accent}90`,
                            }}
                          />
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: t.accent }}
                            >
                              <Check
                                size={9}
                                color={t.mode === "light" ? "#fff" : "#000"}
                                strokeWidth={3}
                              />
                            </motion.div>
                          )}
                        </div>

                        {/* Name */}
                        <span
                          className="text-[9px] font-semibold tracking-wide"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: isActive ? t.accent : "var(--text-3)",
                            transition: "color 0.2s",
                          }}
                        >
                          {t.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Mode labels */}
                <div
                  className="flex items-center gap-3 mt-3 pt-3"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                    <span
                      className="text-[9px] tracking-widest"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-4)",
                      }}
                    >
                      dark × 3
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                    <span
                      className="text-[9px] tracking-widest"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-4)",
                      }}
                    >
                      light × 2
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-1.5 bg-white text-black font-bold rounded-lg text-xs tracking-wide hover:bg-zinc-200 transition-colors duration-200"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Built for Digital Heroes
        </a>
      </div>
    </nav>
  );
}
