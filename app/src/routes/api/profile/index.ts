import { createFileRoute } from "@tanstack/react-router";

import { json, publicUser, requireUser } from "../../../lib/auth.server";

export const Route = createFileRoute("/api/profile/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireUser(request);
        if ("response" in auth) return auth.response;
        return json({ ok: true, profile: publicUser(auth.user) });
      },
    },
  },
});
