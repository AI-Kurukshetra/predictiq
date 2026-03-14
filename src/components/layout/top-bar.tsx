import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { getUnreadAlertCount, getRecentNotifications } from "@/lib/queries/notifications";
import { NotificationBell } from "@/components/layout/notification-bell";
import { FacilitySwitcher } from "@/components/layout/facility-switcher";
import { SearchBar } from "@/components/layout/search-bar";

type Role = "manager" | "technician" | "admin";

const roleBadgeConfig: Record<Role, { label: string; bg: string; text: string }> = {
  manager: { label: "Plant Manager", bg: "bg-[#E6F5F0]", text: "text-[#0B2340]" },
  technician: { label: "Technician", bg: "bg-[#DBEAFE]", text: "text-[#1E40AF]" },
  admin: { label: "Administrator", bg: "bg-[#FFF0EB]", text: "text-[#8B3A1F]" },
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

interface TopBarProps {
  user: {
    full_name: string;
    role: Role;
  };
}

export async function TopBar({ user }: TopBarProps) {
  const displayName = user.full_name || "User";
  const initials = getInitials(displayName);
  const badge = roleBadgeConfig[user.role] ?? roleBadgeConfig.technician;

  const [unreadCount, notifications] = await Promise.all([
    getUnreadAlertCount(),
    getRecentNotifications(10),
  ]);

  const supabase = await createClient();
  const { data: facilities } = await supabase
    .from("facilities")
    .select("id, name")
    .order("name");

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-[#E8ECF1] bg-white px-6">
      <div />

      <div className="flex items-center gap-4">
        <FacilitySwitcher facilities={facilities ?? []} />

        <SearchBar />

        <NotificationBell
          initialCount={unreadCount}
          initialNotifications={notifications}
        />

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B2340] text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#1A2332]">{displayName}</span>
            <span className={cn("inline-block self-start rounded-full px-2 py-0.5 text-[10px] font-medium leading-tight", badge.bg, badge.text)}>
              {badge.label}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
