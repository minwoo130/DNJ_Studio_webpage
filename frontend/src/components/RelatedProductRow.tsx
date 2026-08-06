"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/data/products";
import { resolveImageUrl } from "@/lib/image";

type PickedItem = {
  name: string;
  price: number;
  color?: string;
  size?: string;
};

export default function RelatedProductRow({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (item: PickedItem) => void;
}) {
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");

  const needsColor = (product.colors?.length ?? 0) > 0;
  const needsSize = (product.sizes?.length ?? 0) > 0;

  // 실제 장바구니에는 담지 않고, 상품 페이지 내 "담은 상품" 미리보기 목록에만 반영한다.
  function tryAdd(nextColor: string, nextSize: string) {
    if (needsColor && !nextColor) return;
    if (needsSize && !nextSize) return;

    onAdd({
      name: product.name,
      price: product.price,
      color: needsColor ? nextColor : undefined,
      size: needsSize ? nextSize : undefined,
    });
    setColor("");
    setSize("");
  }

  return (
    <div className="flex gap-3 py-3">
      <Link href={`/products/${product.id}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={resolveImageUrl(product.imageUrl, product.id)} alt={product.name} className="h-full w-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/products/${product.id}`} className="block truncate text-sm font-medium">
          {product.name}
        </Link>
        <p className="mt-1 text-sm font-bold">{product.price.toLocaleString()}원</p>

        {needsColor && (
          <div className="mt-2">
            <p className="mb-1 text-xs text-gray-500">색상</p>
            <select
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                tryAdd(e.target.value, size);
              }}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-600"
            >
              <option value="">옵션을 선택해 주세요</option>
              {product.colors!.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}

        {needsSize && (
          <div className="mt-2">
            <p className="mb-1 text-xs text-gray-500">사이즈</p>
            <select
              value={size}
              onChange={(e) => {
                setSize(e.target.value);
                tryAdd(color, e.target.value);
              }}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-600"
            >
              <option value="">옵션을 선택해 주세요</option>
              {product.sizes!.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
