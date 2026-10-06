"use client";

import { startTransition, useEffect, useState } from "react";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import {
  getGoogleLoginUrl,
  getSession,
  login,
  logout,
  startGoogleLink,
  waitForAuthApiReady,
} from "../api";
import { AuthUser } from "../types";
import { LoginForm } from "./login-form";

const AUTH_ERROR_MAP: Record<string, string> = {
  google_state_invalid: "Nao foi possivel validar o login com Google.",
  google_login_failed: "Nao foi possivel concluir o login com Google.",
  google_link_required: "Esta conta exige login local e vínculo explícito com Google.",
};

export function AuthenticatedHome() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGoogleLink, setShowGoogleLink] = useState(false);
  const [linkPassword, setLinkPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [returnAuthError, setReturnAuthError] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : AUTH_ERROR_MAP[new URLSearchParams(window.location.search).get("auth_error") ?? ""] ?? null,
  );
  const [isApiReady, setIsApiReady] = useState(false);
  const [isApiWaking, setIsApiWaking] = useState(false);
  const [apiWakeAttempt, setApiWakeAttempt] = useState(0);
  const [apiWakeErrorMessage, setApiWakeErrorMessage] = useState<string | null>(
    null,
  );
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("auth_error");

    if (authError && AUTH_ERROR_MAP[authError]) {
      params.delete("auth_error");
      const nextQuery = params.toString();
      const nextUrl = nextQuery
        ? `${window.location.pathname}?${nextQuery}`
        : window.location.pathname;
      window.history.replaceState({}, "", nextUrl);
    }

    let isMounted = true;

    startTransition(() => {
      getSession()
        .then((session) => {
          if (!isMounted) {
            return;
          }

          setUser(session?.user ?? null);
          setIsApiReady(true);
          setErrorMessage(null);
        })
        .catch(() => {
          if (!isMounted) {
            return;
          }

          setUser(null);
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isLoading || user || isApiReady || isApiWaking) {
      return;
    }

    let isMounted = true;

    setIsApiWaking(true);
    setApiWakeErrorMessage(null);

    waitForAuthApiReady()
      .then(() => {
        if (!isMounted) {
          return;
        }

        setIsApiReady(true);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setApiWakeErrorMessage(
          "Nao foi possivel acordar a API. Tente novamente para liberar o login.",
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsApiWaking(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiWakeAttempt, isApiReady, isApiWaking, isLoading, user]);

  function handleRetryApiWake() {
    setIsApiReady(false);
    setApiWakeErrorMessage(null);
    setApiWakeAttempt((current) => current + 1);
  }

  async function handleLogin(email: string, password: string) {
    if (!isApiReady || isApiWaking) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const session = await login(email, password);
      setUser(session.user);
      setReturnAuthError(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel entrar",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await logout();
      setUser(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel sair",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleLogin() {
    if (!isApiReady || isApiWaking) {
      return;
    }

    window.location.assign(getGoogleLoginUrl());
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,var(--color-background)_0%,var(--color-canvas)_100%)] px-6 text-primary">
        <p className="font-mono text-sm uppercase tracking-[0.2em]">
          Carregando sessao...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <LoginForm
        apiWakeErrorMessage={apiWakeErrorMessage}
        errorMessage={errorMessage ?? returnAuthError}
        isApiReady={isApiReady}
        isApiWaking={isApiWaking}
        isSubmitting={isSubmitting}
        onGoogleLogin={handleGoogleLogin}
        onRetryApiWake={handleRetryApiWake}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div className="relative">
      {returnAuthError ? (
        <div role="alert" className="fixed top-16 left-1/2 z-40 w-[min(90vw,36rem)] -translate-x-1/2 rounded-lg border border-border bg-surface p-4 text-sm text-foreground shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <span>{returnAuthError}</span>
            <button type="button" onClick={() => setReturnAuthError(null)} aria-label="Fechar aviso de autenticação">Fechar</button>
          </div>
        </div>
      ) : null}
      <div className="absolute top-4 left-1/2 z-20 w-full max-w-none -translate-x-1/2 px-1 sm:max-w-[1440px] sm:px-6 lg:px-10">
        <div className="flex justify-end gap-3">
          <div className="hidden h-10 items-center border border-border bg-surface px-5 text-sm text-primary sm:inline-flex">
            {user.name}
          </div>
          <button type="button" onClick={() => setShowGoogleLink(true)} className="inline-flex h-8 items-center border border-primary bg-surface px-3 text-[0.8rem] text-primary sm:h-10 sm:px-5 sm:text-sm">Vincular Google</button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSubmitting}
            className="inline-flex h-8 items-center justify-center border border-primary bg-surface px-3 text-[0.8rem] font-semibold text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-70 sm:h-10 sm:px-5 sm:text-sm"
          >
            {isSubmitting ? "Saindo..." : "Sair"}
          </button>
        </div>
      </div>
      {showGoogleLink ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" role="presentation" onClick={() => setShowGoogleLink(false)}>
        <form className="w-full max-w-sm rounded-xl bg-surface p-6 text-foreground shadow-xl" role="dialog" aria-modal="true" aria-labelledby="google-link-title" onClick={(event) => event.stopPropagation()} onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          setErrorMessage(null);
          try {
            const { authorizationUrl } = await startGoogleLink(linkPassword);
            window.location.assign(authorizationUrl);
          } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Não foi possível iniciar o vínculo.");
            setIsSubmitting(false);
          }
        }}>
          <h2 id="google-link-title" className="text-xl font-semibold">Vincular conta Google</h2>
          <p className="mt-2 text-sm">Confirme sua senha local antes de continuar no Google.</p>
          <label htmlFor="google-link-password" className="mt-4 block text-sm">Senha atual</label>
          <input id="google-link-password" type="password" autoComplete="current-password" required value={linkPassword} onChange={(event) => setLinkPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-surface p-2" />
          {errorMessage ? <p role="alert" className="mt-3 text-sm text-danger-foreground">{errorMessage}</p> : null}
          <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setShowGoogleLink(false)}>Cancelar</button><button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">Continuar</button></div>
        </form>
      </div> : null}
      <DashboardPage userId={user.id} />
    </div>
  );
}
