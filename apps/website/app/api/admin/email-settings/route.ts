import { proxyAdminRequest } from "@/components/api/client";

export async function GET(request: Request) {
  return proxyAdminRequest(request, "/api/admin/email-settings");
}

export async function PUT(request: Request) {
  return proxyAdminRequest(request, "/api/admin/email-settings");
}

export async function POST(request: Request) {
  return proxyAdminRequest(request, "/api/admin/email-settings/test");
}
