import { format } from "date-fns";
import { getCurrentUser } from "@/lib/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/actions/settings";
import { Badge } from "@/components/ui/badge";
import { PasswordForm } from "@/components/settings/password-form";

type Role = "manager" | "technician" | "admin";

const roleBadgeConfig: Record<Role, { label: string; variant: "healthy" | "info" | "warning" }> = {
  manager: { label: "Plant Manager", variant: "healthy" },
  technician: { label: "Technician", variant: "info" },
  admin: { label: "Administrator", variant: "warning" },
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export default async function SettingsPage() {
  try {
  const currentUser = await getCurrentUser();
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const profile = currentUser;
  const role = (profile?.role as Role) ?? "technician";
  const badge = roleBadgeConfig[role];

  // Get facility name
  let facilityName = "All Facilities";
  if (profile?.facility_id) {
    const { data: facility } = await supabase
      .from("facilities")
      .select("name")
      .eq("id", profile.facility_id)
      .single();
    facilityName = facility?.name ?? "All Facilities";
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#1A2332]">Settings</h1>
        <p className="mt-1 text-sm text-[#5A6578]">Manage your profile and preferences</p>
      </header>

      {/* Profile */}
      <div className="rounded-xl border border-[#E8ECF1] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1A2332]">Profile</h2>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0B2340] text-2xl font-bold text-white">
            {getInitials(profile?.full_name ?? "User")}
          </div>
          <div>
            <p className="text-lg font-semibold text-[#1A2332]">{profile?.full_name}</p>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
        </div>

        <form action={updateProfile} className="mt-6 space-y-4">
          <div>
            <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-[#1A2332]">Full Name</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              defaultValue={profile?.full_name ?? ""}
              className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#0D8070]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1A2332]">Email</label>
            <input
              type="email"
              readOnly
              value={authUser?.email ?? ""}
              className="w-full rounded-lg border border-[#E8ECF1] bg-[#F5F6FA] px-3 py-2.5 text-sm text-[#8C95A6]"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1A2332]">Role</label>
              <div className="rounded-lg border border-[#E8ECF1] bg-[#F5F6FA] px-3 py-2.5 text-sm text-[#8C95A6]">
                {badge.label}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1A2332]">Facility</label>
              <div className="rounded-lg border border-[#E8ECF1] bg-[#F5F6FA] px-3 py-2.5 text-sm text-[#8C95A6]">
                {facilityName}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-[#E07A5F] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#C4654D]"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-xl border border-[#E8ECF1] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1A2332]">Notification Preferences</h2>
        <p className="mt-1 text-xs text-[#8C95A6]">Email notifications coming soon</p>

        <div className="mt-4 space-y-3">
          {[
            { label: "Critical alerts", defaultChecked: true },
            { label: "Major alerts", defaultChecked: true },
            { label: "Minor alerts", defaultChecked: false },
            { label: "Info alerts", defaultChecked: false },
            { label: "Email notifications", defaultChecked: true },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-[#1A2332]">{item.label}</span>
              <input
                type="checkbox"
                defaultChecked={item.defaultChecked}
                className="h-4 w-4 rounded border-[#E8ECF1] text-[#0D8070] focus:ring-[#0D8070]"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-xl border border-[#E8ECF1] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1A2332]">Change Password</h2>
        <p className="mt-1 text-xs text-[#8C95A6]">Update your account password</p>
        <PasswordForm />
      </div>

      {/* Account */}
      <div className="rounded-xl border border-[#E8ECF1] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1A2332]">Account</h2>
        <div className="mt-4 space-y-2 text-sm">
          <p className="text-[#5A6578]">
            Member since: {authUser?.created_at ? format(new Date(authUser.created_at), "MMM dd, yyyy") : "—"}
          </p>
        </div>
      </div>
    </div>
  );

  } catch (error) {
    console.error('Settings error:', error);
    return (
      <div className="rounded-xl border border-[#E8ECF1] bg-white p-8">
        <h2 className="text-xl font-bold text-[#1A2332]">Unable to load settings</h2>
        <p className="mt-2 text-[#5A6578]">Please check your connection and try again.</p>
      </div>
    );
  }
}
