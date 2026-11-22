"use client";

import { useState } from "react";
import { ArrowRight, Command, Sparkles, X } from "lucide-react";

type DashboardWelcomeProps = {
  active: string;
  notify: (message: string) => void;
  onViewUsers: () => void;
};

export function DashboardWelcome({
  active,
  notify,
  onViewUsers,
}: DashboardWelcomeProps) {
  const [showNotice, setShowNotice] = useState(true);

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            MONDAY, JANUARY 20, 2025
          </div>
          <h1>{active === "Overview" ? "Good morning, Jordan" : active}</h1>
          <p className="page-subtitle">
            {active === "Overview"
              ? "Here's what's happening with your workspace today."
              : `Manage and monitor ${active.toLowerCase()} across your workspace.`}
          </p>
        </div>
        <div className="welcome-actions">
          <button
            className="button button-secondary"
            onClick={() => notify("Dashboard link copied to clipboard")}
          >
            <Command size={15} />
            Share dashboard
          </button>
        </div>
      </div>
      {showNotice && (
        <div className="notice-strip">
          <div className="notice-icon">
            <Sparkles size={15} />
          </div>
          <p>
            <b>Your workspace is looking good.</b> You&apos;ve invited 12 new
            users this month.{" "}
            <button onClick={onViewUsers}>
              View users <ArrowRight size={13} />
            </button>
          </p>
          <button
            className="notice-close"
            aria-label="Dismiss message"
            onClick={() => setShowNotice(false)}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}
