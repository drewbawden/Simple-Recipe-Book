import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const EXTENSION_CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  avif: "image/avif",
  ico: "image/x-icon",
  bmp: "image/bmp",
};

function getContentType(filePath: string) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return EXTENSION_CONTENT_TYPES[ext] || "application/octet-stream";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  if (!slug || slug.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  const filename = slug.join("/");
  const publicPath = path.join(
    process.cwd(),
    "public",
    "recipe-pictures",
    filename,
  );

  try {
    const data = await fs.readFile(publicPath);
    const contentType = getContentType(publicPath);

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new Response("Not found", { status: 404 });
  }
}
