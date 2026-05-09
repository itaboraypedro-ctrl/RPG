import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Role } from "@/lib/types";

const ADMIN_RE = /^\/admin(\/|$)/;
const GM_RE = /^\/dashboard(\/|$)/;
const PLAY_RE = /^\/play(\/|$)/;
const HUB_RE = /^\/hub(\/|$)/;
const AUTH_PAGE_RE = /^\/(login|register)(\/|$)/;

const ROLE_RANK: Record<Role, number> = { player: 0, gm: 1, admin: 2 };

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (pathname === "/" || AUTH_PAGE_RE.test(pathname)) {
    if (user) {
      return NextResponse.redirect(new URL("/hub", request.url));
    }
    return response;
  }

  const requiresAdmin = ADMIN_RE.test(pathname);
  const requiresGm = GM_RE.test(pathname);
  const requiresAuth =
    HUB_RE.test(pathname) ||
    PLAY_RE.test(pathname) ||
    requiresAdmin ||
    requiresGm;

  if (!requiresAuth) return response;

  if (!user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(url);
  }

  if (requiresAdmin || requiresGm) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single<{ role: Role }>();
    const rank = ROLE_RANK[profile?.role ?? "player"];
    const minRank = requiresAdmin ? ROLE_RANK.admin : ROLE_RANK.gm;
    if (rank < minRank) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register/:path*",
    "/hub/:path*",
    "/dashboard/:path*",
    "/play/:path*",
    "/admin/:path*",
  ],
};
