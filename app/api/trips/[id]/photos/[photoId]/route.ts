import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string; photoId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { photoId } = await params;

  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    select: { data: true, mimeType: true, fileName: true },
  });

  if (!photo) return NextResponse.json({ error: "Bildet finnes ikke." }, { status: 404 });

  return new NextResponse(photo.data, {
    headers: {
      "Content-Type": photo.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
      ...(photo.fileName
        ? { "Content-Disposition": `inline; filename="${photo.fileName}"` }
        : {}),
    },
  });
}
