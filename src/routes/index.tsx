import { createFileRoute } from "@tanstack/react-router";
import {
  Truck,
  CalendarClock,
  Layers,
  AlertTriangle,
  Factory,
  Warehouse,
  MapPin,
  ArrowLeftRight,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell, GlassCard, StatusBadge } from "@/components/AppShell";
import {
  ALERTS,
  DEPOSIT_BALANCE,
  DRIVERS,
  MOCK_ORDERS,
  TIME_SLOTS,
  WAREHOUSES,
  type DriverId,
  type Order,
} from "@/lib/mockData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "לוח מבצעים חי · סידור נועה AI — ח. סבן" },
      {
        name: "description",
        content:
          "לוח מבצעים חי לסידור משאיות ח. סבן: אספקות פעילות, פיצול מחסנים, מאזן פקדונות משטחים וביג בג והתראות אי התאמה.",
      },
      { property: "og:title", content: "לוח מבצעים חי · סידור נועה AI" },
      {
        property: "og:description",
        content: "אספקות פעילות, ציר שיגור שעתי 07:00–17:00 ומאזן פקדונות בזמן אמת.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [dragId, setDragId] = useState<string | null>(null);

  const kpis = useMemo(() => {
    const active = orders.filter((o) =>
      ["בהעמסה", "בנסיעה", "שוגר בוואטסאפ"].includes(o.status),
    ).length;
    const scheduled = orders.filter((o) => o.slot && o.driverId).length;
    const depositBalance = DEPOSIT_BALANCE.reduce((sum, r) => sum + (r.out - r.returned), 0);
    return { active, scheduled, depositBalance, alerts: ALERTS.length };
  }, [orders]);

  function assign(orderId: string, driverId: DriverId, slot: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, driverId, slot, status: "מועד האספקה מתאפס - בבדיקה מחדש" } : o,
      ),
    );
  }

  return (
    <AppShell
      title="לוח מבצעים חי"
      subtitle="ראמי אחי אהובי — הכל מנוטר, גררי הזמנה לשעה כדי לשבץ 🚚"
      actions={
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowLeftRight className="size-4 text-primary" />
          גרירה ושחרור בין נהגים ושעות
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          icon={<Truck className="size-5" />}
          label="אספקות פעילות"
          value={kpis.active}
          hint="בדרך / בהעמסה"
          tone="hikmat"
        />
        <Kpi
          icon={<CalendarClock className="size-5" />}
          label="משאיות משובצות"
          value={kpis.scheduled}
          hint="מתוך 3 נהגים"
          tone="ali"
        />
        <Kpi
          icon={<Layers className="size-5" />}
          label="מאזן פקדונות"
          value={kpis.depositBalance}
          hint="משטחים + ביג בג בשטח"
          tone="warning"
        />
        <Kpi
          icon={<AlertTriangle className="size-5" />}
          label="התראות ואי התאמות"
          value={kpis.alerts}
          hint="דורש טיפול היום"
          tone="danger"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <GlassCard>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="panel-title text-sm md:text-base">
              פיצול מחסנים · Warehouse Split Monitor
            </h3>
            <span className="text-[11px] text-muted-foreground">לפי סוג חומר</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {WAREHOUSES.map((w) => {
              const wOrders = orders.filter((o) => o.warehouses.includes(w.id));
              const isHikmat = w.accent === "hikmat";
              return (
                <div
                  key={w.id}
                  className={`rounded-xl border p-4 ${
                    isHikmat ? "border-hikmat/35 bg-hikmat/8" : "border-ali/35 bg-ali/8"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isHikmat ? (
                      <Factory className="size-5 text-hikmat" />
                    ) : (
                      <Warehouse className="size-5 text-ali" />
                    )}
                    <div>
                      <p className="text-sm font-bold">
                        {w.emoji} {w.code} ({w.name})
                      </p>
                      <p className="text-[11px] text-muted-foreground">{w.scope}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <span
                      className={`text-3xl font-extrabold ${isHikmat ? "text-hikmat" : "text-ali"}`}
                    >
                      {wOrders.length}
                    </span>
                    <span className="text-[11px] text-muted-foreground">הזמנות בטיפול</span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {wOrders.slice(0, 3).map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between rounded-lg bg-surface/60 px-2.5 py-1.5 text-[11px]"
                      >
                        <span className="truncate">{o.customerName}</span>
                        <span className="text-muted-foreground">{o.slot ?? "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="panel-title text-sm md:text-base">ציר שיגור שעתי · 07:00–17:00</h3>
              <span className="text-[11px] text-muted-foreground">גרור הזמנה מהעמודה השמאלית</span>
            </div>
            <div className="overflow-x-auto scroll-thin">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[110px_repeat(11,minmax(64px,1fr))] gap-1 text-[10px] text-muted-foreground">
                  <div />
                  {TIME_SLOTS.map((t) => (
                    <div key={t} className="text-center">
                      {t}
                    </div>
                  ))}
                </div>
                {DRIVERS.map((d) => (
                  <div
                    key={d.id}
                    className="mt-1 grid grid-cols-[110px_repeat(11,minmax(64px,1fr))] gap-1"
                  >
                    <div
                      className={`flex items-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold ${
                        d.accent === "hikmat"
                          ? "bg-hikmat/15 text-hikmat"
                          : d.accent === "ali"
                            ? "bg-ali/15 text-ali"
                            : "bg-surface-2/70 text-muted-foreground"
                      }`}
                    >
                      <Truck className="size-3.5" />
                      {d.name}
                    </div>
                    {TIME_SLOTS.map((slot) => {
                      const cell = orders.find((o) => o.driverId === d.id && o.slot === slot);
                      return (
                        <div
                          key={slot}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => dragId && assign(dragId, d.id, slot)}
                          className={`min-h-11 rounded-lg border border-dashed border-border/70 p-1 text-[9px] leading-tight transition-colors ${
                            cell
                              ? d.accent === "hikmat"
                                ? "border-solid border-hikmat/40 bg-hikmat/12 text-foreground"
                                : d.accent === "ali"
                                  ? "border-solid border-ali/40 bg-ali/12 text-foreground"
                                  : "border-solid border-border bg-surface-2/60"
                              : "hover:bg-surface/70"
                          }`}
                        >
                          {cell ? (
                            <>
                              <div className="font-bold">{cell.id}</div>
                              <div className="truncate text-muted-foreground">
                                {cell.customerName}
                              </div>
                            </>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <h3 className="panel-title mb-3 text-sm md:text-base">מעקב משאיות חי</h3>
            <div className="space-y-2">
              {orders.map((o) => (
                <div
                  key={o.id}
                  draggable
                  onDragStart={() => setDragId(o.id)}
                  onDragEnd={() => setDragId(null)}
                  className="cursor-grab rounded-xl border border-border bg-surface/50 p-3 transition-colors hover:bg-surface-2/60 active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{o.customerName}</p>
                      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="size-3" />
                        {o.address}, {o.city}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{o.id}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={o.status} />
                    <span className="text-[11px] text-muted-foreground">
                      {o.slot ?? "לא משובץ"} ·{" "}
                      {DRIVERS.find((d) => d.id === o.driverId)?.name ?? "ללא נהג"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="panel-title mb-3 text-sm md:text-base">התראות ואי התאמות</h3>
            <div className="space-y-2">
              {ALERTS.map((a) => (
                <div
                  key={a.id}
                  className={`rounded-xl border p-3 ${
                    a.level === "danger"
                      ? "border-danger/40 bg-danger/10"
                      : a.level === "warning"
                        ? "border-warning/40 bg-warning/10"
                        : "border-border bg-surface/50"
                  }`}
                >
                  <p className="text-xs font-bold">{a.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{a.detail}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="panel-title mb-3 text-sm md:text-base">מאזן פקדונות בשטח</h3>
            <table className="w-full text-[11px]">
              <thead className="text-muted-foreground">
                <tr className="text-start">
                  <th className="pb-2 text-start font-medium">לקוח</th>
                  <th className="pb-2 text-start font-medium">מק״ט</th>
                  <th className="pb-2 text-start font-medium">יצא</th>
                  <th className="pb-2 text-start font-medium">חזר</th>
                  <th className="pb-2 text-start font-medium">יתרה</th>
                </tr>
              </thead>
              <tbody>
                {DEPOSIT_BALANCE.map((r) => {
                  const bal = r.out - r.returned;
                  return (
                    <tr key={r.customerName + r.sku} className="border-t border-border/60">
                      <td className="py-2">{r.customerName}</td>
                      <td className="py-2 text-muted-foreground">{r.sku}</td>
                      <td className="py-2">{r.out}</td>
                      <td className="py-2">{r.returned}</td>
                      <td
                        className={`py-2 font-bold ${bal > 0 ? "text-warning" : "text-verified"}`}
                      >
                        {bal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}

function Kpi({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  tone: "hikmat" | "ali" | "warning" | "danger";
}) {
  const tones = {
    hikmat: "text-hikmat border-hikmat/35 bg-hikmat/10",
    ali: "text-ali border-ali/35 bg-ali/10",
    warning: "text-warning border-warning/35 bg-warning/10",
    danger: "text-danger border-danger/35 bg-danger/10",
  } as const;
  return (
    <div className="glass p-4">
      <div className={`inline-flex rounded-xl border p-2 ${tones[tone]}`}>{icon}</div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="text-xs font-semibold">{label}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}
