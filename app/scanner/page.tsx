"use client";

import { useState } from "react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { ProductCard } from "@/components/ProductCard";
import { getProductAction } from "@/actions/inventory";

export default function InventoryPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (barcode: string) => {
    setLoading(true);
    const data = await getProductAction(barcode);
    setProduct(data);
    setLoading(false);
  };

  return (
    <main className="p-6">
      <BarcodeScanner onResult={handleScan} />

      {loading && <p>Searching for product...</p>}
      {product && <ProductCard product={product} />}
    </main>
  );
}
