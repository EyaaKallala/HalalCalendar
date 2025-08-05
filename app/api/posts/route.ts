export const runtime = "nodejs";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/utils/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const searchTerm = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "newest"; // 🆕 get sort param
    const pageSize = 4;

    // 🆕 dynamic orderBy based on sort param
    let orderBy;
    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" as const };
        break;
      case "eventSoon":
        orderBy = { date: "asc" as const };
        break;
      case "eventLate":
        orderBy = { date: "desc" as const };
        break;
      default:
        orderBy = { createdAt: "desc" as const };
    }

    const baseWhere = {
      published: true,
    };

    const whereClause = searchTerm
      ? {
          ...baseWhere,
          OR: [
            {
              title: {
                contains: searchTerm,
                mode: "insensitive" as const,
              },
            },
            {
              tags: {
                hasSome: searchTerm
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0),
              },
            },
          ],
        }
      : baseWhere;

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        author: { select: { name: true, image: true } },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy, // ✅ use dynamic sort
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPosts = await prisma.post.count({
      where: whereClause,
    });

    return NextResponse.json({
      posts,
      totalPages: Math.ceil(totalPosts / pageSize),
    });
  } catch (err) {
    console.error("GET /api/posts error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role?.toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await request.formData();

    const title = formData.get("title");
    const content = formData.get("content");
    const published = formData.get("published") === "true";
    const image = formData.get("image");
    const dateString = formData.get("date");
    const location = formData.get("location");
    const tagsString = formData.get("tags"); 
    const date = dateString ? new Date(dateString as string) : undefined;

    if (typeof title !== "string" || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    let tags: string[] = [];
    if (typeof tagsString === "string" && tagsString.trim() !== "") {
      tags = tagsString.split(",").map(t => t.trim()).filter(t => t.length > 0);
    }
    const slug = slugify(title, { lower: true, strict: true });

    const newPost = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        published,
        ...(typeof image === "string" && { image }),
        ...(date && { date }),
        ...(typeof location === "string" && location.trim() !== "" && { location }),
        tags, 
        author: { connect: { email: session.user.email! } },
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
