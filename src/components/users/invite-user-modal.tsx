"use client";

import { useRef, useState, useTransition } from "react";
import { X, CheckCircle } from "lucide-react";
import { inviteUser } from "@/lib/actions/users";

interface Facility {
  id: string;
  name: string;
}

export function InviteUserModal({
  facilities,
  onClose,
}: {
  facilities: Facility[];
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    const facilityId = formData.get("facility_id");
    if (facilityId === "") formData.delete("facility_id");

    startTransition(async () => {
      const result = await inviteUser(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-[#E8ECF1] bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1A2332]">Add User</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#5A6578] hover:bg-[#F5F6FA]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-[#0D8070]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A2332]">User Created Successfully</h3>
            <p className="text-sm text-[#5A6578]">
              The user has been created with the following temporary password:
            </p>
            <div className="rounded-lg border border-[#E8ECF1] bg-[#F5F6FA] px-4 py-3">
              <p className="font-mono text-sm font-semibold text-[#1A2332]">TempPass123!</p>
            </div>
            <p className="text-xs text-[#8C95A6]">
              Please share this password securely with the user. They should change it after their first login.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-[#E07A5F] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#C4654D]"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-[#5A6578]">Create a new user account</p>

            <form ref={formRef} action={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="full_name"
                  className="mb-1 block text-sm font-medium text-[#1A2332]"
                >
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2 text-sm text-[#1A2332] outline-none focus:border-[#0D8070] focus:ring-1 focus:ring-[#0D8070]"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-[#1A2332]"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2 text-sm text-[#1A2332] outline-none focus:border-[#0D8070] focus:ring-1 focus:ring-[#0D8070]"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="mb-1 block text-sm font-medium text-[#1A2332]"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  defaultValue="technician"
                  className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2 text-sm text-[#1A2332] outline-none focus:border-[#0D8070] focus:ring-1 focus:ring-[#0D8070]"
                >
                  <option value="technician">Technician</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="facility_id"
                  className="mb-1 block text-sm font-medium text-[#1A2332]"
                >
                  Facility
                </label>
                <select
                  id="facility_id"
                  name="facility_id"
                  defaultValue=""
                  className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2 text-sm text-[#1A2332] outline-none focus:border-[#0D8070] focus:ring-1 focus:ring-[#0D8070]"
                >
                  <option value="">All Facilities</option>
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="rounded-lg bg-[#F0E4E8] px-3 py-2 text-sm text-[#6B1D3A]">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-[#5A6578] hover:bg-[#F5F6FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-[#E07A5F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#C4654D] disabled:opacity-50"
                >
                  {isPending ? "Adding..." : "Invite User"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
