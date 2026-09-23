import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CircleHelp,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./Sidebar";
import { authService, notificationService, tenantService } from "@/services";
import { patients } from "@/data/mock";
import { navGroups } from "./nav-config";

export function Topbar() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = authService.currentUser();
  const clinic = tenantService.current();
  const notifications = notificationService.listSync();
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-card/80 px-4 backdrop-blur-md">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Menu principal</SheetTitle>
          <SidebarNav showToggle={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted sm:max-w-sm"
      >
        <Search className="size-4" />
        <span className="truncate">Buscar pacientes, agenda, documentos…</span>
        <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 text-[10px] sm:block">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Ajuda"
          onClick={() => toast.info("Central de ajuda", { description: "Disponível em breve." })}
        >
          <CircleHelp className="size-5" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
              <Bell className="size-5" />
              {unread > 0 ? (
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                  {unread}
                </span>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Notificações</p>
              <p className="text-xs text-muted-foreground">{unread} não lidas</p>
            </div>
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id} className="px-4 py-3 hover:bg-muted/60">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.description}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{n.at}</p>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {user.initials}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm leading-tight font-medium">{user.name}</span>
                <span className="block text-xs leading-tight text-muted-foreground">
                  {clinic.name}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
              <p className="mt-1 text-xs font-normal text-muted-foreground">
                Clínica atual: {clinic.name}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate({ to: "/configuracoes" })}>
              <UserRound className="mr-2 size-4" /> Meu perfil
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate({ to: "/configuracoes" })}>
              <Settings className="mr-2 size-4" /> Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate({ to: "/" })}>
              <LogOut className="mr-2 size-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Buscar pacientes ou páginas…" />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Pacientes">
            {patients.slice(0, 6).map((p) => (
              <CommandItem
                key={p.id}
                value={p.name}
                onSelect={() => {
                  setSearchOpen(false);
                  navigate({ to: "/pacientes/$id", params: { id: p.id } });
                }}
              >
                {p.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Navegação">
            {navGroups.flatMap((g) => g.items).map((item) => (
              <CommandItem
                key={item.to}
                value={item.label}
                onSelect={() => {
                  setSearchOpen(false);
                  navigate({ to: item.to });
                }}
              >
                <item.icon className="mr-2 size-4" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}

export function TopbarBrandLink() {
  return (
    <Link to="/dashboard" className="text-sm font-semibold">
      ClinicFlow
    </Link>
  );
}
