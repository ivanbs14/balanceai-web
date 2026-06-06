"use client";

import { startTransition, useEffect, useState } from "react";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { getSession, login, logout } from "../api";
import { AuthUser } from "../types";
import { LoginForm } from "./login-form";

export function AuthenticatedHome() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
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

  async function handleLogin(email: string, password: string) {
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

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fff7f8_0%,#f6e5ec_100%)] px-6 text-primary">
        <p className="font-mono text-sm uppercase tracking-[0.2em]">
          Carregando sessao...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <LoginForm
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        <div className="hidden border border-border bg-surface px-4 py-2 text-sm text-primary sm:block">
          {user.name}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isSubmitting}
          className="border border-primary bg-surface px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Saindo..." : "Sair"}
        </button>
      </div>
      <DashboardPage />
    </div>
  );
}
