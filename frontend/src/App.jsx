import React from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-md p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Tailwind CSS Active
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Vite + React
        </h1>
        <p className="text-slate-400 text-sm">
          Frontend is ready. Tailwind CSS v4 is verified and running.
        </p>
      </div>
    </div>
  );
}
