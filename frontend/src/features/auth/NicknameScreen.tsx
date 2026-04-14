import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

export function NicknameScreen() {
  const [input, setInput] = useState('');
  const setNickname = useAuthStore((s) => s.setNickname);

  return (
    <section className="w-full max-w-sm rounded-2xl bg-slate-900 p-6 shadow-xl">
      <h1 className="text-2xl font-semibold mb-4">Enter Nickname</h1>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full rounded-lg bg-slate-800 px-4 py-3 outline-none"
        placeholder="Nickname"
      />

      <button
        onClick={() => setNickname(input)}
        className="mt-4 w-full rounded-lg bg-cyan-500 py-3 font-medium"
      >
        Continue
      </button>
    </section>
  );
}