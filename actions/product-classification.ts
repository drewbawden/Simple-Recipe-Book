"use server";

export async function zslCategorise(productName: string) {
  const zslApiUrl = process.env.ZSL_API_URL ?? "http://127.0.0.1:8000";
  const response = await fetch(`${zslApiUrl}/classify`, {
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
