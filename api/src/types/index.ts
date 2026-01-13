export type AdminJwtPayload = {
  adminId: number;
  username: string;
};

export type CabinSort = "price_asc" | "price_desc" | "newest";

export type CabinRow = {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  city: string;
  province: string;
  price_per_night: string; // mysql2 devuelve DECIMAL como string
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  is_featured: number;
  is_active: number;
  created_at: string;
  updated_at: string;
};

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

export type BlockRow = {
  id: number;
  cabin_id: number;
  from_date: string; // YYYY-MM-DD
  to_date: string;   // YYYY-MM-DD
  reason: string | null;
  created_at: string;
};

declare global {
  namespace Express {
    interface Request {
      admin?: { id: number; username: string };
    }
  }
}
