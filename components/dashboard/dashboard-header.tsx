"use client";

import { Bell, ChevronRight, Menu, Moon, Sun } from "lucide-react";

type DashboardHeaderProps = {
  active: string;
  dark: boolean;
  onOpenNavigation: () => void;
  onToggleTheme: () => void;
  onNotifications: () => void;
};

export function DashboardHeader({
  active,
  dark,
  onOpenNavigation,
  onToggleTheme,
  onNotifications,
}: DashboardHeaderProps) {
  return (
    <header className="topbar">
      <button
        className="icon-button mobile-menu"
        aria-label="Open navigation"
        onClick={onOpenNavigation}
      >
        <Menu size={20} />
      </button>
      <div className="breadcrumbs">
        <span>Workspace</span>
        <ChevronRight size={14} />
        <b>{active}</b>
      </div>
      <div className="topbar-actions">
        <button
          className="icon-button theme-toggle"
          aria-label="Toggle color theme"
          onClick={onToggleTheme}
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          className="icon-button"
          aria-label="Notifications"
          onClick={onNotifications}
        >
          <Bell size={17} />
          <i className="notification-dot" />
        </button>
        <div className="avatar avatar-you top-avatar">JD</div>
      </div>
    </header>
  );
}
