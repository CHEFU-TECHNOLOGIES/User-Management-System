"use client";

import { ChevronRight, Menu, Moon, Sun } from "lucide-react";
import { openAccount, initials, type AdminAccount } from "@/lib/admin-api";

export function DashboardHeader({
  active,
  dark,
  account,
  onOpenNavigation,
  onToggleTheme,
}: {
  active: string;
  dark: boolean;
  account: AdminAccount;
  onOpenNavigation: () => void;
  onToggleTheme: () => void;
}) {
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
        <span>Dashboard</span>
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
          className="avatar avatar-you top-avatar"
          aria-label="Manage your account"
          onClick={() => void openAccount("/account")}
        >
          {initials(account.name)}
          {account.photoURL && (
            <img
              key={account.photoURL}
              className="avatar-photo"
              src={account.photoURL}
              alt=""
              referrerPolicy="no-referrer"
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
            />
          )}
        </button>
      </div>
    </header>
  );
}
