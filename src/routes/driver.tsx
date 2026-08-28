import { createFileRoute } from "@tanstack/react-router";
import { Navigation, Camera, CheckCircle2, Eraser, CloudUpload, Truck, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DRIVERS, MOCK_ORDERS, NOA_AVATAR, wazeUrl } from "@/lib/mockData";

export const Route = createFileRoute("/driver")({
  head: () => ({
    meta: [
      { title: "מצב נהג · משימה פעילה · סידור נועה AI" },
      {
        name: "description",
        content:
          "אפליקציית נהג מובייל: כרטיס משימה פעיל, פתיחת Waze בקליק, סימון פריטים, חתימת לקוח וצילום תעודה עם תור אופליין.",
      },
      { property: "og:title", content: "מצב נהג · משימה פעילה · סידור נועה AI" },
      {
        property: "og:description",
        content: "חכמת ועלי מקבלים משימה, מנווטים, מסמנים פריטים ומחתימים את הלקוח.",
      },
    ],
  }),
  component: DriverPwa,
});

function DriverPwa() {
  const [driverId, setDriverId] = useState<"hikmat" | "ali">("hikmat");
  const driver = DRIVERS.find((d) => d.id === driverId)!;
  const mission = MOCK_ORDERS.find((o) => o.driverId === driverId) ?? MOCK_ORDERS[0]!;
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [synced, setSynced] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const on = () => setSynced(true);
    const off = () => setSynced(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    setSynced(navigator.onLine);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = c.offsetWidth * 2;
    c.height = 320;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
    }
  }, []);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  }

  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function clearSig() {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
  }

  const allChecked = mission.lines.every((l) => checked[l.sku]);

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-10 pt-4">
      <header className="glass mb-3 flex items-center gap-3 p-3">
        <img src={NOA_AVATAR} alt="נועה AI" className="size-10 rounded-xl object-cover" />
        <div className="me-auto">
          <p className="text-sm font-bold">מצב נהג · {driver.name}</p>
          <p className="text-[11px] text-muted-foreground">{driver.truck}</p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
            synced ? "border-verified/40 bg-verified/12 text-verified" : "border-warning/40 bg-warning/12 text-warning"
          }`}
        >
          {synced ? "🟢 מסונכרן" : "🟠 ממתין לסנכרון"}
        </span>
      </header>

      <div className="mb-3 grid grid-cols-2 gap-2">
        {(["hikmat", "ali"] as const).map((id) => {
          const d = DRIVERS.find((x) => x.id === id)!;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setDriverId(id)}
              className={`rounded-xl border p-2.5 text-xs font-bold transition-colors ${
                driverId === id
                  ? id === "hikmat"
                    ? "border-hikmat/60 bg-hikmat/15 text-hikmat"
                    : "border-ali/60 bg-ali/15 text-ali"
                  : "border-border text-muted-foreground"
              }`}
            >
              <Truck className="mx-auto mb-1 size-4" />
              {d.label}
            </button>
          );
        })}
      </div>

      <section
        className={`glass p-4 ${driverId === "hikmat" ? "shadow-glow-hikmat" : "shadow-glow-ali"}`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground">משימה פעילה</p>
            <h1 className="panel-title text-lg">{mission.customerName}</h1>
            <p className="text-xs text-muted-foreground">
              {mission.address}, {mission.city} · {mission.slot ?? "—"}
            </p>
          </div>
          <span className="rounded-lg border border-border px-2 py-1 text-[10px]">{mission.id}</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={wazeUrl(mission.address, mission.city)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-3 text-sm font-bold text-primary-foreground"
          >
            <Navigation className="size-4" /> פתח ב-Waze
          </a>
          <a
            href={`tel:${mission.contact ? "+972521110011" : ""}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface/60 px-3 py-3 text-sm font-bold"
          >
            <Phone className="size-4" /> חייג ללקוח
          </a>
        </div>

        <ul className="mt-4 space-y-2">
          {mission.lines.map((l) => (
            <li key={l.sku}>
              <label className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 p-3">
                <input
                  type="checkbox"
                  checked={Boolean(checked[l.sku])}
                  onChange={(e) => setChecked((p) => ({ ...p, [l.sku]: e.target.checked }))}
                  className="size-5 accent-[var(--verified)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{l.name}</span>
                  <span className="block text-[11px] text-muted-foreground">מק״ט {l.sku}</span>
                </span>
                <span className="text-sm font-extrabold">
                  {l.qty} {l.unit}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="glass mt-3 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="panel-title text-sm">חתימת לקוח</h2>
          <button
            type="button"
            onClick={clearSig}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
          >
            <Eraser className="size-3.5" /> נקה
          </button>
        </div>
        <canvas
          ref={canvasRef}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={() => (drawing.current = false)}
          onPointerLeave={() => (drawing.current = false)}
          className="block h-40 w-full touch-none rounded-xl border border-border bg-white"
        />

        <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface/50 px-3 py-3 text-xs font-semibold text-muted-foreground">
          <Camera className="size-4" />
          {photo ? "תעודה צולמה ✅ — החלף תמונה" : "צלם תעודת משלוח"}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPhoto(URL.createObjectURL(f));
            }}
          />
        </label>
        {photo ? (
          <img src={photo} alt="תעודת משלוח שצולמה" className="mt-2 w-full rounded-xl border border-border" />
        ) : null}

        <button
          type="button"
          disabled={!allChecked}
          onClick={() => setDone(true)}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-verified px-3 py-3 text-sm font-extrabold text-verified-foreground disabled:opacity-40"
        >
          <CheckCircle2 className="size-4" /> סיים אספקה ושלח
        </button>
        {done ? (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <CloudUpload className="size-3.5" />
            {synced ? "נשלח למוקד סבן ✅" : "נשמר בתור אופליין — יסונכרן אוטומטית"}
          </p>
        ) : null}
      </section>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">באדיבות נועה ❤️</p>
    </div>
  );
}
