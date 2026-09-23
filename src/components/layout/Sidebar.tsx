import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { navGroups } from "./nav-config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

export function SidebarNav({
  collapsed,
  onToggle,
  onNavigate,
  showToggle = true,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  showToggle?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [openGroups, setOpenGroups] = useState<string[]>(["Prontuário"]);

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className={cn("flex h-16 items-center gap-2 px-4", collapsed && "justify-center px-2")}>
        <Logo compact={collapsed} />
        {showToggle ? (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto text-muted-foreground"
            onClick={onToggle}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </Button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!collapsed ? (
              <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {group.title}
              </p>
            ) : null}
            {group.items.map((item) => {
              const active = isActive(item.to);
              const open = openGroups.includes(item.label);
              return (
                <div key={item.to}>
                  <div className="flex items-center">
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        active && "bg-sidebar-accent text-sidebar-accent-foreground",
                        collapsed && "justify-center px-2",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    </Link>
                    {item.children && !collapsed ? (
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.label)}
                        aria-label={`Alternar submenu ${item.label}`}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent"
                      >
                        <ChevronDown
                          className={cn("size-4 transition-transform", open && "rotate-180")}
                        />
                      </button>
                    ) : null}
                  </div>
                  {item.children && open && !collapsed ? (
                    <div className="mt-1 ml-5 space-y-1 border-l border-sidebar-border pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          onClick={onNavigate}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isActive(child.to) && "bg-sidebar-accent text-sidebar-accent-foreground",
                          )}
                        >
                          <child.icon className="size-3.5" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {!collapsed ? (
        <div className="m-3 rounded-xl bg-primary-soft p-3 text-xs text-accent-foreground">
          <p className="font-semibold">Ambiente de demonstração</p>
          <p className="mt-1 opacity-80">Todos os dados exibidos são fictícios.</p>
        </div>
      ) : null}
    </div>
  );
}
