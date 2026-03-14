"use client";

import Link from "next/link";
import { createEquipment, updateEquipment } from "@/lib/actions/equipment";

interface Facility {
  id: string;
  name: string;
}

interface EquipmentData {
  id: string;
  name: string;
  type: string;
  facility_id: string;
  model?: string | null;
  serial_number?: string | null;
  location_zone?: string | null;
  install_date?: string | null;
}

const EQUIPMENT_TYPES = [
  "CNC Machine",
  "Compressor",
  "Hydraulic Press",
  "Conveyor",
  "Motor",
  "Generator",
  "Pump",
];

const ZONES = ["Zone A", "Zone B", "Zone C"];

export function EquipmentForm({
  facilities,
  equipment,
}: {
  facilities: Facility[];
  equipment?: EquipmentData;
}) {
  const isEdit = !!equipment;

  const handleAction = isEdit
    ? async (formData: FormData) => {
        await updateEquipment(equipment.id, formData);
      }
    : createEquipment;

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-[#E8ECF1] bg-white p-6">
      <h2 className="text-xl font-semibold text-[#1A2332]">
        {isEdit ? "Update Equipment" : "Add Equipment"}
      </h2>

      <form action={handleAction} className="mt-6 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#1A2332]">
              Name <span className="text-[#F53642]">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={equipment?.name ?? ""}
              className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
          </div>
          <div>
            <label htmlFor="type" className="mb-1 block text-sm font-medium text-[#1A2332]">
              Type <span className="text-[#F53642]">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue={equipment?.type ?? ""}
              className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            >
              <option value="" disabled>Select type</option>
              {EQUIPMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="facility_id" className="mb-1 block text-sm font-medium text-[#1A2332]">
              Facility <span className="text-[#F53642]">*</span>
            </label>
            <select
              id="facility_id"
              name="facility_id"
              required
              defaultValue={equipment?.facility_id ?? ""}
              className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            >
              <option value="" disabled>Select facility</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="model" className="mb-1 block text-sm font-medium text-[#1A2332]">Model</label>
            <input
              type="text"
              id="model"
              name="model"
              defaultValue={equipment?.model ?? ""}
              className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="serial_number" className="mb-1 block text-sm font-medium text-[#1A2332]">Serial Number</label>
            <input
              type="text"
              id="serial_number"
              name="serial_number"
              defaultValue={equipment?.serial_number ?? ""}
              className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
          </div>
          <div>
            <label htmlFor="location_zone" className="mb-1 block text-sm font-medium text-[#1A2332]">Location Zone</label>
            <select
              id="location_zone"
              name="location_zone"
              defaultValue={equipment?.location_zone ?? ""}
              className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            >
              <option value="">Select zone</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="install_date" className="mb-1 block text-sm font-medium text-[#1A2332]">Install Date</label>
          <input
            type="date"
            id="install_date"
            name="install_date"
            defaultValue={equipment?.install_date?.slice(0, 10) ?? ""}
            className="w-full rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#E8ECF1] pt-5">
          <Link
            href="/equipment"
            className="rounded-lg border border-[#E8ECF1] px-4 py-2.5 text-sm font-medium text-[#5A6578] transition hover:bg-[#F5F6FA]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2563EB]"
          >
            {isEdit ? "Update Equipment" : "Add Equipment"}
          </button>
        </div>
      </form>
    </div>
  );
}
