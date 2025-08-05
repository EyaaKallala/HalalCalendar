import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/utils/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ liked: false })
    }

    const { id } = await params
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId: user.id,
        },
      },
    })

    return NextResponse.json({ liked: !!existingLike })
  } catch {
    return NextResponse.json({ error: "Failed to fetch like status" }, { status: 500 })
  }
}