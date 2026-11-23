import {
    Activity,
    Blocks,
    FileClock,
    LayoutDashboard,
    Settings2,
    ShieldCheck,
    Users
} from "lucide-react";


export const navGroups = [
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
            { name: "Apps", icon: Blocks },
            { name: "Audit logs", icon: FileClock },
        ],
    },
    { label: "PREFERENCES", items: [{ name: "Settings", icon: Settings2 }] },
];
