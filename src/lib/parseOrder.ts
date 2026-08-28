/**
 * Free-text / voice order parser + deposit calculator.
 * Client-safe (used by the chat UI and by the /api/parse-order route).
 */
import {
  CUSTOMERS,
  DEPOSIT_BIGBAG,
  DEPOSIT_PALLET,
  SKUS,
  STATUS_RESET,
  type OrderLine,
  type WarehouseId,
} from "./mockData";

export interface ParsedOrder {
  ok: boolean;
  missing: string[];
  customerName: string | null;
  contact: string | null;
  address: string | null;
  city: string | null;
  deliveryDate: string | null;
  deliveryTime: string | null;
  directDrop: boolean;
  warehouses: WarehouseId[];
  lines: OrderLine[];
  deposits: OrderLine[];
  status: string;
  raw: string;
}

const HEB_NUMBERS: Record<string, number> = {
  אחד: 1,
  שתי: 2,
  שני: 2,
  שלוש: 3,
  שלושה: 3,
  ארבע: 4,
  ארבעה: 4,
  חמש: 5,
  חמישה: 5,
  שש: 6,
  שישה: 6,
  שבע: 7,
  שבעה: 7,
  שמונה: 8,
  תשע: 9,
  תשעה: 10,
  עשר: 10,
  עשרה: 10,
};

const CITIES = ["כפר סבא", "רעננה", "תל אביב", "הרצליה", "פתח תקווה", "נתניה", "הוד השרון"];

function normalize(text: string) {
  return text.replace(/[־–—]/g, "-").replace(/\s+/g, " ").trim();
}

function parseTime(text: string): string | null {
  const explicit = text.match(/(\d{1,2})[:.](\d{2})/);
  if (explicit) return `${explicit[1]!.padStart(2, "0")}:${explicit[2]}`;
  const hour = text.match(/ב-?\s?(\d{1,2})\s?(בבוקר|בצהריים|אחה"צ|אחרי הצהריים|בערב)?/);
  if (hour) {
    let h = Number(hour[1]);
    const part = hour[2] ?? "";
    if (/צהריים|אחה|ערב/.test(part) && h < 12) h += 12;
    if (h >= 0 && h <= 23) return `${String(h).padStart(2, "0")}:00`;
  }
  const words = text.match(/ב(שמונה|תשע|עשר|שבע|שש|אחת עשרה|שתים עשרה)/);
  if (words) {
    const map: Record<string, string> = {
      שש: "06:00",
      שבע: "07:00",
      שמונה: "08:00",
      תשע: "09:00",
      עשר: "10:00",
      "אחת עשרה": "11:00",
      "שתים עשרה": "12:00",
    };
    return map[words[1]!] ?? null;
  }
  return null;
}

function parseDate(text: string): string | null {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  if (/מחר(תיים)?/.test(text)) {
    const days = /מחרתיים/.test(text) ? 2 : 1;
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return iso(d);
  }
  if (/היום|עכשיו|דחוף/.test(text)) return iso(today);
  const explicit = text.match(/(\d{1,2})[/.](\d{1,2})/);
  if (explicit) {
    const d = new Date(today.getFullYear(), Number(explicit[2]) - 1, Number(explicit[1]));
    return iso(d);
  }
  return null;
}

function qtyBefore(tokens: string[], idx: number): number | null {
  for (let i = idx; i >= Math.max(0, idx - 4); i--) {
    const t = tokens[i]!.replace(/^ו?-?/, "");
    const digits = t.match(/(\d+)/);
    if (digits) return Number(digits[1]);
    if (HEB_NUMBERS[t]) return HEB_NUMBERS[t]!;
  }
  return null;
}

export function parseOrderText(input: string): ParsedOrder {
  const raw = input;
  const text = normalize(input);
  const tokens = text.split(" ");

  // --- customer / contact / address ---
  let customerName: string | null = null;
  let contact: string | null = null;
  let address: string | null = null;
  let city: string | null = null;

  for (const c of CUSTOMERS) {
    const short = c.name.split(" ")[0]!;
    if (text.includes(c.name) || (short.length > 2 && text.includes(short))) {
      customerName = c.name;
      contact = c.contact;
      address = c.site;
      city = c.city;
      break;
    }
  }
  const contactMatch = text.match(/ל([א-ת]{2,})\s+ב([א-ת]{3,})/);
  if (contactMatch && !contact) contact = contactMatch[1]!;
  for (const cityName of CITIES) if (text.includes(cityName)) city = cityName;
  const street = text.match(/ב(הרצוג|ההסתדרות|ויצמן|סוקולוב|בן גוריון|הרצל)\s?(\d{1,3})?/);
  if (street) address = `${street[1]} ${street[2] ?? ""}`.trim();

  // --- lines ---
  const lines: OrderLine[] = [];
  for (const sku of SKUS) {
    if (sku.sku === DEPOSIT_PALLET || sku.sku === DEPOSIT_BIGBAG) continue;
    const hit = sku.keywords.find((k) => text.includes(k));
    if (!hit) continue;
    const idx = tokens.findIndex((t) => hit.split(" ").some((w) => t.includes(w)));
    const qty = idx >= 0 ? qtyBefore(tokens, idx) : null;
    if (lines.some((l) => l.sku === sku.sku)) continue;
    lines.push({
      sku: sku.sku,
      name: sku.name,
      qty: qty ?? 1,
      unit: sku.unit,
      warehouse: sku.warehouse,
    });
  }

  const directDrop = /פריקה ישירה|ישר מהמשאית|ללא משטח|בלי משטח|פטור מפקדון/.test(text);

  const deposits = calculateDeposits(lines, directDrop);
  const warehouses = Array.from(new Set(lines.map((l) => l.warehouse))) as WarehouseId[];

  const deliveryDate = parseDate(text);
  const deliveryTime = parseTime(text);

  const missing: string[] = [];
  if (!customerName) missing.push("שם לקוח");
  if (!lines.length) missing.push("פריטים");
  if (!city && !address) missing.push("כתובת אספקה");
  if (!deliveryDate) missing.push("תאריך אספקה");

  return {
    ok: missing.length === 0,
    missing,
    customerName,
    contact,
    address,
    city,
    deliveryDate,
    deliveryTime,
    directDrop,
    warehouses,
    lines,
    deposits,
    status: STATUS_RESET,
    raw,
  };
}

/**
 * Deposit rules:
 *  - Pallet deposit (60060) auto-added above 20 bags — one per full pallet (40 bags), rounded up.
 *  - Pallet deposit also for palletized goods (בלות, איטונג).
 *  - Big Bag deposit (60002) — one per aggregate big bag.
 *  - Direct drop-off is exempt from all deposits.
 */
export function calculateDeposits(lines: OrderLine[], directDrop: boolean): OrderLine[] {
  if (directDrop) return [];
  let pallets = 0;
  let bigBags = 0;

  for (const line of lines) {
    const sku = SKUS.find((s) => s.sku === line.sku);
    if (!sku?.depositSku) continue;
    if (sku.depositSku === DEPOSIT_BIGBAG) {
      bigBags += line.qty;
      continue;
    }
    if (sku.perPallet) {
      if (line.qty > 20) pallets += Math.ceil(line.qty / sku.perPallet);
    } else {
      pallets += line.qty;
    }
  }

  const out: OrderLine[] = [];
  if (pallets > 0)
    out.push({
      sku: DEPOSIT_PALLET,
      name: "פקדון משטח",
      qty: pallets,
      unit: "יח'",
      warehouse: "4",
      deposit: true,
    });
  if (bigBags > 0)
    out.push({
      sku: DEPOSIT_BIGBAG,
      name: "פקדון ביג בג",
      qty: bigBags,
      unit: "יח'",
      warehouse: "4",
      deposit: true,
    });
  return out;
}

/** Structured payload for Google Sheets / Make.com webhook */
export function toWebhookPayload(parsed: ParsedOrder, orderId: string) {
  return {
    source: "סידור נועה AI",
    org: 'ח. סבן חומרי בניין בע"מ',
    orderId,
    customer: {
      name: parsed.customerName,
      contact: parsed.contact,
      address: parsed.address,
      city: parsed.city,
    },
    delivery: {
      date: parsed.deliveryDate,
      time: parsed.deliveryTime,
      directDrop: parsed.directDrop,
    },
    warehouses: parsed.warehouses,
    items: [...parsed.lines, ...parsed.deposits].map((l) => ({
      sku: l.sku,
      name: l.name,
      qty: l.qty,
      unit: l.unit,
      warehouse: l.warehouse,
      deposit: Boolean(l.deposit),
    })),
    status: parsed.status,
    createdAt: new Date().toISOString(),
    signature: "באדיבות נועה ❤️",
  };
}

export function buildDriverMessage(
  parsed: ParsedOrder,
  orderId: string,
  driverName: string,
  wazeLink: string,
): string {
  const items = [...parsed.lines, ...parsed.deposits]
    .map((l) => `• ${l.name} — ${l.qty} ${l.unit} (מק"ט ${l.sku})`)
    .join("\n");
  return [
    `🚚 *שיגור הזמנה ${orderId}* — ח. סבן חומרי בניין`,
    `נהג: ${driverName}`,
    `לקוח: ${parsed.customerName ?? "—"} (${parsed.contact ?? "—"})`,
    `כתובת: ${parsed.address ?? ""} ${parsed.city ?? ""}`.trim(),
    `מועד: ${parsed.deliveryDate ?? "—"} ${parsed.deliveryTime ?? ""}`.trim(),
    `מחסן: ${parsed.warehouses.map((w) => (w === "4" ? "4️⃣ החרש" : "1️⃣ התלמיד")).join(" + ") || "—"}`,
    "",
    items,
    "",
    `🧭 ניווט: ${wazeLink}`,
    "",
    "באדיבות נועה ❤️",
  ].join("\n");
}
