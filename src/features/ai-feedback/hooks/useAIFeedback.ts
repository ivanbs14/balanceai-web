"use client";

import { useState, useCallback } from "react";
import { getAIFeedback, generateAIFeedback } from "../api";
import type { AIFeedbackResponse } from "../types";

interface UseAIFeedbackState {
  feedback: AIFeedbackResponse | null;
  loading: boolean;
  error: string | null;
  generating: boolean;
}

export function useAIFeedback() {
  const [state, setState] = useState<UseAIFeedbackState>({
    feedback: null,
    loading: false,
    error: null,
    generating: false,
  });

  const fetchFeedback = useCallback(async (month: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await getAIFeedback(month);
      setState({ feedback: data, loading: false, error: null, generating: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar feedback";
      setState({ feedback: null, loading: false, error: message, generating: false });
    }
  }, []);

  const generate = useCallback(async (month: string) => {
    setState((prev) => ({ ...prev, generating: true, error: null }));

    try {
      const data = await generateAIFeedback(month);
      setState({ feedback: data, loading: false, error: null, generating: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao gerar feedback";
      setState((prev) => ({ ...prev, generating: false, error: message }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      feedback: null,
      loading: false,
      error: null,
      generating: false,
    });
  }, []);

  return {
    ...state,
    fetchFeedback,
    generate,
    reset,
  };
}
