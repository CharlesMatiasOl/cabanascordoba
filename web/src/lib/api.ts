export type CabinSort = "price_asc" | "price_desc" | "newest";

export type CabinSummary = {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  city: string;
  province: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  is_featured: boolean;
  is_active?: boolean;
  cover_image?: string | null;
};

export type CabinDetail = CabinSummary & {
  description: string;
  images: { id: number; url: string; alt: string | null; sort_order: number }[];
};

export type Block = {
  id: number;
  cabin_id: number;
  from_date: string;
  to_date: string;
  reason: string | null;
  created_at: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

async function request<T>(
  path: string,
  init?: RequestInit & { json?: any; auth?: boolean }
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    ...(init?.headers as any)
  };

  let body: BodyInit | undefined = init?.body as any;

  if (init?.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  }

  const auth = init?.auth === true;

  const res = await fetch(url, {
    ...init,
    body,
    headers,
    credentials: auth ? "include" : "omit",
    cache: "no-store"
  });

  const text = await res.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      data?.error ||
      `Error HTTP ${res.status} al llamar ${path}`;
    throw new Error(msg);
  }

  return data as T;
}

/* =========================
   Public
========================= */

export async function apiListCabins(params: {
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  sort?: CabinSort;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
}): Promise<{ data: CabinSummary[]; page: number; limit: number; total: number }> {
  const q = new URLSearchParams();

  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.sort) q.set("sort", params.sort);
  if (params.guests) q.set("guests", String(params.guests));
  if (typeof params.minPrice === "number") q.set("minPrice", String(params.minPrice));
  if (typeof params.maxPrice === "number") q.set("maxPrice", String(params.maxPrice));

  const qs = q.toString();
  return request(`/api/cabins${qs ? `?${qs}` : ""}`);
}

export async function apiGetCabin(id: number): Promise<CabinDetail> {
  return request(`/api/cabins/${id}`);
}

/* =========================
   Admin Auth
========================= */

export async function adminLogin(username: string, password: string): Promise<{ ok: true; admin: { id: number; username: string } }> {
  return request(`/api/admin/login`, {
    method: "POST",
    auth: true,
    json: { username, password }
  });
}

export async function adminLogout(): Promise<{ ok: true }> {
  return request(`/api/admin/logout`, { method: "POST", auth: true });
}

export async function adminMe(): Promise<{ ok: true; admin: { id: number; username: string } }> {
  return request(`/api/admin/me`, { method: "GET", auth: true });
}

/* =========================
   Admin Cabins
========================= */

export async function adminListCabins(params?: { page?: number; limit?: number }): Promise<{ data: CabinSummary[]; page: number; limit: number; total: number }> {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  const qs = q.toString();
  return request(`/api/admin/cabins${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
}

export async function adminCreateCabin(payload: {
  title: string;
  slug?: string;
  short_description: string;
  description: string;
  city?: string;
  province?: string;
  price_per_night: number;
  max_guests: number;
  bedrooms?: number;
  bathrooms?: number;
  is_featured?: boolean;
  is_active?: boolean;
  images?: { url: string; alt?: string }[];
}): Promise<{ ok: true; id: number }> {
  return request(`/api/admin/cabins`, { method: "POST", auth: true, json: payload });
}

export async function adminUpdateCabin(id: number, payload: {
  title: string;
  slug?: string;
  short_description: string;
  description: string;
  city?: string;
  province?: string;
  price_per_night: number;
  max_guests: number;
  bedrooms?: number;
  bathrooms?: number;
  is_featured?: boolean;
  images?: { url: string; alt?: string }[];
}): Promise<{ ok: true }> {
  return request(`/api/admin/cabins/${id}`, { method: "PUT", auth: true, json: payload });
}

export async function adminSetCabinActive(id: number, active?: boolean): Promise<{ ok: true; is_active: boolean }> {
  const body = typeof active === "boolean" ? { active } : {};
  return request(`/api/admin/cabins/${id}/active`, { method: "PATCH", auth: true, json: body });
}

/* =========================
   Admin Blocks
========================= */

export async function adminListBlocks(cabinId: number): Promise<{ data: Block[] }> {
  return request(`/api/admin/cabins/${cabinId}/blocks`, { method: "GET", auth: true });
}

export async function adminCreateBlock(cabinId: number, payload: { from_date: string; to_date: string; reason?: string | null }): Promise<{ ok: true; id: number }> {
  return request(`/api/admin/cabins/${cabinId}/blocks`, { method: "POST", auth: true, json: payload });
}

export async function adminDeleteBlock(blockId: number): Promise<{ ok: true }> {
  return request(`/api/admin/blocks/${blockId}`, { method: "DELETE", auth: true });
}
