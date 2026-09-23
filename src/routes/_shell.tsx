import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SidebarNav } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

function ShellLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "hidden shrink-0 border-r border-sidebar-border transition-[width] duration-200 lg:block",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className="sticky top-0 h-screen">
          <SidebarNav collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-6 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
        <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
          ClinicFlow · Protótipo com dados fictícios · Nenhum dado real de paciente é utilizado.
        </footer>
      </div>
    </div>
  );
}
