"use client";

import { useState } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { DashboardWelcome } from "./dashboard-welcome";
import { DashboardMetrics } from "./dashboard-metrics";
import { UserGrowthChart } from "./user-growth-chart";
import { RoleDistribution } from "./role-distribution";
import { UserDirectory } from "./user-directory";
import { Check, X } from "lucide-react";

export function AdminDashboard() {
  const [active, setActive] = useState("Overview");
  const [dark, setDark] = useState(false);
  const [notice, setNotice] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };

  return (
    <div className={`app-shell ${dark ? "theme-dark" : ""}`}>
      <DashboardSidebar
        active={active}
        mobileOpen={mobileOpen}
        onNavigate={(name) => {
          setActive(name);
          setMobileOpen(false);
        }}
        notify={notify}
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
          dark={dark}
          onOpenNavigation={() => setMobileOpen(true)}
          onToggleTheme={() => setDark(!dark)}
          onNotifications={() => {
            setActive("Notifications");
            notify("You’re all caught up");
          }}
        />
        <div className="page-content">
          <DashboardWelcome
            active={active}
            notify={notify}
            onViewUsers={() => {
              setActive("Users");
              document
                .querySelector(".directory-card")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          />
          <DashboardMetrics />
          <section className="analytics-grid">
            <UserGrowthChart />
            <RoleDistribution notify={notify} />
          </section>
          <UserDirectory notify={notify} />
          <footer className="page-footer">
            <span>© {new Date().getFullYear()} Chefu Technologies</span>
            <a href="mailto:support@layers.com">Privacy · Terms · Help</a>
          </footer>
        </div>
        {notice && (
          <div className="toast" role="status">
            <span className="toast-check">
              <Check size={14} />
            </span>
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
