import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle, Circle, Trash2 } from 'lucide-react';

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="group flex items-center gap-4 px-6 py-4 rounded-2xl"
      style={{
        background: task.done ? 'rgba(24,24,27,0.4)' : 'rgba(24,24,27,0.85)',
        border: task.done
          ? '1px solid rgba(63,63,70,0.25)'
          : '1px solid rgba(63,63,70,0.6)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className="shrink-0 transition-transform hover:scale-110 active:scale-95"
        style={{ color: task.done ? '#34d399' : '#52525b' }}
      >
        {task.done ? <CheckCircle size={20} /> : <Circle size={20} />}
      </button>

      {/* Task text */}
      <span
        className="flex-1 text-sm leading-relaxed"
        style={{
          fontFamily: 'var(--font-mono)',
          color: task.done ? '#52525b' : '#d4d4d8',
          textDecoration: task.done ? 'line-through' : 'none',
          textDecorationColor: '#52525b',
          transition: 'all 0.35s ease',
        }}
      >
        {task.text}
      </span>

      {/* Timestamp */}
      <span
        className="text-[10px] shrink-0 hidden sm:inline"
        style={{ color: '#3f3f46', fontFamily: 'var(--font-mono)' }}
      >
        {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
        style={{ color: '#52525b' }}
      >
        <Trash2 size={15} />
      </button>
    </motion.div>
  );
}

export default function TaskView({ tasks, setTasks }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const pending = tasks.filter((t) => !t.done);
  const completed = tasks.filter((t) => t.done);

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    setTasks((prev) => [
      { id: Date.now(), text, done: false, createdAt: Date.now() },
      ...prev,
    ]);
    setInput('');
    inputRef.current?.focus();
  };

  const toggleTask = (id) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTask = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const clearCompleted = () =>
    setTasks((prev) => prev.filter((t) => !t.done));

  return (
    <div className="flex-1 flex flex-col items-center overflow-hidden">
      <div className="flex flex-col w-full max-w-2xl px-10 pt-10 pb-6 gap-8 h-full overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-3xl font-bold text-white tracking-tight"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Task Queue
            </h1>
            <p
              className="text-xs text-zinc-500 mt-1.5 tracking-widest"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {pending.length} remaining&nbsp;·&nbsp;{completed.length} done
            </p>
          </div>
          {completed.length > 0 && (
            <button
              onClick={clearCompleted}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors tracking-wide mt-1"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              clear done
            </button>
          )}
        </div>

        {/* Input */}
        <div
          className="flex items-center gap-4 px-6 py-4 rounded-2xl"
          style={{
            background: 'rgba(24,24,27,0.9)',
            border: '1px solid rgba(63,63,70,0.7)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a task and press Enter..."
            className="flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder-zinc-700"
            style={{ fontFamily: 'var(--font-mono)' }}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={addTask}
            disabled={!input.trim()}
            className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
            style={{
              background: input.trim()
                ? 'linear-gradient(135deg, #34d399, #059669)'
                : 'rgba(63,63,70,0.5)',
              color: input.trim() ? '#000' : '#52525b',
              transition: 'all 0.2s',
            }}
          >
            <Plus size={18} />
          </motion.button>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-6 pb-4">
          {/* Pending */}
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {pending.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3 py-20 text-center"
                >
                  <CheckCircle size={38} className="text-zinc-800" />
                  <p
                    className="text-xs text-zinc-600 tracking-widest"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    no pending tasks
                  </p>
                </motion.div>
              )}
              {pending.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Completed Section */}
          {completed.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-zinc-800" />
                <span
                  className="text-[10px] text-zinc-600 tracking-widest uppercase"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Completed
                </span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>
              <AnimatePresence mode="popLayout">
                {completed.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
