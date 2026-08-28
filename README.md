# Noa's Dispatch

# 🚀 SYSTEM BUILD PROMPT: "סידור נועה AI" — Logistics OS & WhatsApp Dispatch PWA (ח. סבן)

Act as a Principal Full-Stack Engineer & Lead UI/UX Architect. Build a production-ready, fully responsive, RTL-first Web/PWA application using React 19, Next.js (App Router), TypeScript, Tailwind CSS, Lucide React, and HTML5 Canvas API, ready for deployment on Vercel.

---

## 1. System Identity & UI/UX Guidelines

- **App Name:** סידור נועה AI (SabanOS Logistics & Dispatch OS)

- **Organization:** ח. סבן חומרי בניין בע"מ

- **Persona:** נועה AI — סדרנית ראשית ומנהלת תפעול, יד ימינו של ראמי.

  - Avatar URL: `https://i.ibb.co/whtMgBNC/Gemini-Generated-Image-2.png`

  - Tone: Warm, sharp, professional Israeli operational tone (לשון נקבה: "ראמי אחי אהובי", "אהובי", "באדיבות נועה ❤️").

  - Response Limit: Under 50 words in chat, unless presenting dispatch tables, JSON, or comparison reports.

  - Strict Rule (No Hallucination): If critical logistics data is missing:

    *"אהובי ראמי לא הגיע לנקודה זו עדיין... מסכן שלי כמה הוא יכול להספיק!! רחמנות. אבל אשמח לשלוח לו מייל עם השאלה. איך אני יכולה לעזור לך עכשיו, ראמי אחי אהובי? 🚚 באדיבות נועה ❤️"*

  - Any change in existing order immediately resets the status to: `"מועד האספקה מתאפס - בבדיקה מחדש"`.

- **Direction & Typography:** RTL (`dir="rtl"`), Fonts: `Rubik`, `Assistant`, `sans-serif`.

- **Theme (Logistics Glassmorphism):**

  - Dark Slate background: `#0B0F17` / `#131B2A`

  - Accent Drivers: Hikmat = Cyan (`#06B6D4`), Ali = Emerald (`#10B981`)

  - Status Accents: Warning = Amber (`#F59E0B`), Danger = Rose (`#F43F5E`), Verified = Green (`#22C55E`)

  - Border Glass: `border-slate-700/40 bg-slate-900/60 backdrop-blur-md`

---

## 2. Core Modules to Implement

### A. 📊 Operational Live Dashboard (`/`)

1. Top KPI Cards: Active Deliveries, Scheduled Trucks, Pallet/Big-Bag Deposits Balance, Alerts & Discrepancies.

2. Warehouse Split Monitor:

   - `🏭 4️⃣(החרש)` — מלט, ברזל, חומרי מליטה כבדים.

   - `🏟️ 1️⃣(התלמיד)` — גבס, צבעים, כלי עבודה, אביזרי אינסטלציה.

3. Live Truck Tracking & Hourly Dispatch Timeline (07:00–17:00) with quick drag/assign slots.

### B. 💬 WhatsApp Dispatch & Ping-Pong Hub (`/chat`)

1. WhatsApp Web style UI (Sidebar with chats: "ראמי סבן", "חכמת 🚚 (משאית 1)", "עלי 🚛 (משאית 2)", "מוקד סבן").

2. Active Chat with Noa AI:

   - Free-text / voice parser: Parses messy orders (e.g. "תוציא לבוקטוס 40 שקי מלט ו-6 טיט בלות לעמית בהרצוג כפר סבא מחר ב-8 בבוקר").

   - Auto Deposit Calculator: Pallet deposit (מק"ט 60060) auto-added above 20 bags; Big Bag deposit (מק"ט 60002) per aggregate bag; exempt for direct drop-off.

   - Outputs structured JSON payload for Google Sheets / Make.com Webhook.

   - "שיגור לנהג" Button: Generates formatted WhatsApp text + calculated Waze URL (`https://waze.com/ul?q=...`) + Audio briefing preview.

### C. 🚚 Dispatch Matrix & Schedule Board (`/matrix`)

1. Multi-column scheduler for drivers: חכמת (Cyan truck), עלי (Emerald truck), קבלן חיצוני.

2. Orders pool on side drawer, assignable to time slots & warehouses.

3. Status badges: שיבוץ ממתין, שוגר בוואטסאפ, בהעמסה, בנסיעה, נפרק, מאושר.

### D. 📄 Delivery Notes OCR & Interactive Canvas Layer (`/ocr`)

1. Document Viewer with split screen: Left = Interactive Canvas overlay on delivery note image; Right = Extracted Fields & Comax Reconciliation.

2. Canvas Markup Tools:

   - ⭕ Circle Tool (mark shortages/damage).

   - 🖍️ Highlighter Tool (yellow/orange overlay).

   - ✍️ Pen & Digital Signature Pad.

   - 💬 Text Box tool (add notes, verified hours, AR credit approvals).

   - 💾 "שמור תעודה חתומה" button (exports canvas + background as image).

3. Reconciliation Table (Ordered vs. Supplied):

   - Status indicators: `✅ אספקה מאומתת מלאה`, `⚠️ חוסר מאושר`, `⚠️ אי התאמת פקדונות`.

   - Deposit return tracker (משטחים שהוחזרו מהשטח) with automatic credit memo generation.

### E. 📱 Driver PWA Mode (`/driver`)

1. Mobile-first driver view with active mission card.

2. One-click "פתח ב-Waze", list of items with checkboxes.

3. Customer signature canvas + camera upload for delivery note.

4. Offline queue support with sync indicator (`🟢 מסונכרן` / `🟠 ממתין לסנכרון`).

---

## 3. Data Schemas & Mock Data

Provide a robust mock repository in `/lib/mockData.ts` with initial realistic Israeli building material orders (בוקטוס, א.ע. הנדסה, שפיר, דניה סיבוס, עמית בהרצוג), items (שקי מלט נשר, טיט מוכן בלות, חול ים, בלוק איטונג), and SKUs.

## 4. API Endpoints

1. `POST /api/parse-order` — Text to normalized order JSON.

2. `POST /api/dispatch-driver` — Sends payload to JONI / Firebase Webhook.

3. `POST /api/save-annotated-doc` — Stores annotated canvas note.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://noa-dispatch-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/55032fb0-dea7-424d-b003-d705cb3118dd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
