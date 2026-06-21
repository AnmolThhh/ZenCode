import { useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  Clock,
  Coffee,
  Eye,
  Zap,
  Target,
  Activity,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDuration(seconds) {
  if (!seconds || seconds < 1) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

function pct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

// ─── sub-components ─────────────────────────────────────────────────────────

function StatCard({ Icon, label, value, sub, color }) {
  return (
    <div
      className="flex flex-col gap-3 p-6 rounded-2xl"
      style={{
        background: "rgba(24,24,27,0.85)",
        border: `1px solid ${color}25`,
        boxShadow: `0 4px 24px ${color}08`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={13} style={{ color }} />
        <span
          className="text-[10px] text-zinc-500 uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </span>
      </div>
      <span
        className="text-2xl font-bold leading-none"
        style={{ color, fontFamily: "var(--font-mono)" }}
      >
        {value}
      </span>
      {sub && (
        <span
          className="text-[10px] text-zinc-600 tracking-wider"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

// Efficiency ring — SVG donut showing focus% of total time
function EfficiencyRing({ focusPct }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (focusPct / 100) * circ;

  const color =
    focusPct >= 75 ? "#34d399" : focusPct >= 50 ? "#f59e0b" : "#f87171";

  return (
    <div
      className="flex flex-col items-center gap-3 p-6 rounded-2xl flex-1 "
      style={{
        background: "rgba(24,24,27,0.85)",
        border: `1px solid ${color}25`,
      }}
    >
      <div className="flex items-center gap-2.5 self-start">
        <Target size={13} style={{ color }} />
        <span
          className="text-[10px] text-zinc-500 uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Efficiency
        </span>
      </div>
      <div className="relative flex items-center justify-center">
        <svg width={110} height={110} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={55}
            cy={55}
            r={r}
            fill="none"
            stroke="rgba(63,63,70,0.4)"
            strokeWidth={10}
          />
          {/* Progress */}
          <circle
            cx={55}
            cy={55}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{
              transition: "stroke-dasharray 0.8s ease, stroke 0.4s ease",
              filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span
            className="text-2xl font-black"
            style={{ color, fontFamily: "var(--font-mono)", lineHeight: 1 }}
          >
            {focusPct}%
          </span>
          <span
            className="text-[9px] text-zinc-600 tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            focus
          </span>
        </div>
      </div>
    </div>
  );
}

// Custom tooltip for area chart
const AreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-4 py-3 rounded-xl text-xs"
      style={{
        background: "rgba(9,9,11,0.97)",
        border: "1px solid rgba(63,63,70,0.7)",
        fontFamily: "var(--font-mono)",
        color: "#d4d4d8",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      }}
    >
      <div className="text-zinc-500 mb-2 text-[10px]">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="capitalize">{p.dataKey}:</span>
          <span style={{ color: p.color }}>{formatDuration(p.value * 60)}</span>
        </div>
      ))}
    </div>
  );
};

// Custom tooltip for bar chart
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-4 py-3 rounded-xl text-xs"
      style={{
        background: "rgba(9,9,11,0.97)",
        border: "1px solid rgba(63,63,70,0.7)",
        fontFamily: "var(--font-mono)",
        color: "#d4d4d8",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      }}
    >
      <div className="text-zinc-500 mb-2 text-[10px]">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.fill }}
          />
          <span className="capitalize">{p.dataKey}:</span>
          <span style={{ color: p.fill }}>{formatDuration(p.value * 60)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── main view ───────────────────────────────────────────────────────────────

export default function StatsView({ sessions }) {
  // Chart label: use "MMM D · HH:MM" so same-day sessions are distinct
  const chartData = useMemo(
    () =>
      sessions
        .slice(0, 14)
        .reverse()
        .map((s, i) => {
          const d = new Date(s.date);
          const dateStr = d.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          });
          const timeStr = d.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          return {
            // Use a unique index-based key so Recharts never merges points
            idx: i,
            label: `${dateStr} ${timeStr}`,
            shortLabel: timeStr, // shown on X-axis
            focus: Math.floor(s.focus / 60),
            break: Math.floor(s.break / 60),
            stray: Math.floor(s.stray / 60),
          };
        }),
    [sessions],
  );

  const totalFocus = useMemo(
    () => sessions.reduce((a, s) => a + s.focus, 0),
    [sessions],
  );
  const totalBreak = useMemo(
    () => sessions.reduce((a, s) => a + s.break, 0),
    [sessions],
  );
  const totalStray = useMemo(
    () => sessions.reduce((a, s) => a + s.stray, 0),
    [sessions],
  );
  const totalAll = totalFocus + totalBreak + totalStray;

  const bestFocus = useMemo(
    () => (sessions.length ? Math.max(...sessions.map((s) => s.focus)) : 0),
    [sessions],
  );
  const avgFocus = useMemo(
    () => (sessions.length ? Math.floor(totalFocus / sessions.length) : 0),
    [sessions, totalFocus],
  );
  const efficiencyPct = pct(totalFocus, totalAll);

  // Streak: consecutive days with at least 1 session
  const streak = useMemo(() => {
    if (!sessions.length) return 0;
    const days = new Set(
      sessions.map((s) => new Date(s.date).toLocaleDateString()),
    );
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (days.has(d.toLocaleDateString())) count++;
      else if (i > 0) break;
    }
    return count;
  }, [sessions]);

  return (
    <div className="flex-1 flex flex-col items-center overflow-y-auto no-scrollbar">
      <div className="flex flex-col w-full max-w-2xl px-10 pt-10 pb-25 gap-8">
        {/* Header */}
        <div>
          <h1
            className="text-3xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Analytics
          </h1>
          <p
            className="text-xs text-zinc-500 mt-1.5 tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {sessions.length} sessions recorded
          </p>
        </div>

        {/* Row 1 — 4 stat cards */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            Icon={TrendingUp}
            label="Best Focus"
            value={formatDuration(bestFocus)}
            color="#34d399"
            sub="single session"
          />
          <StatCard
            Icon={Clock}
            label="Avg Focus"
            value={formatDuration(avgFocus)}
            color="#818cf8"
            sub="per session"
          />
          <StatCard
            Icon={Coffee}
            label="Total Break"
            value={formatDuration(totalBreak)}
            color="#f59e0b"
            sub={`${sessions.length} sessions`}
          />
          <StatCard
            Icon={Eye}
            label="Total Stray"
            value={formatDuration(totalStray)}
            color="#f87171"
            sub="tab-away time"
          />
        </div>

        {/* Row 2 — Efficiency ring + Streak */}
        <div className="flex gap-4">
          <EfficiencyRing focusPct={efficiencyPct} />
          <div className="flex-1 flex flex-col gap-4">
            <div
              className="flex-1 flex flex-col justify-between p-6 rounded-2xl"
              style={{
                background: "rgba(24,24,27,0.85)",
                border: "1px solid rgba(251,191,36,0.2)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <Zap size={13} style={{ color: "#fbbf24" }} />
                <span
                  className="text-[10px] text-zinc-500 uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Streak
                </span>
              </div>
              <div>
                <span
                  className="text-4xl font-black"
                  style={{
                    color: "#fbbf24",
                    fontFamily: "var(--font-mono)",
                    lineHeight: 1,
                  }}
                >
                  {streak}
                </span>
                <span
                  className="text-xs text-zinc-600 ml-2"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  day{streak !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div
              className="flex-1 flex flex-col justify-between p-6 rounded-2xl"
              style={{
                background: "rgba(24,24,27,0.85)",
                border: "1px solid rgba(129,140,248,0.2)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <Activity size={13} style={{ color: "#818cf8" }} />
                <span
                  className="text-[10px] text-zinc-500 uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Total Focus
                </span>
              </div>
              <div>
                <span
                  className="text-2xl font-black"
                  style={{
                    color: "#818cf8",
                    fontFamily: "var(--font-mono)",
                    lineHeight: 1,
                  }}
                >
                  {formatDuration(totalFocus)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Focus History Area Chart — fixed: uses idx as dataKey so points are unique */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-5 "
          style={{
            background: "rgba(24,24,27,0.85)",
            border: "1px solid rgba(63,63,70,0.5)",
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2
                className="text-sm font-semibold text-zinc-200 tracking-wide"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Focus Timeline
              </h2>
              <p
                className="text-[10px] text-zinc-600 tracking-widest mt-0.5"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                last {chartData.length} sessions · minutes
              </p>
            </div>
            {chartData.length > 0 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px]"
                style={{
                  background: "rgba(52,211,153,0.1)",
                  border: "1px solid rgba(52,211,153,0.2)",
                  color: "#34d399",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                live
              </div>
            )}
          </div>

          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 gap-3">
              <TrendingUp size={32} className="text-zinc-800" />
              <p
                className="text-xs text-zinc-700 tracking-widest"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                complete a session to see your timeline
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -22, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                    <stop
                      offset="100%"
                      stopColor="#34d399"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(63,63,70,0.25)"
                  vertical={false}
                />
                {/* Use idx (numeric) as the axis key so same-date sessions stay separate */}
                <XAxis
                  dataKey="idx"
                  tickFormatter={(v) => chartData[v]?.shortLabel ?? ""}
                  tick={{
                    fill: "#52525b",
                    fontSize: 9,
                    fontFamily: "var(--font-mono)",
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={chartData.length > 7 ? "preserveStartEnd" : 0}
                />
                <YAxis
                  tick={{
                    fill: "#52525b",
                    fontSize: 9,
                    fontFamily: "var(--font-mono)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<AreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="focus"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  fill="url(#focusGrad)"
                  dot={{ fill: "#34d399", strokeWidth: 0, r: 3 }}
                  activeDot={{
                    r: 5,
                    fill: "#34d399",
                    stroke: "#09090b",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Focus vs Break vs Stray Bar Chart */}
        {chartData.length > 0 && (
          <div
            className="rounded-2xl p-6 flex flex-col gap-5"
            style={{
              background: "rgba(24,24,27,0.85)",
              border: "1px solid rgba(63,63,70,0.5)",
            }}
          >
            <div>
              <h2
                className="text-sm font-semibold text-zinc-200 tracking-wide"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Session Breakdown
              </h2>
              <p
                className="text-[10px] text-zinc-600 tracking-widest mt-0.5"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                focus · break · stray per session
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5">
              {[
                ["#34d399", "Focus"],
                ["#f59e0b", "Break"],
                ["#f87171", "Stray"],
              ].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: c }}
                  />
                  <span
                    className="text-[10px] text-zinc-500 tracking-wider"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {l}
                  </span>
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 5, left: -22, bottom: 0 }}
                barCategoryGap="35%"
                barGap={2}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(63,63,70,0.25)"
                  vertical={false}
                />
                <XAxis
                  dataKey="idx"
                  tickFormatter={(v) => chartData[v]?.shortLabel ?? ""}
                  tick={{
                    fill: "#52525b",
                    fontSize: 9,
                    fontFamily: "var(--font-mono)",
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={chartData.length > 7 ? "preserveStartEnd" : 0}
                />
                <YAxis
                  tick={{
                    fill: "#52525b",
                    fontSize: 9,
                    fontFamily: "var(--font-mono)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<BarTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar
                  dataKey="focus"
                  fill="#34d399"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="break"
                  fill="#f59e0b"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="stray"
                  fill="#f87171"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Session History List */}
        {sessions.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2
              className="text-sm font-semibold text-zinc-400 tracking-widest uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Recent Sessions
            </h2>
            <div className="flex flex-col gap-3">
              {sessions.slice(0, 10).map((s) => {
                const total = s.focus + s.break + s.stray;
                return (
                  <div
                    key={s.id}
                    className="flex flex-col gap-3 px-6 py-4 rounded-2xl"
                    style={{
                      background: "rgba(24,24,27,0.6)",
                      border: "1px solid rgba(63,63,70,0.35)",
                    }}
                  >
                    {/* Top row: date + stats */}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[11px] text-zinc-500"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {new Date(s.date).toLocaleDateString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                        &nbsp;·&nbsp;
                        {new Date(s.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <div className="flex items-center gap-4">
                        <span
                          className="text-xs font-semibold"
                          style={{
                            color: "#34d399",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {formatDuration(s.focus)}
                        </span>
                        <span
                          className="text-xs"
                          style={{
                            color: "#f59e0b",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {formatDuration(s.break)}
                        </span>
                        {s.stray > 0 && (
                          <span
                            className="text-xs"
                            style={{
                              color: "#f87171",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {formatDuration(s.stray)}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div
                      className="flex h-1.5 rounded-full overflow-hidden gap-px"
                      style={{ background: "rgba(63,63,70,0.3)" }}
                    >
                      <div
                        style={{
                          width: `${pct(s.focus, total)}%`,
                          background: "#34d399",
                          transition: "width 0.6s ease",
                        }}
                      />
                      <div
                        style={{
                          width: `${pct(s.break, total)}%`,
                          background: "#f59e0b",
                          transition: "width 0.6s ease",
                        }}
                      />
                      <div
                        style={{
                          width: `${pct(s.stray, total)}%`,
                          background: "#f87171",
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="h-2" />
      </div>
    </div>
  );
}
