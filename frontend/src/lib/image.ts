const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// 업로드된 상품 이미지는 백엔드(/uploads/...)에서, 더미 상품 이미지는 프론트 public/products에서 서빙되므로
// 절대경로로 바꿔줄 때 출처를 구분해야 함
export function resolveImageUrl(imageUrl: string | undefined, fallbackId: number) {
  if (!imageUrl) return `/products/${fallbackId}.jpg`;
  if (imageUrl.startsWith("/uploads/")) return `${API_URL}${imageUrl}`;
  return imageUrl;
}
