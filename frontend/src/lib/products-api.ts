import type { Product, ProductCategory } from "@/data/products";

// Server Components run inside the frontend container, so they must reach the
// backend over the Docker network (service name), not the host-mapped port.
const API_BASE = process.env.API_INTERNAL_URL ?? "http://backend:4000";

export async function fetchProducts(params?: {
  category?: ProductCategory;
  tag?: string;
  section?: "best" | "new";
  limit?: number;
  heroSlot?: "new_arrival" | "best_item";
}): Promise<Product[]> {
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.tag) search.set("tag", params.tag);
  if (params?.section) search.set("section", params.section);
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.heroSlot) search.set("heroSlot", params.heroSlot);
  const query = search.toString();

  try {
    const res = await fetch(`${API_BASE}/api/products${query ? `?${query}` : ""}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchProduct(id: number): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/api/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
