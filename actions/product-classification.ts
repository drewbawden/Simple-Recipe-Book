"use server";

export async function categoriseProduct(productName: string) {
  const response = await fetch("http://127.0.0.1:8000/classify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_name: productName,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to classify product");
  }

  return response.json();
}
