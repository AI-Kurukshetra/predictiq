"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  BrainCircuit,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

type Role = "manager" | "technician" | "admin";

const allNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["manager", "technician", "admin"] as Role[] },
  { label: "Equipment", href: "/equipment", icon: Wrench, roles: ["manager", "technician", "admin"] as Role[] },
  { label: "Alerts", href: "/alerts", icon: Bell, roles: ["manager", "technician", "admin"] as Role[] },
  { label: "Predictions", href: "/predictions", icon: BrainCircuit, roles: ["manager", "admin"] as Role[] },
  { label: "Work Orders", href: "/work-orders", icon: ClipboardList, roles: ["manager", "technician", "admin"] as Role[] },
  { label: "Analytics", href: "/analytics", icon: BarChart3, roles: ["manager", "admin"] as Role[] },
  { label: "Users", href: "/users", icon: Users, roles: ["admin"] as Role[] },
  { label: "Audit Log", href: "/audit", icon: FileText, roles: ["admin"] as Role[] },
];

const roleBadgeConfig: Record<Role, { label: string; bg: string; text: string }> = {
  manager: { label: "Plant Manager", bg: "bg-[#3B82F6]/20", text: "text-[#93C5FD]" },
  technician: { label: "Technician", bg: "bg-[#3B82F6]/20", text: "text-[#93C5FD]" },
  admin: { label: "Administrator", bg: "bg-[#3B82F6]/20", text: "text-[#93C5FD]" },
};

export function Sidebar({ role = "technician" }: { role?: Role }) {
  const pathname = usePathname();
  const activePath = pathname ?? "";
  const navItems = allNavItems.filter((item) => item.roles.includes(role));
  const badge = roleBadgeConfig[role];

  return (
    <aside data-sidebar className="fixed left-0 top-0 h-screen w-64 bg-[#0B2340]">
      <div className="flex h-full flex-col">
        <div className="px-6 py-5">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="PredictIQ" width={32} height={32} />
            <span className="text-xl font-bold text-white">PredictIQ</span>
          </div>
          <div className="mt-2">
            <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium", badge.bg, badge.text)}>
              {badge.label}
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-3">
          {navItems.map((item) => {
            const isActive =
              activePath === item.href || activePath.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-r-md border-l-[3px] px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-l-[#3B82F6] bg-[#1A3760] text-white"
                    : "border-l-transparent text-[#8C95A6] hover:bg-[#132D4F]"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#132D4F] p-2">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-r-md border-l-[3px] border-l-transparent px-4 py-2.5 text-sm font-medium text-[#8C95A6] transition-colors hover:bg-[#132D4F]"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>

          <form action={logoutAction}>
            <button
              data-logout
              type="submit"
              className="mt-1 flex w-full items-center gap-3 rounded-r-md border-l-[3px] border-l-transparent px-4 py-2.5 text-sm font-medium text-[#8C95A6] transition-colors hover:bg-[#132D4F]"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
