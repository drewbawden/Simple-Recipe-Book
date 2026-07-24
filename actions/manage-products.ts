"use server"

import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Product } from "@/types/inventory"
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});


export async function addNewProduct(productData: Product) {
  try {
    const data: Prisma.ProductsCreateInput = {
      name: productData.name,
      barcode: productData.barcode,
      brand: productData.brand,
      imageUrl: productData.imageUrl,
    };

    const newProduct = await prisma.products.create({
      data: data,
    });

    return { success: true, product: newProduct };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to create product" };
  }
}
