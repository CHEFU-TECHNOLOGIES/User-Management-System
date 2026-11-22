"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminApi,
  errorMessage,
  isAccessError,
  invalidateAdminReads,
  type AdminAccount,
  type Summary,
} from "@/lib/admin-api";

export function useDashboard() {
  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [access, setAccess] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(async () => {
    setLoading(true);
    await invalidateAdminReads();
    setRevision((value) => value + 1);
  }, []);
  const refreshData = useCallback(() => {
    // The API client already invalidated and persisted the mutation's changes.
    setRevision((value) => value + 1);
  }, []);
  const handleAccess = useCallback((error: unknown) => {
    if (!isAccessError(error)) return;
    setAccess(error.status);
    setAccount(null);
    setSummary(null);
  }, []);

  useEffect(() => {
    const clear = () => {
      setAccount(null);
      setSummary(null);
      setAccess(401);
      setLoading(false);
    };
    window.addEventListener("chefu-admin-session-cleared", clear);
    return () =>
      window.removeEventListener("chefu-admin-session-cleared", clear);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setSummary(null);
    void (async () => {
      try {
        const account = await adminApi<AdminAccount>("/session", {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setAccount(account);
        setAccess(null);
        const summary = await adminApi<Summary>(`/summary?days=${days}`, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setSummary(summary);
      } catch (error) {
        if (controller.signal.aborted) return;
        handleAccess(error);
        setError(errorMessage(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [days, revision, handleAccess]);

  return {
    account,
    summary,
    access,
    error,
    loading,
    days,
    setDays,
    reload,
    refreshData,
    revision,
    handleAccess,
  };
}
