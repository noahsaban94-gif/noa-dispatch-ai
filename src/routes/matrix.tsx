import { createFileRoute } from "@tanstack/react-router";
import { Truck, PackageOpen, Clock } from "lucide-react";
import { useState } from "react";
import { AppShell, GlassCard, StatusBadge } from "@/components/AppShell";
import {
  DRIVERS,
  MOCK_ORDERS,
  ORDER_STATUSES,
  STATUS_RESET,
  TIME_SLOTS,
  WAREHOUSES,
  type DriverId,
  type Order,
  type OrderStatus,
} from "@/lib/mockData";

export const Route = createFileRoute("/matrix")({
  head: () => ({
    meta: [
      { title: "מטריצת סידור ולוח שיבוצים · סידור נועה AI" },
      {
        name: "description",
        content:
          "לוח שיבוצים מרובה עמודות לחכמת, עלי וקבלן חיצוני: מאגר הזמנות נגרר לשעות ולמחסנים עם סטטוסי שיגור מלאים.",
      },
      { property: "og:title", content: "מטריצת סידור ולוח שיבוצים · סידור נועה AI" },
      {
        property: "og:description",
        content: "שיבוץ הזמנות לנהגים ולשעות 07:00–17:00 עם סטטוס בזמן אמת.",
      },
    ],
  }),
  component: MatrixBoard,
});

function MatrixBoard() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [dragId, setDragId] = useState<string | null>(null);

  const pool = orders.filter((o) => !o.driverId || !o.slot);

  function assign(driverId: DriverId, slot: string) {
    if (!dragId) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === dragId ? { ...o, driverId, slot, status: STATUS_RESET } : o)),
    );
    setDragId(null);
  }

  function setStatus(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  function unassign(id: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, driverId: null, slot: null, status: STATUS_RESET } : o)),
    );
  }

  return (
    <AppShell
      title="מטריצת סידור ושיבוצים"
      subtitle="גרור הזמנה מהמאגר לעמודת נהג — כל שינוי מאפס את מועד האספקה לבדיקה מחדש"
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <GlassCard className="overflow-x-auto scroll-thin">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[92px_repeat(3,1fr)] gap-2">
              <div className="text-[11px] font-semibold text-muted-foreground">שעה</div>
              {DRIVERS.map((d) => (
                <div
                  key={d.id}
                  className={`rounded-xl border p-2.5 ${
                    d.accent === "hikmat"
                      ? "border-hikmat/40 bg-hikmat/10"
                      : d.accent === "ali"
                        ? "border-ali/40 bg-ali/10"
                        : "border-border bg-surface-2/60"
                  }`}
                >
                  <p className="flex items-center gap-1.5 text-xs font-bold">
                    <Truck
                      className={`size-4 ${
                        d.accent === "hikmat"
                          ? "text-hikmat"
                          : d.accent === "ali"
                            ? "text-ali"
                            : "text-muted-foreground"
                      }`}
                    />
                    {d.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{d.truck}</p>
                </div>
              ))}
            </div>

            {TIME_SLOTS.map((slot) => (
              <div key={slot} className="mt-2 grid grid-cols-[92px_repeat(3,1fr)] gap-2">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="size-3" />
                  {slot}
                </div>
                {DRIVERS.map((d) => {
                  const cell = orders.filter((o) => o.driverId === d.id && o.slot === slot);
                  return (
                    <div
                      key={d.id + slot}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => assign(d.id, slot)}
                      className="min-h-16 rounded-xl border border-dashed border-border/70 p-1.5 transition-colors hover:bg-surface/60"
                    >
                      {cell.map((o) => (
                        <div
                          key={o.id}
                          draggable
                          onDragStart={() => setDragId(o.id)}
                          className={`mb-1 cursor-grab rounded-lg border p-2 text-[11px] ${
                            d.accent === "hikmat"
                              ? "border-hikmat/40 bg-hikmat/12"
                              : d.accent === "ali"
                                ? "border-ali/40 bg-ali/12"
                                : "border-border bg-surface-2/70"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold">{o.id}</span>
                            <button
                              type="button"
                              onClick={() => unassign(o.id)}
                              className="text-[10px] text-muted-foreground hover:text-danger"
                            >
                              שחרר
                            </button>
                          </div>
                          <p className="truncate">{o.customerName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {o.warehouses
                              .map((w) => WAREHOUSES.find((x) => x.id === w)!.code)
                              .join(" + ")}{" "}
                            · {o.lines.length} שורות
                          </p>
                          <select
                            value={ORDER_STATUSES.includes(o.status) ? o.status : ""}
                            onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                            className="mt-1.5 w-full rounded-md border border-input bg-background/70 px-1.5 py-1 text-[10px] outline-none"
                          >
                            <option value="" disabled>
                              {STATUS_RESET}
                            </option>
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="xl:max-h-[80vh] xl:overflow-y-auto">
          <h3 className="panel-title mb-3 flex items-center gap-2 text-sm">
            <PackageOpen className="size-4 text-warning" />
            מאגר הזמנות ({pool.length})
          </h3>
          <div className="space-y-2">
            {pool.length === 0 ? (
              <p className="text-xs text-muted-foreground">הכל משובץ, ראמי אחי אהובי 💪</p>
            ) : null}
            {pool.map((o) => (
              <div
                key={o.id}
                draggable
                onDragStart={() => setDragId(o.id)}
                className="cursor-grab rounded-xl border border-border bg-surface/50 p-3 hover:bg-surface-2/60"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{o.customerName}</p>
                  <span className="text-[10px] text-muted-foreground">{o.id}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {o.address}, {o.city}
                </p>
                <ul className="mt-1.5 space-y-0.5 text-[11px] text-muted-foreground">
                  {o.lines.map((l) => (
                    <li key={l.sku}>
                      • {l.name} — {l.qty} {l.unit}
                    </li>
                  ))}
                </ul>
                <div className="mt-2">
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-border bg-surface/50 p-3 text-[11px] text-muted-foreground">
            {WAREHOUSES.map((w) => (
              <p key={w.id}>
                {w.emoji} {w.code} ({w.name}) — {w.scope}
              </p>
            ))}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
