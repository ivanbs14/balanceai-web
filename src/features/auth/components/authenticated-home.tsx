"use client";

import { startTransition, useEffect, useState } from "react";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import {
  getGoogleLoginUrl,
  getSession,
  login,
  logout,
  waitForAuthApiReady,
} from "../api";
import { AuthUser } from "../types";
import { LoginForm } from "./login-form";

const AUTH_ERROR_MAP: Record<string, string> = {
  google_state_invalid: "Nao foi possivel validar o login com Google.",
  google_login_failed: "Nao foi possivel concluir o login com Google.",
};

export function AuthenticatedHome() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isApiWaking, setIsApiWaking] = useState(false);
  const [apiWakeAttempt, setApiWakeAttempt] = useState(0);
  const [apiWakeErrorMessage, setApiWakeErrorMessage] = useState<string | null>(
    null,
  );
  const authErrorMessage =
    typeof window === "undefined"
      ? null
      : AUTH_ERROR_MAP[
          new URLSearchParams(window.location.search).get("auth_error") ?? ""
        ] ?? null;

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
        errorMessage={errorMessage ?? authErrorMessage}
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
      <div className="absolute top-4 left-1/2 z-20 w-full max-w-none -translate-x-1/2 px-1 sm:max-w-[1440px] sm:px-6 lg:px-10">
        <div className="flex justify-end gap-3">
          <div className="hidden h-10 items-center border border-border bg-surface px-5 text-sm text-primary sm:inline-flex">
            {user.name}
          </div>
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
      <DashboardPage userId={user.id} />
    </div>
  );
}
