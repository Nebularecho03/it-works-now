import { proxyAdminRequest } from "@/components/api/client";

export async function GET(request: Request) {
  return proxyAdminRequest(request, "/api/about");
}

export async function POST(request: Request) {
  return proxyAdminRequest(request, "/api/about");
}

export async function PUT(request: Request) {
  return proxyAdminRequest(request, "/api/about");
}

export async function DELETE(request: Request) {
  return proxyAdminRequest(request, "/api/about");
}
