"use client";

import { ArrowRight, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatNumber, type AdminAccount, type Summary } from "@/lib/admin-api";

export function DashboardWelcome({
    active,
    account,
    summary,
    loading,
    onRefresh,
    onViewUsers,
}: {
    active: string;
    account: AdminAccount;
    summary: Summary | null;
    loading: boolean;
    onRefresh: () => void;
    onViewUsers: () => void;
}) {
    const [today, setToday] = useState("");
    const [noticeDismissed, setNoticeDismissed] = useState(false);
    useEffect(
        () =>
            setToday(
                new Date().toLocaleDateString("en-ZA", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                }),
            ),
        [],
    );
    return (
        <>
            <div className="welcome-row">
                <div>
                    <div className="eyebrow">
                        <span className="eyebrow-line" />
                        {today}
                    </div>
                    <h1>
                        {active === "Overview"
                            ? `Welcome, ${account.name.split(" ")[0]}`
                            : active}
                    </h1>
                    <p className="page-subtitle">
                        Manage accounts and administrator access.
                    </p>
                </div>
                <div className="welcome-actions">
                    <button
                        className="button button-secondary"
                        onClick={onRefresh}
                        disabled={loading}
                    >
                        <RefreshCw
                            size={15}
                            className={loading ? "spin" : ""}
                        />
                        {loading ? "Refreshing…" : "Refresh"}
                    </button>
                </div>
            </div>
            {active === "Overview" && summary && !noticeDismissed && (
                <div className="notice-strip">
                    <p>
                        <b>{formatNumber(summary.newUsers)} new accounts</b>{" "}
                        joined during the last 30 days.{" "}
                        <button onClick={onViewUsers}>
                            View users <ArrowRight size={13} />
                        </button>
                    </p>
                    <button
                        type="button"
                        className="notice-close"
                        aria-label="Dismiss new accounts notice"
                        onClick={() => setNoticeDismissed(true)}
                    >
                        <X size={15} />
                    </button>
                </div>
            )}
        </>
    );
}
