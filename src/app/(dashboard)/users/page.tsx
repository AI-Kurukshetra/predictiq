import { redirect } from "next/navigation";
import { format } from "date-fns";
import { getCurrentRole, getCurrentUser } from "@/lib/queries/auth";
import { getAllUsers, getUserStats } from "@/lib/queries/users";
import { createClient } from "@/lib/supabase/server";
import { RoleSelector } from "@/components/users/role-selector";
import { FacilitySelector } from "@/components/users/facility-selector";
import { AddUserButton } from "@/components/users/add-user-button";
import { DeleteUserButton } from "@/components/users/delete-user-button";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export default async function UsersPage() {
  const role = await getCurrentRole();
  if (role !== "admin") redirect("/dashboard");

  const [users, stats, currentUser] = await Promise.all([
    getAllUsers(),
    getUserStats(),
    getCurrentUser(),
  ]);

  const supabase = await createClient();
  const { data: facilities } = await supabase
    .from("facilities")
    .select("id, name")
    .order("name");
  const facilityList = facilities ?? [];

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">User Management</h1>
          <p className="mt-1 text-sm text-[#5A6578]">
            Manage user roles and facility assignments
          </p>
        </div>
        <AddUserButton facilities={facilityList} />
      </header>

      {/* Stats bar */}
      <section className="flex flex-wrap gap-2">
        <span className="rounded-full bg-[#F5F6FA] px-3 py-1 text-sm font-medium text-[#1A2332]">
          Total: {stats.total}
        </span>
        <span className="rounded-full bg-[#E6F5F0] px-3 py-1 text-sm font-medium text-[#0B2340]">
          Managers: {stats.managers}
        </span>
        <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-sm font-medium text-[#1E40AF]">
          Technicians: {stats.technicians}
        </span>
        <span className="rounded-full bg-[#FFF0EB] px-3 py-1 text-sm font-medium text-[#8B3A1F]">
          Admins: {stats.admins}
        </span>
      </section>

      {/* Users table */}
      <div className="overflow-x-auto rounded-xl border border-[#E8ECF1] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#E8ECF1] bg-[#F5F6FA]">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">
                Name
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">
                Role
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">
                Facility
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">
                Joined
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#5A6578]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => {
              const facilities = user.facilities as { name: string } | { name: string }[] | null;
              const facilityName = Array.isArray(facilities)
                ? facilities[0]?.name
                : facilities?.name;

              return (
                <tr
                  key={user.id}
                  className={`border-b border-[#E8ECF1] transition hover:bg-[#F9FAFB] ${
                    i % 2 === 1 ? "bg-[#F9FAFB]" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B2340] text-xs font-semibold text-white">
                        {getInitials(user.full_name)}
                      </div>
                      <span className="font-medium text-[#1A2332]">
                        {user.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleSelector userId={user.id} currentRole={user.role} />
                  </td>
                  <td className="px-4 py-3">
                    <FacilitySelector
                      userId={user.id}
                      currentFacilityId={user.facility_id}
                      facilities={facilityList}
                    />
                  </td>
                  <td className="px-4 py-3 text-[#5A6578]">
                    {user.created_at
                      ? format(new Date(user.created_at), "MMM dd, yyyy")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {currentUser && user.id !== currentUser.id && (
                      <DeleteUserButton userId={user.id} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
