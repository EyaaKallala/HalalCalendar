import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/utils/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const comments = await prisma.comment.findMany({
      where: { postId: id },
      include: {
        author: {
          select: { name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(comments)
  } catch {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}


export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const { content } = await request.json()

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: id,
        authorId: user.id,
      },
      include: {
        author: {
          select: { name: true, image: true },
        },
      },
    })

    return NextResponse.json(comment)
  } catch {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}