import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(api)/prxy/plsbl/api/event")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const upstream = await fetch("https://plausible.io/api/event", {
          method: "POST",
          headers: {
            "content-type": request.headers.get("content-type") ?? "text/plain",
            "user-agent": request.headers.get("user-agent") ?? "",
            "x-forwarded-for": request.headers.get("cf-connecting-ip") ?? "",
          },
          body: request.body,
        });

        return new Response(upstream.body, {
          status: upstream.status,
          headers: upstream.headers,
        });
      },
      GET: () => {
        return new Response(JSON.stringify({}), {
          status: 405,
          headers: { Allow: "POST" },
        });
      },
    },
  },
});
