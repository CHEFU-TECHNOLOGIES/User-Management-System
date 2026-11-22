"use client";

import {
    Activity,
    ArrowUpRight,
    Bell,
    Blocks,
    ChevronsUpDown,
    CircleHelp,
    Ellipsis,
    FileClock,
    LayoutDashboard,
    Settings2,
    ShieldCheck,
    Users
} from "lucide-react";

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
            { name: "Moderation", icon: Blocks, count: "4" },
            { name: "Notifications", icon: Bell, count: "3" },
            { name: "Audit logs", icon: FileClock },
        ],
    },
    { label: "PREFERENCES", items: [{ name: "Settings", icon: Settings2 }] },
];

type DashboardSidebarProps = {
    active: string;
    mobileOpen: boolean;
    onNavigate: (name: string) => void;
    notify: (message: string) => void;
};

export function DashboardSidebar({
    active,
    mobileOpen,
    onNavigate,
    notify,
}: DashboardSidebarProps) {
    return (
        <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
            <div className="brand">
               
                <span className="text-sm font-semibold">Chefu Technologies</span>
                
            </div>
            
            <nav aria-label="Main navigation" className="side-nav">
                {navGroups.map((group) => (
                    <section className="nav-group" key={group.label}>
                        <p className="nav-label">{group.label}</p>
                        {group.items.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => {
                                    onNavigate(item.name);
                                }}
                                className={`nav-item ${active === item.name ? "nav-active" : ""}`}
                            >
                                <item.icon size={17} strokeWidth={1.8} />
                                <span>{item.name}</span>
                                {item.count && (
                                    <span
                                        className={`nav-count ${item.name === "Notifications" ? "count-pink" : ""}`}
                                    >
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </section>
                ))}
            </nav>
            <div className="sidebar-bottom">
                <button
                    className="help-link"
                    onClick={() =>
                        notify("Help center opened in a new workspace")
                    }
                >
                    <CircleHelp size={17} />
                    Help & support
                    <ArrowUpRight size={14} />
                </button>
                <div className="user-account">
                    <div className="avatar avatar-you">JD</div>
                    <div className="account-copy">
                        <b>Jordan Davis</b>
                        <small>Super admin</small>
                    </div>
                    <button
                        className="icon-button account-menu"
                        aria-label="Account menu"
                        onClick={() => notify("Account menu opened")}
                    >
                        <Ellipsis size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
