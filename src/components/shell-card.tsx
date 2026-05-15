"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

export function ShellCard({
  title,
  eyebrow,
  action,
  className = "",
  children,
}: {
  title: string;
  eyebrow?: string;
  action?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      {...fadeUp}
      transition={{ duration: 0.38 }}
      className={`group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(132,204,22,0.06),transparent_30%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-slate-500">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        </div>
        {action ? (
          <button className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
            {action}
          </button>
        ) : null}
      </div>
      <div className="relative mt-5">{children}</div>
    </motion.section>
  );
}
