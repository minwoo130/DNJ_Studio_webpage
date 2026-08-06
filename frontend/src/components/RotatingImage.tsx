"use client";

import { useEffect, useState } from "react";
import { resolveImageUrl } from "@/lib/image";

const ROTATE_INTERVAL_MS = 2000;

export default function RotatingImage({
  images,
  fallbackId,
  alt,
  className,
}: {
  images: string[];
  fallbackId: number;
  alt: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={resolveImageUrl(images[index], fallbackId)} alt={alt} className={className} />
  );
}
