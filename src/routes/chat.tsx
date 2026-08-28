import { createFileRoute } from "@tanstack/react-router";
import { Mic, Send, Search, Truck, Volume2, Copy, Navigation, Braces } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { AppShell, GlassCard, StatusBadge } from "@/components/AppShell";
import {
  CHAT_THREADS,
  DRIVERS,
  INITIAL_MESSAGES,
  NOA_AVATAR,
  NOA_MISSING_DATA_REPLY,
  wazeUrl,
  type ChatMessage,
  type DriverId,
} from "@/lib/mockData";
import {
  buildDriverMessage,
  parseOrderText,
  toWebhookPayload,
  type ParsedOrder,
} from "@/lib/parseOrder";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "שיגור וואטסאפ ופינג-פונג · סידור נועה AI" },
      {
        name: "description",
        content:
          "מוקד שיגור בסטייל וואטסאפ: נועה AI מפרקת הזמנות בטקסט חופשי, מחשבת פקדונות משטח וביג בג ומשגרת לנהג עם קישור Waze.",
      },
      { property: "og:title", content: "שיגור וואטסאפ ופינג-פונג · סידור נועה AI" },
      {
        property: "og:description",
        content: "פירוק הזמנות מבולגנות ל-JSON מסודר ושיגור מיידי לחכמת או עלי.",
      },
    ],
  }),
  component: ChatHub,
});

const EXAMPLE = "תוציא לבוקטוס 40 שקי מלט ו-6 טיט בלות לעמית בהרצוג כפר סבא מחר ב-8 בבוקר";

function nowTime() {
  return new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

function ChatHub() {
  const [thread, setThread] = useState("noa");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState(EXAMPLE);
  const [parsed, setParsed] = useState<ParsedOrder | null>(null);
  const [driverId, setDriverId] = useState<DriverId>("hikmat");
  const [dispatched, setDispatched] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const orderId = useMemo(
    () => (parsed ? `SB-${Math.floor(24090 + Math.random() * 90)}` : "SB-24091"),
    [parsed],
  );
  const driver = DRIVERS.find((d) => d.id === driverId)!;

  function send() {
    const text = input.trim();
    if (!text) return;
    const mine: ChatMessage = { id: crypto.randomUUID(), from: "rami", text, time: nowTime() };
    const result = parseOrderText(text);
    const reply: ChatMessage = {
      id: crypto.randomUUID(),
      from: "noa",
      text: result.ok
        ? `קיבלתי אהובי ✅ פירקתי ${result.lines.length} פריטים ל${result.customerName}. הוספתי ${result.deposits.length} שורות פקדון. הסטטוס: מועד האספקה מתאפס - בבדיקה מחדש. מאשר שיגור? 🚚 באדיבות נועה ❤️`
        : NOA_MISSING_DATA_REPLY,
      time: nowTime(),
    };
    setMessages((p) => [...p, mine, reply]);
    setParsed(result.ok ? result : null);
    setDispatched(null);
    setInput("");
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
  }

  const waze = parsed ? wazeUrl(parsed.address ?? "", parsed.city ?? "") : "";
  const driverText = parsed ? buildDriverMessage(parsed, orderId, driver.name, waze) : "";
  const payload = parsed ? toWebhookPayload(parsed, orderId) : null;

  async function dispatch() {
    if (!parsed) return;
    try {
      await fetch("/api/dispatch-driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, orderId, message: driverText, payload }),
      });
    } catch {
      /* offline — נשמר בתור מקומי */
    }
    setDispatched(driverText);
    setMessages((p) => [
      ...p,
      {
        id: crypto.randomUUID(),
        from: "noa",
        text: `שוגר ל${driver.name} בוואטסאפ עם ניווט Waze, אהובי 🚚 באדיבות נועה ❤️`,
        time: nowTime(),
      },
    ]);
  }

  return (
    <AppShell
      title="מוקד שיגור וואטסאפ"
      subtitle="פינג-פונג עם נועה AI · פירוק הזמנות ושיגור לנהגים"
    >
      <div className="grid gap-4 xl:grid-cols-[240px_1fr_360px]">
        {/* Sidebar */}
        <GlassCard className="xl:max-h-[76vh] xl:overflow-y-auto">
          <div className="relative mb-3">
            <Search className="absolute end-2.5 top-2.5 size-4 text-muted-foreground" />
            <input
              placeholder="חיפוש שיחה..."
              className="w-full rounded-xl border border-input bg-surface/60 py-2 pe-9 ps-3 text-xs outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1">
            {CHAT_THREADS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setThread(t.id)}
                className={`flex w-full items-center gap-2.5 rounded-xl p-2 text-start transition-colors ${
                  thread === t.id ? "bg-primary/15 ring-1 ring-primary/40" : "hover:bg-surface-2/60"
                }`}
              >
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} className="size-9 rounded-xl object-cover" />
                ) : (
                  <span
                    className={`flex size-9 items-center justify-center rounded-xl text-xs font-bold ${
                      t.accent === "hikmat"
                        ? "bg-hikmat/20 text-hikmat"
                        : t.accent === "ali"
                          ? "bg-ali/20 text-ali"
                          : "bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    {t.name.slice(0, 2)}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-1">
                    <span className="truncate text-xs font-semibold">{t.name}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{t.time}</span>
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">{t.last}</span>
                </span>
                {t.unread ? (
                  <span className="flex size-4 items-center justify-center rounded-full bg-whatsapp text-[9px] font-bold text-background">
                    {t.unread}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Conversation */}
        <GlassCard className="flex min-h-[60vh] flex-col xl:max-h-[76vh]">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <img src={NOA_AVATAR} alt="נועה AI" className="size-10 rounded-xl object-cover" />
            <div className="me-auto">
              <p className="text-sm font-bold">נועה AI · סדרנית ראשית</p>
              <p className="text-[11px] text-verified">מקוונת · מנהלת תפעול</p>
            </div>
            <button
              type="button"
              onClick={() => setInput(EXAMPLE)}
              className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
            >
              הזמנה לדוגמה
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto py-4 scroll-thin">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.from === "rami" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.from === "rami"
                      ? "border border-border bg-surface-2/70"
                      : "border border-whatsapp/35 bg-whatsapp/12"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{m.time}</p>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="flex items-end gap-2 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => setListening((v) => !v)}
              aria-label="הקלטה קולית"
              className={`rounded-xl border p-2.5 transition-colors ${
                listening
                  ? "border-danger/50 bg-danger/15 text-danger"
                  : "border-border bg-surface/60 text-muted-foreground"
              }`}
            >
              <Mic className="size-4" />
            </button>
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="כתוב לנועה בטקסט חופשי: 'תוציא לבוקטוס 40 שקי מלט...'"
              className="flex-1 resize-none rounded-xl border border-input bg-surface/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={send}
              className="rounded-xl bg-primary p-2.5 text-primary-foreground transition-opacity hover:opacity-90"
              aria-label="שליחה"
            >
              <Send className="size-4" />
            </button>
          </div>
        </GlassCard>

        {/* Parsed panel */}
        <div className="space-y-4 xl:max-h-[76vh] xl:overflow-y-auto">
          <GlassCard>
            <h3 className="panel-title mb-3 text-sm">הזמנה מפורקת</h3>
            {!parsed ? (
              <p className="text-xs text-muted-foreground">
                שלח הודעה לנועה כדי לראות פירוק פריטים, פקדונות ו-JSON לשיגור.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-surface/50 p-3 text-xs">
                  <p className="font-bold">
                    {orderId} · {parsed.customerName}
                  </p>
                  <p className="text-muted-foreground">
                    {parsed.contact} · {parsed.address}, {parsed.city}
                  </p>
                  <p className="text-muted-foreground">
                    {parsed.deliveryDate} {parsed.deliveryTime}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={parsed.status} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  {[...parsed.lines, ...parsed.deposits].map((l) => (
                    <div
                      key={l.sku}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-[11px] ${
                        l.deposit ? "border border-warning/35 bg-warning/10" : "bg-surface/60"
                      }`}
                    >
                      <span className="truncate">
                        {l.name} <span className="text-muted-foreground">מק״ט {l.sku}</span>
                      </span>
                      <span className="font-bold">
                        {l.qty} {l.unit}
                      </span>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] text-muted-foreground">בחר נהג לשיגור</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DRIVERS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDriverId(d.id)}
                        className={`rounded-lg border p-2 text-[10px] font-semibold transition-colors ${
                          driverId === d.id
                            ? d.accent === "hikmat"
                              ? "border-hikmat/60 bg-hikmat/15 text-hikmat"
                              : d.accent === "ali"
                                ? "border-ali/60 bg-ali/15 text-ali"
                                : "border-border bg-surface-2/70"
                            : "border-border text-muted-foreground hover:bg-surface/60"
                        }`}
                      >
                        <Truck className="mx-auto mb-1 size-3.5" />
                        {d.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={dispatch}
                  className="w-full rounded-xl bg-whatsapp px-3 py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-90"
                >
                  שיגור לנהג · וואטסאפ + Waze
                </button>

                {dispatched ? (
                  <div className="space-y-2">
                    <div className="rounded-xl border border-whatsapp/35 bg-whatsapp/10 p-3">
                      <pre className="whitespace-pre-wrap text-[11px] leading-relaxed">
                        {dispatched}
                      </pre>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <a
                        href={waze}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-hikmat/40 bg-hikmat/12 px-2.5 py-1.5 text-[11px] text-hikmat"
                      >
                        <Navigation className="size-3.5" /> פתח ב-Waze
                      </a>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(dispatched)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground"
                      >
                        <Copy className="size-3.5" /> העתק
                      </button>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground">
                        <Volume2 className="size-3.5" /> תדריך קולי · 0:12
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </GlassCard>

          {payload ? (
            <GlassCard>
              <h3 className="panel-title mb-2 flex items-center gap-2 text-sm">
                <Braces className="size-4 text-primary" /> JSON ל-Google Sheets / Make.com
              </h3>
              <pre className="max-h-64 overflow-auto rounded-xl bg-background/70 p-3 text-[10px] leading-relaxed scroll-thin">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </GlassCard>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
