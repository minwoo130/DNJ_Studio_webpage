export type ProductCategory = "OUTER" | "TOP" | "BOTTOM" | "ACC";
export type ProductBadge = "NEW" | "SALE" | "1+1" | "추천";

export type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  badge?: ProductBadge;
  sold?: string;
  category: ProductCategory;
  tags: string[];
  imageUrl?: string;
  imageUrls?: string[];
  detailContent?: string;
  detailImages?: string[];
  isWeeklyBest?: boolean;
  isNewArrival?: boolean;
  bestOrder?: number;
  newOrder?: number;
  colors?: string[];
  sizes?: string[];
  summary?: string;
  heroSlot?: "new_arrival" | "best_item";
  relatedProductIds?: number[];
  relatedProducts?: Product[];
};

// Static nav taxonomy — which subcategory tags show in the header dropdown per
// top-level category. Intentionally separate from the DB-backed product catalog
// (backend/database/init.sql + /api/products) so the menu structure doesn't need
// a live query; update this list if new subcategory tags are introduced in the DB.
const CATEGORY_TAGS: Record<ProductCategory, string[]> = {
  OUTER: ["자켓", "가디건", "집업", "셋업"],
  TOP: ["반팔", "가디건", "셔츠", "니트"],
  BOTTOM: ["데님", "슬랙스", "트레이닝", "반바지"],
  ACC: [],
};

export function getCategorySubTags(category: ProductCategory): string[] {
  return CATEGORY_TAGS[category] ?? [];
}
