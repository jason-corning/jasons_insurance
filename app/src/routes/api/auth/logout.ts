import { createFileRoute } from "@tanstack/react-router";

import {
  ACCESS_COOKIE,
  clearTokenCookies,
  jsonWithCookies,
  lookupToken,
  readAccessToken,
  readCookie,
  REFRESH_COOKIE,
  revokeFamily,
} from "../../../lib/auth.server";

// Logout = OAuth revocation of the current token family + cookie clearing.
export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const candidates = [
          readCookie(request, REFRESH_COOKIE) ?? "",
          readAccessToken(request) ?? "",
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
