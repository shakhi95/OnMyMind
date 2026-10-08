import { useState } from 'react';
import type { FormEvent } from 'react';
import { Sparkles } from 'lucide-react';

export function LoginView({
  authError,
  onSignIn,
  onSignUp,
}: {
  authError: string;
  onSignIn: (username: string, password: string) => Promise<boolean>;
  onSignUp: (username: string, password: string) => Promise<boolean>;
}) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === 'signin') await onSignIn(username, password);
      else await onSignUp(username, password);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-[380px] rounded-2xl border border-line bg-surface/90 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <div className="mb-7 flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-panel text-accent">
            <Sparkles size={18} />
          </span>
          <div>
            <div className="font-display text-[18px] font-bold tracking-[-0.8px] text-ink">
              on my mind<span className="text-accent">.</span>
            </div>
            <p className="mt-0.5 text-[12px] text-soft">
              {mode === 'signin' ? 'Sign in to continue' : 'Create an account'}
            </p>
          </div>
        </div>

        <form className="grid gap-3.5" onSubmit={submit}>
          <label className="grid gap-1.5">
            <span className="text-[11px] font-bold tracking-[0.6px] text-soft uppercase">Username</span>
            <input
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="rounded-lg border border-line bg-bg px-3 py-2.5 text-[14px] text-ink outline-none placeholder:text-soft/70 focus:border-edge"
              placeholder="yourname"
              disabled={busy}
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-bold tracking-[0.6px] text-soft uppercase">Password</span>
            <input
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-lg border border-line bg-bg px-3 py-2.5 text-[14px] text-ink outline-none placeholder:text-soft/70 focus:border-edge"
              placeholder="••••••••"
              disabled={busy}
            />
          </label>

          {authError ? (
            <p className="rounded-md border border-[#69483e] bg-[#201d20] px-3 py-2 text-[12px] text-[#d7b1a5]" role="alert">
              {authError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 cursor-pointer rounded-lg border-0 bg-panel px-3 py-2.5 text-[13px] font-semibold text-ink hover:bg-hover disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <p className="mt-5 text-center text-[12px] text-soft">
          {mode === 'signin' ? (
            <>
              No account?{' '}
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent p-0 text-ink underline-offset-2 hover:underline"
                onClick={() => setMode('signup')}
                disabled={busy}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent p-0 text-ink underline-offset-2 hover:underline"
                onClick={() => setMode('signin')}
                disabled={busy}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
