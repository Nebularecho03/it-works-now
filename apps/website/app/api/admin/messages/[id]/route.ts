import { proxyAdminRequest } from "@/components/api/client";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return proxyAdminRequest(request, `/api/messages/${params.id}`);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return proxyAdminRequest(request, `/api/messages/${params.id}`);
}
