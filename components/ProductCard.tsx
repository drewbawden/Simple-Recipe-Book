"use client"

import { Product } from "@/types/inventory";
import { addNewProduct } from "@/actions/manageProducts";
import { CategoryDropdown } from "./dropdowns";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-4 transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <span className="text-xs uppercase tracking-widest">No Image</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            {product.brand || "Generic"}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {product.barcode}
          </span>
        </div>

        <h3 className="line-clamp-2 text-sm font-semibold text-slate-800">
          {product.name}
        </h3>

        {product.category && (
          <p className="mt-2 text-xs text-slate-500 italic">
            {product.category}
          </p>
        )}

        <CategoryDropdown />

        <button onClick={async () => addNewProduct(product)} className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800">
          Add to Inventory
        </button>
      </div>
    </div>
  );
}
