import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        createdAt: true,
        tenant: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      ok: true,
      count: users.length,
      users
    })
  } catch (error) {
    console.error("Debug users error:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch users" }, { status: 500 })
  }
}