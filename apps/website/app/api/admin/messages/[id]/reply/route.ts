import { proxyAdminRequest } from "@/components/api/client";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyAdminRequest(request, `/api/messages/${id}/reply`);
}
