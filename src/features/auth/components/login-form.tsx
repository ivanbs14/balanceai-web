"use client";

import { FormEvent, useState } from "react";

type LoginFormProps = {
  errorMessage: string | null;
  isSubmitting: boolean;
  onSubmit: (email: string, password: string) => Promise<void>;
};

export function LoginForm({
  errorMessage,
  isSubmitting,
  onSubmit,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(email, password);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7f8_0%,#f6e5ec_100%)] px-6 py-10 text-foreground">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section className="space-y-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
            Balance
          </p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
            Entre para continuar o controle financeiro do seu mes.
          </h1>
          <p className="max-w-lg text-base leading-7 text-muted sm:text-lg">
            A sessao web agora usa cookie seguro emitido pelo backend. Faca login
            para abrir sua dashboard.
          </p>
        </section>

        <section className="border border-border bg-surface p-6 shadow-[0_24px_80px_rgba(112,31,72,0.08)] sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border border-border bg-white px-4 py-3 outline-none transition focus:border-primary"
                placeholder="voce@exemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-border bg-white px-4 py-3 outline-none transition focus:border-primary"
                placeholder="Sua senha"
                required
              />
            </div>

            {errorMessage ? (
              <p className="border border-[#d5a4b8] bg-[#fff2f6] px-4 py-3 text-sm text-primary">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
