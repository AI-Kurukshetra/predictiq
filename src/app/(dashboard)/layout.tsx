import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/queries/auth";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { AiChatTrigger } from "@/components/ai/ai-chat-trigger";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const role = (currentUser.role as "manager" | "technician" | "admin") ?? "technician";

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <div className="ml-64 flex flex-1 flex-col">
        <TopBar user={{ full_name: currentUser.full_name, role }} />
        <main className="flex-1 overflow-y-auto bg-[#F5F6FA] p-6">{children}</main>
      </div>
      <AiChatTrigger />
    </div>
  );
}
