"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

type LoginFormProps = {
  errorMessage: string | null;
  isSubmitting: boolean;
  onGoogleLogin: () => void;
  onSubmit: (email: string, password: string) => Promise<void>;
};

function GoogleMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 48"
      className="h-7 w-7 shrink-0"
      role="img"
    >
      <path
        fill="#FFC107"
        d="M43.61 20.08H42V20H24v8h11.3C33.65 32.66 29.2 36 24 36c-6.62 0-12-5.38-12-12S17.38 12 24 12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66C34.05 6.05 29.27 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.34-.14-2.65-.39-3.92Z"
      />
      <path
        fill="#FF3D00"
        d="M6.31 14.69 12.88 19.5C14.66 15.09 18.98 12 24 12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66C34.05 6.05 29.27 4 24 4 16.32 4 9.66 8.34 6.31 14.69Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.17 0 9.86-1.98 13.41-5.2l-6.19-5.24C29.15 35.15 26.68 36 24 36c-5.18 0-9.62-3.32-11.28-7.95l-6.52 5.02C9.51 39.56 16.22 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.61 20.08H42V20H24v8h11.3a12.02 12.02 0 0 1-4.09 5.56l.01-.01 6.19 5.24C36.97 39.17 44 34 44 24c0-1.34-.14-2.65-.39-3.92Z"
      />
    </svg>
  );
}

export function LoginForm({
  errorMessage,
  isSubmitting,
  onGoogleLogin,
  onSubmit,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(email, password);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 text-foreground sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(rgba(217,119,6,0.22) 0.8px, transparent 0.8px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute left-6 top-6 hidden h-40 w-40 rounded-sm border border-border bg-[linear-gradient(160deg,var(--color-canvas)_0%,var(--color-primary-soft)_100%)] opacity-80 lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-6 right-6 hidden h-44 w-44 border border-border bg-[linear-gradient(180deg,var(--color-primary-soft)_0%,var(--color-canvas)_100%)] lg:block"
      >
        <div className="absolute bottom-8 left-1/2 h-40 w-28 -translate-x-1/2 rounded-md border border-border bg-canvas" />
      </div>

      <div className="relative z-10 w-full max-w-110">
        <header className="mb-10 text-center">
          <div className="mb-5 flex justify-center">
            <Image
              src="/logoai.svg"
              alt="Balance-ai"
              width={96}
              height={96}
              className="h-24"
              style={{ width: "auto" }}
              priority
            />
          </div>
          <h1 className="text-[40px] font-bold leading-12 tracking-[-0.02em] text-primary">
            Balance-ai
          </h1>
          <p className="mt-2 text-sm leading-5 text-foreground">
            Sua vida financeira como um cuidado a mais.
          </p>
        </header>

        <section className="rounded-md border border-border bg-surface/95 p-6 sm:p-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                className="block font-mono text-xs uppercase tracking-[0.2em] text-primary"
                htmlFor="email"
              >
                E-mail
              </label>
              <div className="relative border border-border bg-surface-soft transition focus-within:border-primary">
                <Mail
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  size={18}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full border-none bg-transparent py-3 pl-12 pr-4 text-[13px] font-medium leading-4.5 text-foreground outline-none placeholder:text-muted/60"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label
                  className="block font-mono text-xs uppercase tracking-[0.2em] text-primary"
                  htmlFor="password"
                >
                  Senha
                </label>
                <button
                  type="button"
                  className="font-mono text-xs tracking-wider text-muted transition hover:text-primary"
                >
                  Esqueci minha senha
                </button>
              </div>

              <div className="relative border border-border bg-surface-soft transition focus-within:border-primary">
                <Lock
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  size={18}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full border-none bg-transparent py-3 pl-12 pr-14 text-[13px] font-medium leading-4.5 text-foreground outline-none placeholder:text-muted/60"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-3 text-[13px] text-foreground">
              <input
                type="checkbox"
                className="h-5 w-5 rounded-xs border border-border text-primary focus:ring-primary"
              />
              <span>Lembrar deste dispositivo</span>
            </label>

            {errorMessage ? (
              <p className="border border-destructive/20 bg-danger-soft px-4 py-3 text-sm text-danger-foreground">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full border-b-4 border-black/10 bg-primary px-4 py-3.5 text-[20px] font-semibold leading-7 text-white transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              onClick={onGoogleLogin}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-4 border border-border bg-surface-soft px-4 py-3.5 text-[22px] font-medium tracking-[-0.02em] text-foreground transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              <GoogleMark />
              Google
            </button>
          </form>

          <div className="my-10 flex items-center">
            <div className="h-px flex-1 bg-border" />
            <span className="px-4 font-mono text-xs uppercase tracking-[0.2em] text-muted/60">
              OU
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <footer className="text-center text-foreground">
            <p className="text-sm leading-5">
              Ainda nao tem uma conta?{" "}
              <button
                type="button"
                className="font-bold text-primary transition hover:text-primary-strong"
              >
                Criar conta
              </button>
            </p>
          </footer>
        </section>

        <p className="mt-8 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          <ShieldCheck size={16} />
          Ambiente seguro e criptografado
        </p>
      </div>
    </main>
  );
}
