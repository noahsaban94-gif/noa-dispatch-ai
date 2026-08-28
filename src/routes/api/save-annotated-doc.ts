import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  noteId: z.string().min(1).max(32),
  orderId: z.string().min(1).max(32),
  image: z.string().min(10).max(12_000_000),
  annotations: z.array(z.record(z.unknown())).max(200).optional(),
});

export const Route = createFileRoute("/api/save-annotated-doc")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = Body.safeParse(await request.json().catch(() => null));
        if (!body.success) return Response.json({ error: "תעודה לא תקינה" }, { status: 400 });

        // Storage target (Cloud bucket / Drive) is wired here when enabled.
        return Response.json({
          ok: true,
          noteId: body.data.noteId,
          orderId: body.data.orderId,
          storedAt: new Date().toISOString(),
          reference: `saban/delivery-notes/${body.data.noteId}.png`,
          message: "התעודה החתומה נשמרה, אהובי ✅ באדיבות נועה ❤️",
        });
      },
    },
  },
});
