export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/settings/:path*", "/api/v1/keys/:path*"],
};
