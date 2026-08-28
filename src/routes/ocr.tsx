import { createFileRoute } from "@tanstack/react-router";
import {
  Circle,
  Highlighter,
  PenTool,
  Type as TypeIcon,
  Save,
  Trash2,
  Undo2,
  FileText,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell, GlassCard } from "@/components/AppShell";
import { DELIVERY_NOTES, MOCK_ORDERS, findOrder } from "@/lib/mockData";

export const Route = createFileRoute("/ocr")({
  head: () => ({
    meta: [
      { title: "תעודות משלוח, OCR וקנבס חתימה · סידור נועה AI" },
      {
        name: "description",
        content:
          "סימון חוסרים על תעודת משלוח בקנבס אינטראקטיבי, השוואת הוזמן מול סופק מול קומקס, מעקב החזרת פקדונות והפקת חשבון זיכוי.",
      },
      { property: "og:title", content: "תעודות משלוח, OCR וקנבס חתימה · סידור נועה AI" },
      {
        property: "og:description",
        content: "עיגול חוסרים, הדגשה, חתימה דיגיטלית ושמירת תעודה חתומה כתמונה.",
      },
    ],
  }),
  component: OcrStudio,
});

type Tool = "circle" | "highlight" | "pen" | "text";

const TOOLS: { id: Tool; label: string; icon: typeof Circle }[] = [
  { id: "circle", label: "עיגול חוסר", icon: Circle },
  { id: "highlight", label: "מרקר", icon: Highlighter },
  { id: "pen", label: "עט / חתימה", icon: PenTool },
  { id: "text", label: "תיבת טקסט", icon: TypeIcon },
];

const TOOL_COLOR: Record<Tool, string> = {
  circle: "#F43F5E",
  highlight: "rgba(245,158,11,0.35)",
  pen: "#06B6D4",
  text: "#22C55E",
};

function OcrStudio() {
  const [noteId, setNoteId] = useState(DELIVERY_NOTES[0]!.id);
  const note = DELIVERY_NOTES.find((n) => n.id === noteId)!;
  const order = findOrder(note.orderId) ?? MOCK_ORDERS[0]!;

  const [tool, setTool] = useState<Tool>("circle");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const snapshots = useRef<ImageData[]>([]);
  const [returnedDeposits, setReturnedDeposits] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = 900;
    c.height = 1180;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    drawBackground(ctx, c.width, c.height, note.id, order.customerName);
  }, [note.id, order.customerName]);

  function ctx2d() {
    return canvasRef.current?.getContext("2d") ?? null;
  }

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * c.width,
      y: ((e.clientY - r.top) / r.height) * c.height,
    };
  }

  function pushSnapshot() {
    const ctx = ctx2d();
    const c = canvasRef.current;
    if (!ctx || !c) return;
    snapshots.current.push(ctx.getImageData(0, 0, c.width, c.height));
    if (snapshots.current.length > 20) snapshots.current.shift();
  }

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = ctx2d();
    if (!ctx) return;
    pushSnapshot();
    const p = pos(e);
    start.current = p;

    if (tool === "text") {
      const value = window.prompt("טקסט להוספה על התעודה (הערה / שעות מאומתות / אישור זיכוי):");
      if (value) {
        ctx.font = "bold 26px Rubik, sans-serif";
        ctx.fillStyle = TOOL_COLOR.text;
        ctx.direction = "rtl";
        ctx.fillText(value, p.x, p.y);
      }
      return;
    }

    drawing.current = true;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (tool === "pen") {
      ctx.strokeStyle = TOOL_COLOR.pen;
      ctx.lineWidth = 3.5;
    } else if (tool === "highlight") {
      ctx.strokeStyle = TOOL_COLOR.highlight;
      ctx.lineWidth = 26;
    }
  }

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = ctx2d();
    if (!ctx) return;
    const p = pos(e);
    if (tool === "pen" || tool === "highlight") {
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }

  function onUp(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = ctx2d();
    if (!ctx || !drawing.current) return;
    drawing.current = false;
    if (tool === "circle" && start.current) {
      const p = pos(e);
      const s = start.current;
      ctx.beginPath();
      ctx.strokeStyle = TOOL_COLOR.circle;
      ctx.lineWidth = 4;
      ctx.ellipse(
        (s.x + p.x) / 2,
        (s.y + p.y) / 2,
        Math.max(18, Math.abs(p.x - s.x) / 2),
        Math.max(14, Math.abs(p.y - s.y) / 2),
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    start.current = null;
  }

  function undo() {
    const ctx = ctx2d();
    const snap = snapshots.current.pop();
    if (ctx && snap) ctx.putImageData(snap, 0, 0);
  }

  function clearAll() {
    const c = canvasRef.current;
    const ctx = ctx2d();
    if (!c || !ctx) return;
    snapshots.current = [];
    ctx.clearRect(0, 0, c.width, c.height);
    drawBackground(ctx, c.width, c.height, note.id, order.customerName);
  }

  async function save() {
    const c = canvasRef.current;
    if (!c) return;
    const dataUrl = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `תעודה-חתומה-${note.id}.png`;
    a.click();
    try {
      await fetch("/api/save-annotated-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteId: note.id,
          orderId: order.id,
          image: dataUrl.slice(0, 64) + "...",
        }),
      });
    } catch {
      /* offline */
    }
    setSaved(true);
  }

  const depositLines = order.lines.filter((l) => l.deposit);
  const depositOut = depositLines.reduce((s, l) => s + l.qty, 0);
  const depositSupplied = depositLines.reduce((s, l) => s + (l.supplied ?? 0), 0);
  const creditQty = depositOut - depositSupplied + returnedDeposits;

  return (
    <AppShell
      title="תעודות משלוח · OCR וקנבס אינטראקטיבי"
      subtitle="סימון חוסרים, חתימת לקוח והתאמה מול קומקס"
      actions={
        <select
          value={noteId}
          onChange={(e) => setNoteId(e.target.value)}
          className="rounded-xl border border-input bg-surface/60 px-3 py-2 text-xs outline-none"
        >
          {DELIVERY_NOTES.map((n) => (
            <option key={n.id} value={n.id}>
              תעודה {n.id} · {n.customerName}
            </option>
          ))}
        </select>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <GlassCard>
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {TOOLS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTool(id)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] font-medium transition-colors ${
                  tool === id
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:bg-surface/60"
                }`}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
            <span className="mx-1 h-6 w-px bg-border" />
            <button
              type="button"
              onClick={undo}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-2 text-[11px] text-muted-foreground hover:bg-surface/60"
            >
              <Undo2 className="size-3.5" /> ביטול
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-2 text-[11px] text-muted-foreground hover:bg-surface/60"
            >
              <Trash2 className="size-3.5" /> נקה
            </button>
            <button
              type="button"
              onClick={save}
              className="ms-auto inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground"
            >
              <Save className="size-3.5" /> שמור תעודה חתומה
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-white/95">
            <canvas
              ref={canvasRef}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerLeave={onUp}
              className="block w-full touch-none"
              style={{ aspectRatio: "900 / 1180" }}
            />
          </div>
          {saved ? (
            <p className="mt-2 text-[11px] text-verified">
              התעודה נשמרה והורדה כתמונה, אהובי ✅ באדיבות נועה ❤️
            </p>
          ) : null}
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <h3 className="panel-title mb-3 flex items-center gap-2 text-sm">
              <FileText className="size-4 text-primary" /> שדות מחולצים (OCR)
            </h3>
            <dl className="grid grid-cols-2 gap-2 text-[11px]">
              <Field label="מס' תעודה" value={note.id} />
              <Field label="הזמנה" value={order.id} />
              <Field label="לקוח" value={order.customerName} />
              <Field label="נהג" value={note.driver} />
              <Field label="תאריך" value={note.date} />
              <Field label="שעות מאומתות" value={note.verifiedHours ?? "—"} />
              <Field label="כתובת" value={`${order.address}, ${order.city}`} />
              <Field label="מחסן" value={order.warehouses.join(" + ")} />
            </dl>
          </GlassCard>

          <GlassCard>
            <h3 className="panel-title mb-3 text-sm">התאמת קומקס · הוזמן מול סופק</h3>
            <table className="w-full text-[11px]">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="pb-2 text-start font-medium">פריט</th>
                  <th className="pb-2 text-start font-medium">הוזמן</th>
                  <th className="pb-2 text-start font-medium">סופק</th>
                  <th className="pb-2 text-start font-medium">מצב</th>
                </tr>
              </thead>
              <tbody>
                {order.lines.map((l) => {
                  const supplied = l.supplied ?? 0;
                  const full = supplied === l.qty;
                  const label = full
                    ? "✅ אספקה מאומתת מלאה"
                    : l.deposit
                      ? "⚠️ אי התאמת פקדונות"
                      : "⚠️ חוסר מאושר";
                  return (
                    <tr key={l.sku} className="border-t border-border/60">
                      <td className="py-2">
                        {l.name}
                        <span className="block text-[10px] text-muted-foreground">
                          מק״ט {l.sku}
                        </span>
                      </td>
                      <td className="py-2">{l.qty}</td>
                      <td className="py-2">{supplied}</td>
                      <td className={`py-2 ${full ? "text-verified" : "text-warning"}`}>{label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </GlassCard>

          <GlassCard>
            <h3 className="panel-title mb-3 text-sm">מעקב החזרת פקדונות מהשטח</h3>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-muted-foreground">משטחים / ביג בג שהוחזרו</label>
              <input
                type="number"
                min={0}
                value={returnedDeposits}
                onChange={(e) => setReturnedDeposits(Math.max(0, Number(e.target.value)))}
                className="w-20 rounded-lg border border-input bg-surface/60 px-2 py-1.5 text-xs outline-none"
              />
            </div>
            <div className="mt-3 rounded-xl border border-warning/35 bg-warning/10 p-3 text-[11px]">
              <p className="font-bold">חשבון זיכוי אוטומטי</p>
              <p className="mt-1 text-muted-foreground">
                פקדונות שיצאו: {depositOut} · סופקו: {depositSupplied} · הוחזרו: {returnedDeposits}
              </p>
              <p className="mt-1 text-sm font-extrabold text-warning">
                לזיכוי: {Math.max(0, creditQty)} יח׳
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface/50 p-2">
      <dt className="text-[10px] text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

/** Renders a realistic delivery-note background straight onto the canvas. */
function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  noteId: string,
  customer: string,
) {
  ctx.fillStyle = "#fdfcf8";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, w - 48, h - 48);

  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 34px Rubik, sans-serif";
  ctx.fillText("ח. סבן חומרי בניין בע״מ", w - 56, 84);
  ctx.font = "22px Rubik, sans-serif";
  ctx.fillStyle = "#475569";
  ctx.fillText("תעודת משלוח / החזרה", w - 56, 118);
  ctx.fillText(`מס׳ ${noteId}`, w - 56, 150);
  ctx.fillText(`לכבוד: ${customer}`, w - 56, 190);

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1;
  for (let i = 0; i < 16; i++) {
    const y = 240 + i * 48;
    ctx.beginPath();
    ctx.moveTo(56, y);
    ctx.lineTo(w - 56, y);
    ctx.stroke();
  }
  ctx.font = "20px Rubik, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("מק״ט | תיאור פריט | כמות | סופק", w - 56, 228);
  ctx.fillText("חתימת הלקוח: ____________________", w - 56, h - 120);
  ctx.fillText("שעת פריקה: __________", w - 56, h - 76);
  ctx.textAlign = "left";
}
