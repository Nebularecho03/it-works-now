// Centralized API Client for Frontend
// Handles dynamic base URL detection for development and production (cloudflared tunnel)

export class ApiClient {
  private static baseUrl: string;

  static getBaseUrl(): string {
    if (this.baseUrl) {
      return this.baseUrl;
    }

    // Use environment variable if set
    if (process.env.NEXT_PUBLIC_API_URL) {
      this.baseUrl = process.env.NEXT_PUBLIC_API_URL;
      return this.baseUrl;
    }

    // In browser, use current origin (works with cloudflared tunnel)
    if (typeof window !== 'undefined') {
      this.baseUrl = window.location.origin;
      return this.baseUrl;
    }

    // Server-side fallback
    this.baseUrl = 'http://localhost:8000';
    return this.baseUrl;
  }

  static setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  static async fetch(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.getBaseUrl()}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session auth
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      return response;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  static async get(endpoint: string): Promise<Response> {
    return this.fetch(endpoint, { method: 'GET' });
  }

  static async post(endpoint: string, data?: any): Promise<Response> {
    return this.fetch(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put(endpoint: string, data?: any): Promise<Response> {
    return this.fetch(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete(endpoint: string): Promise<Response> {
    return this.fetch(endpoint, { method: 'DELETE' });
  }

  static async upload(endpoint: string, formData: FormData): Promise<Response> {
    const url = `${this.getBaseUrl()}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      return response;
    } catch (error) {
      console.error(`API upload failed: ${url}`, error);
      throw error;
    }
  }
}

// Admin proxy function for API routes
export async function proxyAdminRequest(request: Request, endpoint: string) {
  const BACKEND_BASE = process.env.ADMIN_BACKEND_URL || "http://localhost:8000/api";
  const target = `${BACKEND_BASE}${endpoint}`;
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  // Forward the session cookie from the request
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    headers.set('Cookie', cookieHeader);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    credentials: 'include',
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(target, init);
    const responseClone = response.clone();
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error(`Proxy error for ${target}:`, error);
    return new Response(
      JSON.stringify({ error: "Failed to connect to backend", message: error instanceof Error ? error.message : "Unknown error" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Convenience functions
export const api = {
  get: (endpoint: string) => ApiClient.get(endpoint),
  post: (endpoint: string, data?: any) => ApiClient.post(endpoint, data),
  put: (endpoint: string, data?: any) => ApiClient.put(endpoint, data),
  delete: (endpoint: string) => ApiClient.delete(endpoint),
  upload: (endpoint: string, formData: FormData) => ApiClient.upload(endpoint, formData),
  getBaseUrl: () => ApiClient.getBaseUrl(),
  setBaseUrl: (url: string) => ApiClient.setBaseUrl(url),
};
