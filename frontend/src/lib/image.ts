const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// 업로드된 상품 이미지는 백엔드(/uploads/...)에서, 더미 상품 이미지는 프론트 public/products에서 서빙되므로
// 절대경로로 바꿔줄 때 출처를 구분해야 함
export function resolveImageUrl(imageUrl: string | undefined, fallbackId: number) {
  if (!imageUrl) return `/products/${fallbackId}.jpg`;
  if (imageUrl.startsWith("/uploads/")) return `${API_URL}${imageUrl}`;
  return imageUrl;
}

// 대표(썸네일) 이미지는 최대 3장까지 등록할 수 있고, 카드/상세페이지 모두 같은
// 목록을 2초 간격으로 로테이션한다. imageUrls가 없는 옛 데이터는 imageUrl 1장으로 대체.
export function productImageList(p: { imageUrl?: string; imageUrls?: string[] }): string[] {
  if (p.imageUrls && p.imageUrls.length > 0) return p.imageUrls;
  return p.imageUrl ? [p.imageUrl] : [];
}
