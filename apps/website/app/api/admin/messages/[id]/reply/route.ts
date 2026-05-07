import { proxyAdminRequest } from "@/components/api/client";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return proxyAdminRequest(request, `/api/messages/${params.id}/reply`);
}
