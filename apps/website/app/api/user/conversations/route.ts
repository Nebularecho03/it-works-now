import { proxyAdminRequest } from "@/components/api/client";

export async function GET(request: Request) {
  return proxyAdminRequest(request, "/api/user/conversations");
}
