"use client";

import {
    Activity,
    Blocks,
    FileClock,
    LayoutDashboard,
    LogOut,
    Settings2,
    ShieldCheck,
    Users,
} from "lucide-react";
import { openAccount, initials, type AdminAccount } from "@/lib/admin-api";

const navGroups = [
    {
        label: "WORKSPACE",
        items: [
            { name: "Overview", icon: LayoutDashboard },
            { name: "Users", icon: Users },
            { name: "Analytics", icon: Activity },
        ],
    },
    {
        label: "MANAGEMENT",
        items: [
            { name: "Roles & permissions", icon: ShieldCheck },
            { name: "Moderation", icon: Blocks },
            { name: "Audit logs", icon: FileClock },
        ],
    },
    { label: "PREFERENCES", items: [{ name: "Settings", icon: Settings2 }] },
];

export function DashboardSidebar({
    active,
    account,
    mobileOpen,
    onNavigate,
}: {
    active: string;
    account: AdminAccount;
    mobileOpen: boolean;
    onNavigate: (name: string) => void;
}) {
    return (
        <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
            <div className="brand">
                <span className="text-sm font-semibold">
                    Chefu Technologies
                </span>
            </div>
            <nav aria-label="Main navigation" className="side-nav">
                {navGroups.map((group) => (
                    <section className="nav-group" key={group.label}>
                        <p className="nav-label">{group.label}</p>
                        {group.items.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => onNavigate(item.name)}
                                className={`nav-item ${active === item.name ? "nav-active" : ""}`}
                            >
                                <item.icon size={17} strokeWidth={1.8} />
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </section>
                ))}
            </nav>
            <div className="sidebar-bottom">
                <div className="user-account">
                    <div className="avatar avatar-you">
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
                    </div>
                    <div className="account-copy">
                        <b>{account.name}</b>
                        <small>Administrator</small>
                    </div>
                    <button
                        className="icon-button account-menu"
                        aria-label="Sign out"
                        onClick={() => void openAccount("/logout")}
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
