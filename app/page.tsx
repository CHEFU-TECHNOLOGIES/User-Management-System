"use client";

import { useMemo, useState } from "react";
import {
    Activity,
    ArrowDown,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Bell,
    Blocks,
    CalendarDays,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    CircleHelp,
    Command,
    Download,
    Ellipsis,
    FileClock,
    Filter,
    Globe2,
    LayoutDashboard,
    ListFilter,
    LockKeyhole,
    LogOut,
    Menu,
    Moon,
    MoreHorizontal,
    Plus,
    Search,
    Settings2,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
    Sun,
    UserCheck,
    UserPlus,
    Users,
    X,
} from "lucide-react";

type Person = {
    name: string;
    email: string;
    initials: string;
    color: string;
    role: string;
    status: string;
    joined: string;
    verified: boolean;
};
const initialPeople: Person[] = [
    {
        name: "Olivia Rhye",
        email: "olivia@acme.com",
        initials: "OR",
        color: "lavender",
        role: "Admin",
        status: "Active",
        joined: "Jan 12, 2025",
        verified: true,
    },
    {
        name: "Phoenix Baker",
        email: "phoenix@acme.com",
        initials: "PB",
        color: "peach",
        role: "User",
        status: "Active",
        joined: "Jan 11, 2025",
        verified: true,
    },
    {
        name: "Lana Steiner",
        email: "lana@acme.com",
        initials: "LS",
        color: "mint",
        role: "Moderator",
        status: "Active",
        joined: "Jan 10, 2025",
        verified: true,
    },
    {
        name: "Demi Wilkinson",
        email: "demi@acme.com",
        initials: "DW",
        color: "rose",
        role: "User",
        status: "Pending",
        joined: "Jan 09, 2025",
        verified: false,
    },
    {
        name: "Candice Wu",
        email: "candice@acme.com",
        initials: "CW",
        color: "blue",
        role: "Support agent",
        status: "Active",
        joined: "Jan 08, 2025",
        verified: true,
    },
    {
        name: "Natali Craig",
        email: "natali@acme.com",
        initials: "NC",
        color: "gold",
        role: "User",
        status: "Suspended",
        joined: "Jan 07, 2025",
        verified: true,
    },
    {
        name: "Drew Cano",
        email: "drew@acme.com",
        initials: "DC",
        color: "mint",
        role: "User",
        status: "Active",
        joined: "Jan 06, 2025",
        verified: true,
    },
];
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
const chartValues = [
    26, 36, 31, 46, 39, 53, 47, 61, 54, 72, 64, 77, 69, 83, 76, 92, 79, 96, 85,
    105, 92, 114, 99, 122, 107, 132, 118, 143, 128, 154,
];

export default function AdminDashboard() {
    const [active, setActive] = useState("Overview");
    const [people, setPeople] = useState(initialPeople);
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("All users");
    const [dark, setDark] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [notice, setNotice] = useState("");
    const [range, setRange] = useState("Last 30 days");
    const [mobileOpen, setMobileOpen] = useState(false);
    const filtered = useMemo(
        () =>
            people.filter(
                (p) =>
                    `${p.name} ${p.email} ${p.role}`
                        .toLowerCase()
                        .includes(query.toLowerCase()) &&
                    (status === "All users" || p.status === status),
            ),
        [people, query, status],
    );
    const notify = (message: string) => {
        setNotice(message);
        window.setTimeout(() => setNotice(""), 2800);
    };
    const csv = () => {
        const rows = [
            ["Name", "Email", "Role", "Status", "Joined"],
            ...filtered.map((p) => [
                p.name,
                p.email,
                p.role,
                p.status,
                p.joined,
            ]),
        ];
        const blob = new Blob(
            [rows.map((row) => row.map((c) => `"${c}"`).join(",")).join("\n")],
            { type: "text/csv" },
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "users.csv";
        a.click();
        URL.revokeObjectURL(url);
        notify("Your user export is ready");
    };

    const toggleUser = (name: string) =>
        setSelected((current) =>
            current.includes(name)
                ? current.filter((s) => s !== name)
                : [...current, name],
        );
    const toggleAll = () =>
        setSelected(
            selected.length === filtered.length
                ? []
                : filtered.map((p) => p.name),
        );

    return (
        <div className={`app-shell ${dark ? "theme-dark" : ""}`}>
            <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
                <div className="brand">
                    <div className="brand-mark">
                        <Blocks size={18} strokeWidth={2.4} />
                    </div>
                    <span>layers</span>
                    <button
                        className="workspace-switch"
                        aria-label="Switch workspace"
                    >
                        <ChevronsUpDown size={15} />
                    </button>
                </div>
                <button className="workspace-card">
                    <span className="workspace-avatar">A</span>
                    <span className="workspace-info">
                        <b>Acme Inc.</b>
                        <small>Free plan</small>
                    </span>
                    <ChevronDown size={15} />
                </button>
                <div className="side-search">
                    <Search size={15} />
                    <span>Search</span>
                    <kbd>⌘ K</kbd>
                </div>
                <nav aria-label="Main navigation" className="side-nav">
                    {navGroups.map((group) => (
                        <section className="nav-group" key={group.label}>
                            <p className="nav-label">{group.label}</p>
                            {group.items.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        setActive(item.name);
                                        setMobileOpen(false);
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
            {mobileOpen && (
                <button
                    className="mobile-scrim"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation"
                />
            )}
            <main className="main-area">
                <header className="topbar">
                    <button
                        className="icon-button mobile-menu"
                        aria-label="Open navigation"
                        onClick={() => setMobileOpen(true)}
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
                            onClick={() => setDark(!dark)}
                        >
                            {dark ? <Sun size={17} /> : <Moon size={17} />}
                        </button>
                        <button
                            className="icon-button"
                            aria-label="Notifications"
                            onClick={() => {
                                setActive("Notifications");
                                notify("You’re all caught up");
                            }}
                        >
                            <Bell size={17} />
                            <i className="notification-dot" />
                        </button>
                        <div className="avatar avatar-you top-avatar">JD</div>
                    </div>
                </header>
                <div className="page-content">
                    <div className="welcome-row">
                        <div>
                            <div className="eyebrow">
                                <span className="eyebrow-line" />
                                MONDAY, JANUARY 20, 2025
                            </div>
                            <h1>
                                {active === "Overview"
                                    ? "Good morning, Jordan"
                                    : active}
                            </h1>
                            <p className="page-subtitle">
                                {active === "Overview"
                                    ? "Here's what's happening with your workspace today."
                                    : `Manage and monitor ${active.toLowerCase()} across your workspace.`}
                            </p>
                        </div>
                        <div className="welcome-actions">
                            <button
                                className="button button-secondary"
                                onClick={() =>
                                    notify("Dashboard link copied to clipboard")
                                }
                            >
                                <Command size={15} />
                                Share dashboard
                            </button>
                        </div>
                    </div>
                    <div className="notice-strip">
                        <div className="notice-icon">
                            <Sparkles size={15} />
                        </div>
                        <p>
                            <b>Your workspace is looking good.</b> You&apos;ve
                            invited 12 new users this month.{" "}
                            <button
                                onClick={() => {
                                    setActive("Users");
                                    document
                                        .querySelector(".directory-card")
                                        ?.scrollIntoView({
                                            behavior: "smooth",
                                        });
                                }}
                            >
                                View users <ArrowRight size={13} />
                            </button>
                        </p>
                        <button
                            className="notice-close"
                            aria-label="Dismiss message"
                            onClick={(e) =>
                                (
                                    e.currentTarget.parentElement as HTMLElement
                                ).remove()
                            }
                        >
                            <X size={15} />
                        </button>
                    </div>
                    <section
                        className="metrics-grid"
                        aria-label="User statistics"
                    >
                        <Metric
                            icon={<Users size={17} />}
                            label="Total users"
                            value="2,420"
                            change="20.1%"
                            direction="up"
                            note="vs. last month"
                        />
                        <Metric
                            icon={<UserCheck size={17} />}
                            label="Active users"
                            value="1,845"
                            change="12.8%"
                            direction="up"
                            note="vs. last month"
                        />
                        <Metric
                            icon={<UserPlus size={17} />}
                            label="New this month"
                            value="128"
                            change="8.2%"
                            direction="up"
                            note="vs. last month"
                        />
                        <Metric
                            icon={<ShieldCheck size={17} />}
                            label="Needs attention"
                            value="12"
                            change="2.4%"
                            direction="down"
                            note="pending verification"
                            alert
                        />
                    </section>
                    <section className="analytics-grid">
                        <article className="panel growth-panel">
                            <div className="panel-heading">
                                <div>
                                    <h2>User growth</h2>
                                    <p>Track user acquisition over time</p>
                                </div>
                                <button
                                    className="select-button"
                                    onClick={() =>
                                        setRange(
                                            range === "Last 30 days"
                                                ? "Last 7 days"
                                                : range === "Last 7 days"
                                                  ? "Last 90 days"
                                                  : "Last 30 days",
                                        )
                                    }
                                >
                                    <CalendarDays size={14} />
                                    {range}
                                    <ChevronDown size={14} />
                                </button>
                            </div>
                            <div className="chart-summary">
                                <strong>2,420</strong>
                                <span className="trend-pill">
                                    <ArrowUpRight size={13} />
                                    20.1%
                                </span>
                                <span className="chart-period">
                                    vs. previous period
                                </span>
                            </div>
                            <div className="chart-area">
                                <div className="chart-y-labels">
                                    <span>2.5k</span>
                                    <span>2k</span>
                                    <span>1.5k</span>
                                    <span>1k</span>
                                    <span>0</span>
                                </div>
                                <svg
                                    className="growth-chart"
                                    viewBox="0 0 720 188"
                                    preserveAspectRatio="none"
                                    role="img"
                                    aria-label="User registrations increase steadily over the last 30 days"
                                >
                                    <defs>
                                        <linearGradient
                                            id="chartFill"
                                            x1="0"
                                            x2="0"
                                            y1="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#6655ed"
                                                stopOpacity=".16"
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#6655ed"
                                                stopOpacity="0"
                                            />
                                        </linearGradient>
                                    </defs>
                                    {[16, 55, 94, 133, 172].map((y) => (
                                        <line
                                            key={y}
                                            x1="0"
                                            y1={y}
                                            x2="720"
                                            y2={y}
                                            stroke="currentColor"
                                            strokeOpacity=".075"
                                            strokeDasharray="3 5"
                                        />
                                    ))}
                                    <path
                                        d={`M 0 172 ${chartValues.map((v, i) => `L ${i * 24.8} ${172 - v}`).join(" ")} L 720 172 Z`}
                                        fill="url(#chartFill)"
                                    />
                                    <path
                                        d={`M 0 172 ${chartValues.map((v, i) => `L ${i * 24.8} ${172 - v}`).join(" ")}`}
                                        fill="none"
                                        stroke="#6957ed"
                                        strokeWidth="2.5"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    <circle
                                        cx="720"
                                        cy={
                                            172 -
                                            chartValues[chartValues.length - 1]
                                        }
                                        r="5"
                                        fill="#fff"
                                        stroke="#6957ed"
                                        strokeWidth="2.5"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </svg>
                                <div className="chart-x-labels">
                                    <span>Jan 1</span>
                                    <span>Jan 5</span>
                                    <span>Jan 10</span>
                                    <span>Jan 15</span>
                                    <span>Jan 20</span>
                                    <span>Jan 25</span>
                                    <span>Jan 30</span>
                                </div>
                            </div>
                        </article>
                        <article className="panel distribution-panel">
                            <div className="panel-heading">
                                <div>
                                    <h2>Users by role</h2>
                                    <p>Role distribution</p>
                                </div>
                                <button
                                    className="icon-button"
                                    aria-label="Role chart options"
                                    onClick={() => notify("Chart options")}
                                >
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                            <div className="donut-wrap">
                                <div className="donut">
                                    <div className="donut-center">
                                        <b>2,420</b>
                                        <span>Total users</span>
                                    </div>
                                </div>
                            </div>
                            <div className="role-legend">
                                <Legend
                                    color="purple"
                                    label="Users"
                                    value="2,182"
                                    pct="90.2%"
                                />
                                <Legend
                                    color="blue"
                                    label="Admins"
                                    value="186"
                                    pct="7.7%"
                                />
                                <Legend
                                    color="pink"
                                    label="Moderators"
                                    value="52"
                                    pct="2.1%"
                                />
                            </div>
                        </article>
                    </section>
                    <section className="panel directory-card">
                        <div className="directory-heading">
                            <div>
                                <div className="title-with-badge">
                                    <h2>Recent users</h2>
                                    <span className="total-badge">2,420</span>
                                </div>
                                <p>
                                    A list of users who recently joined your
                                    workspace.
                                </p>
                            </div>
                            <button
                                className="button button-secondary export-button"
                                onClick={csv}
                            >
                                <Download size={15} />
                                Export
                            </button>
                        </div>
                        <div className="table-toolbar">
                            <label className="table-search">
                                <Search size={16} />
                                <input
                                    aria-label="Search users"
                                    placeholder="Search users..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <kbd>⌘ K</kbd>
                            </label>
                            <div className="toolbar-right">
                                <label className="filter-select">
                                    <ListFilter size={15} />
                                    <select
                                        aria-label="Filter by status"
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value)
                                        }
                                    >
                                        <option>All users</option>
                                        <option>Active</option>
                                        <option>Pending</option>
                                        <option>Suspended</option>
                                    </select>
                                    <ChevronDown size={14} />
                                </label>
                                <button
                                    className="button button-secondary filter-button"
                                    onClick={() =>
                                        notify("All filters are up to date")
                                    }
                                >
                                    <SlidersHorizontal size={15} />
                                    <span>Filters</span>
                                </button>
                            </div>
                        </div>
                        {selected.length > 0 && (
                            <div className="bulk-bar">
                                <span>{selected.length} users selected</span>
                                <button
                                    onClick={() => {
                                        setPeople((current) =>
                                            current.map((p) =>
                                                selected.includes(p.name)
                                                    ? { ...p, status: "Active" }
                                                    : p,
                                            ),
                                        );
                                        setSelected([]);
                                        notify("Selected users activated");
                                    }}
                                >
                                    Activate
                                </button>
                                <button
                                    onClick={() => {
                                        setPeople((current) =>
                                            current.map((p) =>
                                                selected.includes(p.name)
                                                    ? {
                                                          ...p,
                                                          status: "Suspended",
                                                      }
                                                    : p,
                                            ),
                                        );
                                        setSelected([]);
                                        notify("Selected users suspended");
                                    }}
                                >
                                    Suspend
                                </button>
                                <button onClick={() => setSelected([])}>
                                    Clear selection
                                </button>
                            </div>
                        )}
                        <div className="table-scroll">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th className="check-col">
                                            <input
                                                aria-label="Select all users"
                                                type="checkbox"
                                                checked={
                                                    filtered.length > 0 &&
                                                    selected.length ===
                                                        filtered.length
                                                }
                                                onChange={toggleAll}
                                            />
                                        </th>
                                        <th>
                                            <button
                                                onClick={() =>
                                                    setPeople((current) =>
                                                        [...current].reverse(),
                                                    )
                                                }
                                            >
                                                Name{" "}
                                                <ChevronsUpDown size={13} />
                                            </button>
                                        </th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Verification</th>
                                        <th>
                                            Joined <ChevronsUpDown size={13} />
                                        </th>
                                        <th className="row-action-col">
                                            <span className="sr-only">
                                                Actions
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((person) => (
                                        <tr key={person.email}>
                                            <td className="check-col">
                                                <input
                                                    aria-label={`Select ${person.name}`}
                                                    type="checkbox"
                                                    checked={selected.includes(
                                                        person.name,
                                                    )}
                                                    onChange={() =>
                                                        toggleUser(person.name)
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <div className="person-cell">
                                                    <div
                                                        className={`avatar avatar-${person.color}`}
                                                    >
                                                        {person.initials}
                                                    </div>
                                                    <div className="person-copy">
                                                        <b>{person.name}</b>
                                                        <span>
                                                            {person.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="role-label">
                                                    {person.role}
                                                </span>
                                            </td>
                                            <td>
                                                <StatusPill
                                                    status={person.status}
                                                />
                                            </td>
                                            <td>
                                                {person.verified ? (
                                                    <span className="verified">
                                                        <Check size={13} />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="unverified">
                                                        <span />
                                                        Unverified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="date-cell">
                                                {person.joined}
                                            </td>
                                            <td>
                                                <button
                                                    className="row-menu"
                                                    aria-label={`Actions for ${person.name}`}
                                                    onClick={() =>
                                                        notify(
                                                            `Actions for ${person.name}`,
                                                        )
                                                    }
                                                >
                                                    <MoreHorizontal size={17} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="empty-state"
                                            >
                                                No users match your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="table-footer">
                            <span>
                                Showing{" "}
                                <b>
                                    {filtered.length ? 1 : 0}–{filtered.length}
                                </b>{" "}
                                of <b>{filtered.length}</b> users
                            </span>
                            <div className="pagination">
                                <button
                                    className="page-button"
                                    aria-label="Previous page"
                                    onClick={() =>
                                        notify("You’re on the first page")
                                    }
                                >
                                    <ChevronLeft size={15} />
                                    <span>Previous</span>
                                </button>
                                <button className="page-number active-page">
                                    1
                                </button>
                                <button
                                    className="page-number"
                                    onClick={() => notify("Page 2 is ready")}
                                >
                                    2
                                </button>
                                <button
                                    className="page-number"
                                    onClick={() => notify("Page 3 is ready")}
                                >
                                    3
                                </button>
                                <span className="page-ellipsis">...</span>
                                <button
                                    className="page-number"
                                    onClick={() => notify("Last page is ready")}
                                >
                                    12
                                </button>
                                <button
                                    className="page-button"
                                    onClick={() => notify("Next page is ready")}
                                >
                                    <span>Next</span>
                                    <ChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    </section>
                    <footer className="page-footer">
                        <span>© {new Date().getFullYear()} Chefu Technologies</span>
                        <a href="mailto:support@layers.com">
                            Privacy · Terms · Help
                        </a>
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

function Metric({
    icon,
    label,
    value,
    change,
    direction,
    note,
    alert = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    change: string;
    direction: "up" | "down";
    note: string;
    alert?: boolean;
}) {
    return (
        <article className="metric-card">
            <div className="metric-top">
                <span className="metric-icon">{icon}</span>
                <button
                    className="icon-button metric-more"
                    aria-label={`${label} options`}
                >
                    <MoreHorizontal size={17} />
                </button>
            </div>
            <p className="metric-label">{label}</p>
            <div className="metric-bottom">
                <strong>{value}</strong>
                <span
                    className={`metric-change ${alert ? "change-warn" : direction === "up" ? "change-up" : "change-down"}`}
                >
                    {direction === "up" ? (
                        <ArrowUpRight size={13} />
                    ) : (
                        <ArrowDownRight size={13} />
                    )}{" "}
                    {change}
                </span>
            </div>
            <p className="metric-note">{note}</p>
        </article>
    );
}
function Legend({
    color,
    label,
    value,
    pct,
}: {
    color: string;
    label: string;
    value: string;
    pct: string;
}) {
    return (
        <div className="legend-row">
            <span className={`legend-dot ${color}`} />
            <span className="legend-label">{label}</span>
            <b>{value}</b>
            <span className="legend-pct">{pct}</span>
        </div>
    );
}
function StatusPill({ status }: { status: string }) {
    return (
        <span className={`status-pill status-${status.toLowerCase()}`}>
            <i />
            {status}
        </span>
    );
}
