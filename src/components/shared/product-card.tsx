import React from "react";
import Image from "next/image";
import { Share2, ArrowRightLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Product {
  id: string;
  name: string;
  categoryDesc: string;
  price: string;
  originalPrice?: string;
  badge?: {
    text: string;
    type: "discount" | "new";
  };
  imageSrc: string;
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div
      data-node-id="117:422"
      data-figma-name="Product Card"
      className="group relative bg-surface-muted rounded-none overflow-hidden flex flex-col transition-all duration-300"
    >
      {/* Product Image & Badge */}
      <div data-node-id="117:423" className="relative w-full h-72 overflow-hidden">
        <Image
          src={product.imageSrc}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {product.badge ? (
          <span
            className={`absolute top-4 right-4 h-12 w-12 rounded-full flex items-center justify-center text-xs font-semibold text-content-inverse ${
              product.badge.type === "discount" ? "bg-badge-discount" : "bg-badge-new"
            }`}
          >
            {product.badge.text}
          </span>
        ) : null}

        {/* Hover Overlay Actions */}
        <div className="absolute inset-0 bg-surface-dark/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 gap-4">
          <Button variant="secondary" size="md" className="bg-surface text-primary hover:bg-surface-subtle w-48">
            Add to cart
          </Button>

          <div className="flex items-center gap-4 text-content-inverse text-sm font-semibold">
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <ArrowRightLeft className="h-4 w-4" /> Compare
            </button>
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <Heart className="h-4 w-4" /> Like
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 min-w-0">
        <h3 className="text-xl font-bold text-content-primary mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-content-secondary mb-3">{product.categoryDesc}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-content-primary">{product.price}</span>
          {product.originalPrice ? (
            <span className="text-sm line-through text-content-muted">{product.originalPrice}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
