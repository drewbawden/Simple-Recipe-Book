"use server";
import { Product } from "@/types/inventory";

export async function getProductAction(
  barcode: string,
): Promise<Product | null> {
  const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API call failed with status ${response.status}`);
    }

    const rawData = await response.json();

    const newProduct: Product = {
      barcode: rawData.code,
      name: rawData.product?.product_name || "Unknown product",
      brand: rawData.product?.brands || "Unknown brand",
      imageUrl: rawData.product?.image_url || "",
      category: "",
    };

    return newProduct;
  } catch (error) {
    console.error("External API Error:", error);
    return null;
  }
}
