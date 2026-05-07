import { proxyAdminRequest } from "@/components/api/client";

export async function GET(request: Request) {
  return proxyAdminRequest(request, "/api/messages");
}

export async function POST(request: Request) {
  return proxyAdminRequest(request, "/api/messages");
}

export async function DELETE(request: Request) {
  return proxyAdminRequest(request, "/api/messages");
}
