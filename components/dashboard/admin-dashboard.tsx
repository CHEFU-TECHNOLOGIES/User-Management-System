"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { openAccount } from "@/lib/admin-api";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { DashboardWelcome } from "./dashboard-welcome";
import { DashboardMetrics } from "./dashboard-metrics";
import { UserGrowthChart } from "./user-growth-chart";
import { RoleDistribution } from "./role-distribution";
import { UserDirectory } from "./user-directory";
import { AuditLog } from "./audit-log";
import { useDashboard } from "./use-dashboard";
import { AppsSection } from "../apps/apps-section";

export function AdminDashboard() {
    const dashboard = useDashboard();
    const { account, summary, access, error, loading, reload, handleAccess } =
        dashboard;
    const [active, setActive] = useState("Overview");
    const [auditVisited, setAuditVisited] = useState(false);
    const [auditRevision, setAuditRevision] = useState(dashboard.revision);
    const [dark, setDark] = useState(false);
    const [notice, setNotice] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const noticeTimer = useRef<number | undefined>(undefined);
    useEffect(() => {
        setDark(localStorage.getItem("chefu-admin-theme") === "dark");
    }, []);
    useEffect(() => () => window.clearTimeout(noticeTimer.current), []);
    const toggleTheme = () =>
        setDark((current) => {
            localStorage.setItem(
                "chefu-admin-theme",
                current ? "light" : "dark",
            );
            return !current;
        });
    const notify = (message: string) => {
        window.clearTimeout(noticeTimer.current);
        setNotice(message);
        noticeTimer.current = window.setTimeout(() => setNotice(""), 4000);
    };

    if (!account || access)
        return (
            <main className="access-screen">
                <section className="panel access-panel">
                    <h1>CT User Management</h1>
                    {loading ? (
                        <p role="status">
                            Checking your administrator session…
                        </p>
                    ) : (
                        <>
                            <p role={error ? "alert" : undefined}>
                                {access === 401
                                    ? "Sign in with your administrator account to continue."
                                    : access === 403
                                      ? "This account does not have administrator access."
                                      : error || "Sign in to manage accounts."}
                            </p>
                            <div className="dialog-actions">
                                <button
                                    className="button button-primary"
                                    onClick={() => void openAccount("/login")}
                                >
                                    {access === 403
                                        ? "Choose another account"
                                        : "Sign in"}
                                </button>
                                <button
                                    className="button button-secondary"
                                    onClick={reload}
                                >
                                    Retry connection
                                </button>
                            </div>
                        </>
                    )}
                </section>
            </main>
        );

    const showAnalytics = active === "Overview" || active === "Analytics";
    const showUsers = [
        "Overview",
        "Users",
        "Roles & permissions",
    ].includes(active);
    return (
        <div className={`app-shell ${dark ? "theme-dark" : ""}`}>
            <DashboardSidebar
                active={active}
                account={account}
                mobileOpen={mobileOpen}
                onNavigate={(name) => {
                    setActive(name);
                    if (name === "Audit logs") {
                        setAuditVisited(true);
                        setAuditRevision(dashboard.revision);
                    }
                    setMobileOpen(false);
                }}
            />
            {mobileOpen && (
                <button
                    className="mobile-scrim"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation"
                />
            )}
            <main className="main-area">
                <DashboardHeader
                    active={active}
                    account={account}
                    dark={dark}
                    onOpenNavigation={() => setMobileOpen(true)}
                    onToggleTheme={toggleTheme}
                />
                <div className="page-content">
                    <DashboardWelcome
                        active={active}
                        account={account}
                        summary={summary}
                        loading={loading}
                        onRefresh={reload}
                        onViewUsers={() => {
                            setActive("Users");
                        }}
                    />
                    {error && (
                        <div className="inline-error" role="alert">
                            {error}{" "}
                            <button onClick={reload} disabled={loading}>
                                Retry
                            </button>
                        </div>
                    )}
                    {showAnalytics && (
                        <>
                            <DashboardMetrics summary={summary} />
                            <section className="analytics-grid">
                                <UserGrowthChart
                                    summary={summary}
                                    days={dashboard.days}
                                    onRangeChange={dashboard.setDays}
                                />
                                <RoleDistribution summary={summary} />
                            </section>
                        </>
                    )}
                    {active === "Roles & permissions" && (
                        <div className="notice-strip">
                            <p>
                                Open an account’s action menu to change its
                                role. Administrator accounts can manage all
                                central users.
                            </p>
                        </div>
                    )}
                    {showUsers && (
                        <UserDirectory
                            currentUid={account.uid}
                            revision={dashboard.revision}
                            onChanged={dashboard.refreshData}
                            onAccessError={handleAccess}
                            notify={notify}
                        />
                    )}
                    {auditVisited && (
                        <div hidden={active !== "Audit logs"}>
                            <AuditLog
                                revision={auditRevision}
                                onAccessError={handleAccess}
                            />
                        </div>
                    )}
                    {active === "Apps" && (
                        <AppsSection
                            owner={account.email}
                            revision={dashboard.revision}
                            onChanged={dashboard.refreshData}
                            onAccessError={handleAccess}
                        />
                    )}
                    {active === "Settings" && (
                        <section className="panel settings-panel">
                            <h2>Your account</h2>
                            <p>
                                {account.name} · {account.email}
                            </p>
                            <p>
                                Manage your profile, password, sessions, and
                                multi-factor authentication in your account.
                            </p>
                            <div className="dialog-actions">
                                <button
                                    className="button button-primary"
                                    onClick={() => void openAccount("/account")}
                                >
                                    Open Account
                                </button>
                                <button
                                    className="button button-secondary"
                                    onClick={toggleTheme}
                                >
                                    Use {dark ? "light" : "dark"} theme
                                </button>
                            </div>
                        </section>
                    )}
                    <footer className="page-footer">
                        <span>
                            © {new Date().getFullYear()} Chefu Technologies
                        </span>
                        {summary && (
                            <span>
                                Updated{" "}
                                {new Date(
                                    summary.generatedAt,
                                ).toLocaleTimeString("en-ZA")}
                            </span>
                        )}
                    </footer>
                </div>
                {notice && (
                    <div className="toast" role="status">
                        {notice}
                        <button
                            aria-label="Dismiss notification"
                            onClick={() => setNotice("")}
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
