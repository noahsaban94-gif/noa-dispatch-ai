import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { parseOrderText, toWebhookPayload } from "@/lib/parseOrder";
import { NOA_MISSING_DATA_REPLY } from "@/lib/mockData";

const Body = z.object({
  text: z.string().min(2).max(2000),
  orderId: z.string().max(32).optional(),
});

export const Route = createFileRoute("/api/parse-order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsedBody = Body.safeParse(await request.json().catch(() => null));
        if (!parsedBody.success) {
          return Response.json({ error: "טקסט הזמנה חסר או לא תקין" }, { status: 400 });
        }
        const orderId = parsedBody.data.orderId ?? `SB-${Date.now().toString().slice(-5)}`;
        const parsed = parseOrderText(parsedBody.data.text);
        return Response.json({
          ok: parsed.ok,
          orderId,
          missing: parsed.missing,
          noaReply: parsed.ok ? "קיבלתי אהובי ✅ באדיבות נועה ❤️" : NOA_MISSING_DATA_REPLY,
          order: parsed,
          payload: toWebhookPayload(parsed, orderId),
        });
      },
    },
  },
});
