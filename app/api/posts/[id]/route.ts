export const runtime = "nodejs";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { mkdirSync, existsSync } from "fs";
import path from "path";

export async function GET(request: NextRequest, context: any) {
  const { id } = context.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id, published: true },
      include: {
        author: { select: { name: true, image: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("GET /api/posts/:id error:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: any) {
  const { id } = context.params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role?.toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const published = formData.get("published") === "true";
    const location = formData.get("location") as string | null;

    const image = formData.get("image");
    let imageUrl: string | undefined;

    if (image instanceof File && image.size > 0) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
      const filename = `${Date.now()}-${image.name}`;
      const filePath = path.join(uploadDir, filename);
      await import("fs/promises").then((fs) => fs.writeFile(filePath, buffer));
      imageUrl = `/uploads/${filename}`;
    } else if (typeof image === "string" && image.startsWith("https://")) {
      imageUrl = image;
    }

    const data: any = { title, content, published };
    if (imageUrl !== undefined) data.image = imageUrl;

    const date = formData.get("date");
    if (typeof date === "string" && date) {
      data.date = new Date(date);
    }

    if (location) {
      data.location = location;
    }

    const tagsRaw = formData.get("tags") as string | null;
    if (tagsRaw) {
      try {
        data.tags = JSON.parse(tagsRaw);
      } catch {
        data.tags = tagsRaw
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("PUT /api/posts/:id error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const { id } = context.params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role?.toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/posts/:id error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
