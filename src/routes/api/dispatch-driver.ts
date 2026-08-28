import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DRIVERS, STATUS_RESET } from "@/lib/mockData";

const Body = z.object({
  driverId: z.enum(["hikmat", "ali", "external"]),
  orderId: z.string().min(3).max(32),
  message: z.string().min(5).max(4000),
  payload: z.unknown().optional(),
});

export const Route = createFileRoute("/api/dispatch-driver")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = Body.safeParse(await request.json().catch(() => null));
        if (!body.success) return Response.json({ error: "מטען שיגור לא תקין" }, { status: 400 });

        const driver = DRIVERS.find((d) => d.id === body.data.driverId)!;
        const webhook = process.env["DISPATCH_WEBHOOK_URL"];

        let delivered = false;
        if (webhook) {
          try {
            const res = await fetch(webhook, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                channel: "whatsapp",
                to: driver.phone,
                orderId: body.data.orderId,
                text: body.data.message,
                payload: body.data.payload ?? null,
              }),
            });
            delivered = res.ok;
          } catch {
            delivered = false;
          }
        }

        return Response.json({
          ok: true,
          delivered,
          queued: !delivered,
          driver: { id: driver.id, name: driver.name, label: driver.label },
          orderId: body.data.orderId,
          status: delivered ? "שוגר בוואטסאפ" : STATUS_RESET,
          sentAt: new Date().toISOString(),
        });
      },
    },
  },
});
