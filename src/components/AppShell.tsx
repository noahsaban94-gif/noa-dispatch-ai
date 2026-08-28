import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MessageCircle,
  CalendarRange,
  FileSignature,
  Truck,
  Bell,
} from "lucide-react";
import type { ReactNode } from "react";
import { NOA_AVATAR } from "@/lib/mockData";

const NAV = [
  { to: "/", label: "לוח מבצעים", icon: LayoutDashboard },
  { to: "/chat", label: "שיגור וואטסאפ", icon: MessageCircle },
  { to: "/matrix", label: "מטריצת סידור", icon: CalendarRange },
  { to: "/ocr", label: "תעודות ו-OCR", icon: FileSignature },
  { to: "/driver", label: "מצב נהג", icon: Truck },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3 md:px-6">
          <img
            src={NOA_AVATAR}
            alt="נועה AI — סדרנית ראשית"
            className="size-11 rounded-2xl border border-border object-cover"
          />
          <div className="me-auto">
            <h1 className="panel-title text-base leading-tight md:text-lg">
              סידור <span className="text-gradient-cyan">נועה AI</span>
            </h1>
            <p className="text-[11px] text-muted-foreground md:text-xs">
              ח. סבן חומרי בניין בע״מ · SabanOS Dispatch
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
              <span className="live-dot inline-block size-2" />
              מערכת חיה · 07:00–17:00
            </span>
            <button
              type="button"
              aria-label="התראות"
              className="relative rounded-xl border border-border bg-surface/60 p-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Bell className="size-4" />
              <span className="absolute -end-1 -top-1 flex size-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-danger-foreground">
                4
              </span>
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-3 pb-2 md:px-6">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface/70 hover:text-foreground md:text-sm"
              activeProps={{
                className:
                  "!bg-primary/15 !text-primary ring-1 ring-primary/40 shadow-[0_0_24px_-12px_var(--primary)]",
              }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-5 md:px-6">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="me-auto">
            <h2 className="panel-title text-xl md:text-2xl">{title}</h2>
            {subtitle ? <p className="mt-1 text-xs text-muted-foreground md:text-sm">{subtitle}</p> : null}
          </div>
          {actions}
        </div>
        {children}
      </main>

      <footer className="mx-auto max-w-[1600px] px-4 pb-8 pt-2 text-center text-xs text-muted-foreground md:px-6">
        באדיבות נועה ❤️ — סדרנית ראשית ומנהלת תפעול, ח. סבן חומרי בניין בע״מ
      </footer>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "שיבוץ ממתין": "border-border bg-surface-2/70 text-muted-foreground",
    "שוגר בוואטסאפ": "border-whatsapp/40 bg-whatsapp/15 text-whatsapp",
    בהעמסה: "border-warning/40 bg-warning/15 text-warning",
    בנסיעה: "border-hikmat/40 bg-hikmat/15 text-hikmat",
    נפרק: "border-ali/40 bg-ali/15 text-ali",
    מאושר: "border-verified/40 bg-verified/15 text-verified",
    "מועד האספקה מתאפס - בבדיקה מחדש": "border-danger/40 bg-danger/15 text-danger",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        map[status] ?? "border-border bg-surface-2/70 text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`glass p-4 md:p-5 ${className}`}>{children}</section>;
}
