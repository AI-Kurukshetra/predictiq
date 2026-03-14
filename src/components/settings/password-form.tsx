"use client";

import { useState, useTransition, useRef } from "react";
import { updatePassword } from "@/lib/actions/settings";

export function PasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);

    const newPassword = formData.get("new_password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label
          htmlFor="new_password"
          className="mb-1 block text-sm font-medium text-[#1A2332]"
        >
          New Password
        </label>
        <input
          type="password"
          id="new_password"
          name="new_password"
          required
          minLength={6}
          className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          placeholder="Enter new password"
        />
      </div>
      <div>
        <label
          htmlFor="confirm_password"
          className="mb-1 block text-sm font-medium text-[#1A2332]"
        >
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirm_password"
          name="confirm_password"
          required
          minLength={6}
          className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          placeholder="Confirm new password"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-[#FEE2E2] px-3 py-2 text-sm text-[#991B1B]">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-lg bg-[#DCFCE7] px-3 py-2 text-sm text-[#3B82F6]">
          Password updated successfully
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2563EB] disabled:opacity-50"
      >
        {isPending ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
