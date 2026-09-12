import { subscribe } from "@/lib/event";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  let cleanup: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;

      const send = (event: string, data: unknown) => {
        if (closed) return;

        try {
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
            ),
          );
        } catch {}
      };

      send("connected", {});

      const unsubscribe = subscribe(send);

      const heartbeat = setInterval(() => {
        send("heartbeat", {});
      }, 30_000);

      const dispose = () => {
        if (closed) return;

        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        req.signal.removeEventListener("abort", dispose);
      };

      cleanup = dispose;
      req.signal.addEventListener("abort", dispose);

      return undefined;
    },

    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
