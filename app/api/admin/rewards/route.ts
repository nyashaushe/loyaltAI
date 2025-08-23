import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuthToken } from "@/lib/auth"
import { z } from "zod"

const rewardSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  pointsCost: z.number().min(1),
  category: z.string().min(1),
  isActive: z.boolean().default(true),
  usageLimit: z.number().optional(),
  expiryDate: z.string().optional(),
  tenantId: z.string().min(1)
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId")
    
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }
    
    const token = authHeader.replace("Bearer ", "")
    const authData = verifyAuthToken(token)
    if (!authData || authData.role !== "admin" || authData.tenantId !== tenantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const rewards = await prisma.reward.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ ok: true, rewards })
  } catch (error) {
    console.error("Rewards GET error:", error)
    return NextResponse.json({ ok: false, error: "Failed to load rewards" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = rewardSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }
    
    const token = authHeader.replace("Bearer ", "")
    const authData = verifyAuthToken(token)
    if (!authData || authData.role !== "admin" || authData.tenantId !== parsed.data.tenantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const reward = await prisma.reward.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        pointsCost: parsed.data.pointsCost,
        category: parsed.data.category,
        isActive: parsed.data.isActive,
        usageLimit: parsed.data.usageLimit,
        expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
        tenantId: parsed.data.tenantId,
        usageCount: 0
      }
    })

    return NextResponse.json({ ok: true, reward })
  } catch (error) {
    console.error("Rewards POST error:", error)
    return NextResponse.json({ ok: false, error: "Failed to create reward" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const updateSchema = rewardSchema.extend({ id: z.string().min(1) })
    const parsed = updateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }
    
    const token = authHeader.replace("Bearer ", "")
    const authData = verifyAuthToken(token)
    if (!authData || authData.role !== "admin" || authData.tenantId !== parsed.data.tenantId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    // Check if reward exists and belongs to tenant
    const existingReward = await prisma.reward.findFirst({
      where: { id: parsed.data.id, tenantId: parsed.data.tenantId }
    })

    if (!existingReward) {
      return NextResponse.json({ ok: false, error: "Reward not found" }, { status: 404 })
    }

    const reward = await prisma.reward.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        pointsCost: parsed.data.pointsCost,
        category: parsed.data.category,
        isActive: parsed.data.isActive,
        usageLimit: parsed.data.usageLimit,
        expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null
      }
    })

    return NextResponse.json({ ok: true, reward })
  } catch (error) {
    console.error("Rewards PUT error:", error)
    return NextResponse.json({ ok: false, error: "Failed to update reward" }, { status: 500 })
  }
}