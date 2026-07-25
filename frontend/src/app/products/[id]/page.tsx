import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductActions from "@/components/ProductActions";
import ProductReviews from "@/components/ProductReviews";
import { fetchProduct } from "@/lib/products-api";
import { resolveImageUrl } from "@/lib/image";

function discountRate(price: number, originalPrice?: number) {
  if (!originalPrice) return null;
  return Math.round((1 - price / originalPrice) * 100);
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(Number(params.id));
  if (!product) notFound();

  const rate = discountRate(product.price, product.originalPrice);

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="mx-auto max-w-screen-lg px-4 py-8 sm:flex sm:gap-10 sm:py-12">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-100 sm:w-1/2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveImageUrl(product.imageUrl, product.id)}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          {product.badge && (
            <span
              className={`absolute left-3 top-3 rounded px-2 py-1 text-xs font-bold text-white ${
                product.badge === "NEW" || product.badge === "추천"
                  ? "bg-brand-orange"
                  : "bg-brand-red"
              }`}
            >
              {product.badge}
            </span>
          )}
        </div>

        <div className="mt-6 sm:mt-0 sm:w-1/2">
          <p className="text-xs font-semibold text-gray-400">{product.category}</p>
          <h1 className="mt-1 text-xl font-bold">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-2">
            {rate && <span className="text-lg font-bold text-brand-red">{rate}%</span>}
            <span className="text-lg font-bold">{product.price.toLocaleString()}원</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {product.originalPrice.toLocaleString()}원
              </span>
            )}
          </div>
          <ProductActions productId={product.id} />

          {!product.detailContent && !product.detailImages?.length && (
            <p className="mt-6 text-xs text-gray-400">
              상세 설명 및 사이즈 정보는 상품 등록 기능 구현 후 노출됩니다. (준비중)
            </p>
          )}
        </div>
      </section>

      {product.detailImages && product.detailImages.length > 0 && (
        <section className="mx-auto max-w-screen-lg border-t border-gray-100 px-4 py-8">
          <div className="mx-auto flex max-w-2xl flex-col">
            {product.detailImages.map((url, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url + index} src={resolveImageUrl(url, product.id)} alt={`${product.name} 상세 이미지 ${index + 1}`} className="block w-full" />
            ))}
          </div>
        </section>
      )}

      {product.detailContent && (
        <section className="mx-auto max-w-screen-lg border-t border-gray-100 px-4 py-8">
          <div
            className="rich-content mx-auto max-w-2xl"
            dangerouslySetInnerHTML={{ __html: product.detailContent }}
          />
        </section>
      )}

      <section className="mx-auto max-w-screen-lg border-t border-gray-100 px-4 py-8">
        <ProductReviews productId={product.id} />
      </section>

      <Footer />
    </main>
  );
}
