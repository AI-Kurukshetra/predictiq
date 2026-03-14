"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { createWorkOrder } from "@/lib/actions/work-orders";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-[#E07A5F] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#C4654D] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Creating..." : "Create Work Order"}
    </button>
  );
}

interface Equipment {
  id: string;
  name: string;
  status: string;
}

interface Technician {
  full_name: string;
}

export function WorkOrderForm({
  equipment,
  defaultEquipmentId,
  technicians = [],
}: {
  equipment: Equipment[];
  defaultEquipmentId?: string;
  technicians?: Technician[];
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-[#E8ECF1] bg-white p-6">
      <h2 className="text-xl font-semibold text-[#1A2332]">
        Create Work Order
      </h2>

      <form action={createWorkOrder} className="mt-6 space-y-5">
        {/* Title + Equipment */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-[#1A2332]"
            >
              Title <span className="text-[#8B2252]">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#0D8070]"
            />
          </div>
          <div>
            <label
              htmlFor="equipment_id"
              className="mb-1 block text-sm font-medium text-[#1A2332]"
            >
              Equipment <span className="text-[#8B2252]">*</span>
            </label>
            <select
              id="equipment_id"
              name="equipment_id"
              required
              defaultValue={defaultEquipmentId ?? ""}
              className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#0D8070]"
            >
              <option value="" disabled>
                Select equipment
              </option>
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-[#1A2332]"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#0D8070]"
          />
        </div>

        {/* Priority + Assigned To */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="priority"
              className="mb-1 block text-sm font-medium text-[#1A2332]"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue="medium"
              className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#0D8070]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="assigned_to_name"
              className="mb-1 block text-sm font-medium text-[#1A2332]"
            >
              Assigned To
            </label>
            <select
              id="assigned_to_name"
              name="assigned_to_name"
              defaultValue=""
              className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#0D8070]"
            >
              <option value="">Select technician</option>
              {technicians.map((tech) => (
                <option key={tech.full_name} value={tech.full_name}>
                  {tech.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date + Estimated Cost */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="due_date"
              className="mb-1 block text-sm font-medium text-[#1A2332]"
            >
              Due Date
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#0D8070]"
            />
          </div>
          <div>
            <label
              htmlFor="estimated_cost"
              className="mb-1 block text-sm font-medium text-[#1A2332]"
            >
              Estimated Cost ($)
            </label>
            <input
              type="number"
              id="estimated_cost"
              name="estimated_cost"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#0D8070]"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="mb-1 block text-sm font-medium text-[#1A2332]"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#0D8070]"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#E8ECF1] pt-5">
          <Link
            href="/work-orders"
            className="rounded-lg border border-[#E8ECF1] px-4 py-2.5 text-sm font-medium text-[#5A6578] transition hover:bg-[#F5F6FA]"
          >
            Cancel
          </Link>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
