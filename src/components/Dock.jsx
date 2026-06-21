import { motion } from "framer-motion";

export default function Dock({ views, activeIndex, onNavigate }) {
  return (
    <div className="shrink-0 flex justify-center pb-8 pt-4 absolute bottom-0 inset-x-0">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
        style={{
          background: "var(--dock-bg)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid var(--border)",
          boxShadow:
            "0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)",
          transition: "background 0.35s ease",
        }}
        className="flex items-center gap-2 px-5 py-3 rounded-3xl"
      >
        {views.map(({ label, Icon }, idx) => {
          const isActive = activeIndex === idx;
          return (
            <motion.button
              key={label}
              onClick={() => onNavigate(idx)}
              whileHover={{ scale: 1.14, y: -5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              title={label}
              className="relative flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl cursor-pointer"
              style={{
                background: isActive ? "rgba(161,161,170,0.16)" : "transparent",
                border: isActive
                  ? "1px solid rgba(161,161,170,0.22)"
                  : "1px solid transparent",
                transition: "background 0.2s, border 0.2s",
                minWidth: "64px",
              }}
            >
              <Icon
                size={22}
                className={isActive ? "text-white" : "text-zinc-500"}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className="text-[9px] tracking-widest uppercase"
                style={{
                  color: isActive ? "#fff" : "#71717a",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {label}
              </span>

              {/* Active dot */}
              {isActive && (
                <motion.span
                  layoutId="dock-dot"
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
