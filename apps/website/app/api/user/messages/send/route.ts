import { proxyAdminRequest } from "@/components/api/client";

export async function POST(request: Request) {
  return proxyAdminRequest(request, "/api/user/messages/send");
}
