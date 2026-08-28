/**
 * Mock repository — ח. סבן חומרי בניין בע"מ
 * Realistic Israeli building-material logistics data.
 */

export type WarehouseId = "4" | "1";

export interface Warehouse {
  id: WarehouseId;
  emoji: string;
  code: string;
  name: string;
  scope: string;
  accent: "hikmat" | "ali";
}

export const WAREHOUSES: Warehouse[] = [
  {
    id: "4",
    emoji: "🏭",
    code: "4️⃣",
    name: "החרש",
    scope: "מלט, ברזל, חומרי מליטה כבדים",
    accent: "hikmat",
  },
  {
    id: "1",
    emoji: "🏟️",
    code: "1️⃣",
    name: "התלמיד",
    scope: "גבס, צבעים, כלי עבודה, אביזרי אינסטלציה",
    accent: "ali",
  },
];

export type DriverId = "hikmat" | "ali" | "external";

export interface Driver {
  id: DriverId;
  name: string;
  label: string;
  truck: string;
  phone: string;
  accent: "hikmat" | "ali" | "muted";
  capacityTon: number;
}

export const DRIVERS: Driver[] = [
  {
    id: "hikmat",
    name: "חכמת",
    label: "חכמת 🚚 (משאית 1)",
    truck: "מנוף 15 טון · 74-812-45",
    phone: "+972500000001",
    accent: "hikmat",
    capacityTon: 15,
  },
  {
    id: "ali",
    name: "עלי",
    label: "עלי 🚛 (משאית 2)",
    truck: "צריח 12 טון · 83-441-92",
    phone: "+972500000002",
    accent: "ali",
    capacityTon: 12,
  },
  {
    id: "external",
    name: "קבלן חיצוני",
    label: "קבלן חיצוני 🚧",
    truck: "הובלה שכורה לפי קריאה",
    phone: "+972500000003",
    accent: "muted",
    capacityTon: 20,
  },
];

export interface Sku {
  sku: string;
  name: string;
  unit: string;
  warehouse: WarehouseId;
  weightKg: number;
  perPallet?: number;
  depositSku?: string;
  keywords: string[];
}

/** מק"ט 60060 — פקדון משטח | מק"ט 60002 — פקדון ביג בag */
export const DEPOSIT_PALLET = "60060";
export const DEPOSIT_BIGBAG = "60002";

export const SKUS: Sku[] = [
  {
    sku: "10120",
    name: "שק מלט נשר 50 ק\"ג",
    unit: "שק",
    warehouse: "4",
    weightKg: 50,
    perPallet: 40,
    depositSku: DEPOSIT_PALLET,
    keywords: ["מלט", "שקי מלט", "נשר", "שק מלט"],
  },
  {
    sku: "10240",
    name: "טיט מוכן בלות (בייגלה)",
    unit: "בלה",
    warehouse: "4",
    weightKg: 1000,
    depositSku: DEPOSIT_PALLET,
    keywords: ["טיט", "טיט מוכן", "בלות", "בלה", "טיט בלות"],
  },
  {
    sku: "10310",
    name: "חול ים ביג בג 1 טון",
    unit: "ביג בג",
    warehouse: "4",
    weightKg: 1000,
    depositSku: DEPOSIT_BIGBAG,
    keywords: ["חול", "חול ים", "ביג בג", "בig"],
  },
  {
    sku: "10318",
    name: "חצץ דק ביג בג 1 טון",
    unit: "ביג בג",
    warehouse: "4",
    weightKg: 1000,
    depositSku: DEPOSIT_BIGBAG,
    keywords: ["חצץ", "אגרגט", "סומסום"],
  },
  {
    sku: "10450",
    name: "בלוק איטונג 25 ס\"מ",
    unit: "משטח",
    warehouse: "4",
    weightKg: 900,
    depositSku: DEPOSIT_PALLET,
    keywords: ["איטונג", "בלוק", "בלוק איטונג", "גזוז"],
  },
  {
    sku: "10520",
    name: "ברזל זיון קוטר 12 מ\"מ",
    unit: "מטר",
    warehouse: "4",
    weightKg: 1,
    keywords: ["ברזל", "זיון", "קוטר 12"],
  },
  {
    sku: "20110",
    name: "לוח גבס ירוק 1.20x2.60",
    unit: "לוח",
    warehouse: "1",
    weightKg: 22,
    keywords: ["גבס", "לוח גבס", "ירוק"],
  },
  {
    sku: "20320",
    name: "צבע סופרקריל לבן 18 ליטר",
    unit: "פח",
    warehouse: "1",
    weightKg: 20,
    keywords: ["צבע", "סופרקריל", "לבן"],
  },
  {
    sku: "20640",
    name: "מארז אביזרי אינסטלציה 3/4",
    unit: "מארז",
    warehouse: "1",
    weightKg: 6,
    keywords: ["אינסטלציה", "אביזרים", "רקורד"],
  },
  {
    sku: DEPOSIT_PALLET,
    name: "פקדון משטח",
    unit: "יח'",
    warehouse: "4",
    weightKg: 25,
    keywords: ["פקדון משטח", "משטח"],
  },
  {
    sku: DEPOSIT_BIGBAG,
    name: "פקדון ביג בג",
    unit: "יח'",
    warehouse: "4",
    weightKg: 5,
    keywords: ["פקדון ביג בג"],
  },
];

export interface Customer {
  id: string;
  name: string;
  contact: string;
  phone: string;
  site: string;
  city: string;
  creditNote?: string;
}

export const CUSTOMERS: Customer[] = [
  {
    id: "c-boktus",
    name: "בוקטוס בנייה ופיתוח",
    contact: "עמית",
    phone: "+972521110011",
    site: "הרצוג 14",
    city: "כפר סבא",
    creditNote: "אשראי פתוח · 30+",
  },
  {
    id: "c-ae",
    name: "א.ע. הנדסה",
    contact: "אשרף",
    phone: "+972521110022",
    site: "רחוב ההסתדרות 8",
    city: "רעננה",
  },
  {
    id: "c-shapir",
    name: "שפיר הנדסה",
    contact: "מוטי",
    phone: "+972521110033",
    site: "מחלף רעננה דרום",
    city: "רעננה",
    creditNote: "דורש אישור מנהל מעל 20K",
  },
  {
    id: "c-danya",
    name: "דניה סיבוס",
    contact: "ליאור",
    phone: "+972521110044",
    site: "מגדלי TLV אתר 3",
    city: "תל אביב",
  },
  {
    id: "c-amit",
    name: "עמית בהרצוג",
    contact: "עמית",
    phone: "+972521110055",
    site: "הרצוג 22",
    city: "כפר סבא",
  },
];

export type OrderStatus =
  | "שיבוץ ממתין"
  | "שוגר בוואטסאפ"
  | "בהעמסה"
  | "בנסיעה"
  | "נפרק"
  | "מאושר"
  | "מועד האספקה מתאפס - בבדיקה מחדש";

export const ORDER_STATUSES: OrderStatus[] = [
  "שיבוץ ממתין",
  "שוגר בוואטסאפ",
  "בהעמסה",
  "בנסיעה",
  "נפרק",
  "מאושר",
];

export interface OrderLine {
  sku: string;
  name: string;
  qty: number;
  unit: string;
  warehouse: WarehouseId;
  deposit?: boolean;
  supplied?: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  contact: string;
  address: string;
  city: string;
  lines: OrderLine[];
  warehouses: WarehouseId[];
  driverId: DriverId | null;
  slot: string | null;
  status: OrderStatus;
  note?: string;
  directDrop?: boolean;
  createdAt: string;
}

export const TIME_SLOTS = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "SB-24081",
    customerId: "c-boktus",
    customerName: "בוקטוס בנייה ופיתוח",
    contact: "עמית",
    address: "הרצוג 14",
    city: "כפר סבא",
    lines: [
      { sku: "10120", name: 'שק מלט נשר 50 ק"ג', qty: 40, unit: "שק", warehouse: "4", supplied: 40 },
      { sku: "10240", name: "טיט מוכן בלות (בייגלה)", qty: 6, unit: "בלה", warehouse: "4", supplied: 6 },
      { sku: DEPOSIT_PALLET, name: "פקדון משטח", qty: 2, unit: "יח'", warehouse: "4", deposit: true, supplied: 2 },
    ],
    warehouses: ["4"],
    driverId: "hikmat",
    slot: "08:00",
    status: "בנסיעה",
    createdAt: "2026-08-28T05:10:00Z",
  },
  {
    id: "SB-24082",
    customerId: "c-ae",
    customerName: "א.ע. הנדסה",
    contact: "אשרף",
    address: "רחוב ההסתדרות 8",
    city: "רעננה",
    lines: [
      { sku: "10310", name: "חול ים ביג בג 1 טון", qty: 4, unit: "ביג בג", warehouse: "4", supplied: 3 },
      { sku: DEPOSIT_BIGBAG, name: "פקדון ביג בג", qty: 4, unit: "יח'", warehouse: "4", deposit: true, supplied: 3 },
    ],
    warehouses: ["4"],
    driverId: "ali",
    slot: "09:00",
    status: "נפרק",
    note: "חוסר ביג בג אחד — אושר טלפונית",
    createdAt: "2026-08-28T05:40:00Z",
  },
  {
    id: "SB-24083",
    customerId: "c-shapir",
    customerName: "שפיר הנדסה",
    contact: "מוטי",
    address: "מחלף רעננה דרום",
    city: "רעננה",
    lines: [
      { sku: "10520", name: 'ברזל זיון קוטר 12 מ"מ', qty: 1200, unit: "מטר", warehouse: "4" },
      { sku: "10450", name: 'בלוק איטונג 25 ס"מ', qty: 6, unit: "משטח", warehouse: "4" },
      { sku: DEPOSIT_PALLET, name: "פקדון משטח", qty: 6, unit: "יח'", warehouse: "4", deposit: true },
    ],
    warehouses: ["4"],
    driverId: "external",
    slot: "11:00",
    status: "שוגר בוואטסאפ",
    createdAt: "2026-08-28T04:20:00Z",
  },
  {
    id: "SB-24084",
    customerId: "c-danya",
    customerName: "דניה סיבוס",
    contact: "ליאור",
    address: "מגדלי TLV אתר 3",
    city: "תל אביב",
    lines: [
      { sku: "20110", name: "לוח גבס ירוק 1.20x2.60", qty: 60, unit: "לוח", warehouse: "1" },
      { sku: "20320", name: "צבע סופרקריל לבן 18 ליטר", qty: 12, unit: "פח", warehouse: "1" },
    ],
    warehouses: ["1"],
    driverId: null,
    slot: null,
    status: "שיבוץ ממתין",
    createdAt: "2026-08-28T03:55:00Z",
  },
  {
    id: "SB-24085",
    customerId: "c-amit",
    customerName: "עמית בהרצוג",
    contact: "עמית",
    address: "הרצוג 22",
    city: "כפר סבא",
    lines: [
      { sku: "10120", name: 'שק מלט נשר 50 ק"ג', qty: 18, unit: "שק", warehouse: "4" },
      { sku: "20640", name: "מארז אביזרי אינסטלציה 3/4", qty: 3, unit: "מארז", warehouse: "1" },
    ],
    warehouses: ["4", "1"],
    driverId: null,
    slot: null,
    status: "שיבוץ ממתין",
    directDrop: true,
    note: "פריקה ישירה מהמשאית — פטור מפקדון",
    createdAt: "2026-08-28T02:30:00Z",
  },
  {
    id: "SB-24086",
    customerId: "c-boktus",
    customerName: "בוקטוס בנייה ופיתוח",
    contact: "עמית",
    address: "הרצוג 14",
    city: "כפר סבא",
    lines: [
      { sku: "10318", name: "חצץ דק ביג בג 1 טון", qty: 8, unit: "ביג בג", warehouse: "4" },
      { sku: DEPOSIT_BIGBAG, name: "פקדון ביג בג", qty: 8, unit: "יח'", warehouse: "4", deposit: true },
    ],
    warehouses: ["4"],
    driverId: "hikmat",
    slot: "13:00",
    status: "בהעמסה",
    createdAt: "2026-08-28T05:55:00Z",
  },
];

export interface DepositBalanceRow {
  customerName: string;
  sku: string;
  item: string;
  out: number;
  returned: number;
}

export const DEPOSIT_BALANCE: DepositBalanceRow[] = [
  { customerName: "בוקטוס בנייה ופיתוח", sku: DEPOSIT_PALLET, item: "פקדון משטח", out: 34, returned: 26 },
  { customerName: "א.ע. הנדסה", sku: DEPOSIT_BIGBAG, item: "פקדון ביג בג", out: 22, returned: 18 },
  { customerName: "שפיר הנדסה", sku: DEPOSIT_PALLET, item: "פקדון משטח", out: 48, returned: 48 },
  { customerName: "דניה סיבוס", sku: DEPOSIT_BIGBAG, item: "פקדון ביג בג", out: 15, returned: 9 },
];

export interface Alert {
  id: string;
  level: "warning" | "danger" | "info";
  title: string;
  detail: string;
  orderId?: string;
}

export const ALERTS: Alert[] = [
  {
    id: "a1",
    level: "danger",
    title: "אי התאמת פקדונות",
    detail: "א.ע. הנדסה — הוזמנו 4 ביג בג, סופקו 3. פער פקדון מק\"ט 60002.",
    orderId: "SB-24082",
  },
  {
    id: "a2",
    level: "warning",
    title: "חוסר מאושר",
    detail: "חסר ביג בג חול ים אחד — אושר טלפונית ע\"י אשרף.",
    orderId: "SB-24082",
  },
  {
    id: "a3",
    level: "warning",
    title: "עומס מחסן החרש",
    detail: "3 העמסות מלט חופפות בין 08:00–09:00.",
  },
  {
    id: "a4",
    level: "info",
    title: "החזרת משטחים מהשטח",
    detail: "חכמת אסף 8 משטחים מבוקטוס — ממתין לזיכרון זיכוי.",
  },
];

export interface ChatThread {
  id: string;
  name: string;
  avatar?: string;
  last: string;
  time: string;
  unread?: number;
  accent?: "hikmat" | "ali" | "muted";
}

export const NOA_AVATAR = "https://i.ibb.co/whtMgBNC/Gemini-Generated-Image-2.png";

export const CHAT_THREADS: ChatThread[] = [
  { id: "noa", name: "נועה AI · סדרנית ראשית", avatar: NOA_AVATAR, last: "מוכנה לשיגור, ראמי אחי אהובי 🚚", time: "07:38", unread: 2 },
  { id: "rami", name: "ראמי סבן", last: "תעלי את בוקטוס לשמונה", time: "07:31", accent: "muted" },
  { id: "hikmat", name: "חכמת 🚚 (משאית 1)", last: "יצאתי מהחרש, 40 מלט על המשטחים", time: "07:22", accent: "hikmat" },
  { id: "ali", name: "עלי 🚛 (משאית 2)", last: "נפרק ברעננה, חסר ביג בג", time: "07:05", unread: 1, accent: "ali" },
  { id: "moked", name: "מוקד סבן", last: "תעודה 88214 נסרקה", time: "06:58", accent: "muted" },
];

export interface ChatMessage {
  id: string;
  from: "rami" | "noa";
  text: string;
  time: string;
  payload?: unknown;
}

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    from: "noa",
    text: "בוקר אור ראמי אחי אהובי ☀️ יש 4 הזמנות פתוחות ו-2 ממתינות לשיבוץ. נתחיל? 🚚 באדיבות נועה ❤️",
    time: "07:02",
  },
  {
    id: "m2",
    from: "rami",
    text: "תוציא לבוקטוס 40 שקי מלט ו-6 טיט בלות לעמית בהרצוג כפר סבא מחר ב-8 בבוקר",
    time: "07:31",
  },
];

export interface DeliveryNote {
  id: string;
  orderId: string;
  customerName: string;
  driver: string;
  date: string;
  verifiedHours?: string;
}

export const DELIVERY_NOTES: DeliveryNote[] = [
  { id: "88214", orderId: "SB-24082", customerName: "א.ע. הנדסה", driver: "עלי", date: "28/08/2026", verifiedHours: "1.5 ש' המתנה" },
  { id: "88215", orderId: "SB-24081", customerName: "בוקטוס בנייה ופיתוח", driver: "חכמת", date: "28/08/2026" },
];

export const NOA_MISSING_DATA_REPLY =
  "אהובי ראמי לא הגיע לנקודה זו עדיין... מסכן שלי כמה הוא יכול להספיק!! רחמנות. אבל אשמח לשלוח לו מייל עם השאלה. איך אני יכולה לעזור לך עכשיו, ראמי אחי אהובי? 🚚 באדיבות נועה ❤️";

export const STATUS_RESET = "מועד האספקה מתאפס - בבדיקה מחדש" as const;

export function findOrder(id: string): Order | undefined {
  return MOCK_ORDERS.find((o) => o.id === id);
}

export function driverById(id: DriverId | null): Driver | undefined {
  return DRIVERS.find((d) => d.id === id);
}

export function wazeUrl(address: string, city: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(`${address}, ${city}, ישראל`)}&navigate=yes`;
}
