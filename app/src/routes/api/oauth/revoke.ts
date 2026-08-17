import { createFileRoute } from "@tanstack/react-router";

import {
  ACCESS_COOKIE,
  clearTokenCookies,
  jsonWithCookies,
  lookupToken,
  readCookie,
  REFRESH_COOKIE,
  revokeFamily,
} from "../../../lib/auth.server";

// OAuth 2.0 token revocation (RFC 7009 shape). Revoking any token revokes its
// whole family (access + refresh), i.e. the full session. Per the RFC,
// unknown tokens still return 200. Also clears the browser cookies.
export const Route = createFileRoute("/api/oauth/revoke")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let bodyToken = "";
        try {
          const contentType = request.headers.get("content-type") ?? "";
          if (contentType.includes("application/x-www-form-urlencoded")) {
            const form = await request.formData();
            bodyToken = String(form.get("token") ?? "");
          } else {
            const body = (await request.json()) as Record<string, unknown>;
            bodyToken = String(body.token ?? "");
          }
        } catch {
          // token may come from cookies instead
        }
        const candidates = [
          bodyToken,
          readCookie(request, REFRESH_COOKIE) ?? "",
          readCookie(request, ACCESS_COOKIE) ?? "",
        ].filter(Boolean);
        for (const candidate of candidates) {
          const row = await lookupToken(candidate);
          if (row) {
            await revokeFamily(row.family_id);
            break;
          }
        }
        return jsonWithCookies({ ok: true }, 200, clearTokenCookies());
      },
    },
  },
});
