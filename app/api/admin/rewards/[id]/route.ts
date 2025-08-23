import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuthToken } from "@/lib/auth"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rewardId = params.id
    
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }
    
    const token = authHeader.replace("Bearer ", "")
    const authData = verifyAuthToken(token)
    if (!authData || authData.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    // Check if reward exists and belongs to tenant
    const existingReward = await prisma.reward.findFirst({
      where: { id: rewardId, tenantId: authData.tenantId }
    })

    if (!existingReward) {
      return NextResponse.json({ ok: false, error: "Reward not found" }, { status: 404 })
    }

    await prisma.reward.delete({
      where: { id: rewardId }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Rewards DELETE error:", error)
    return NextResponse.json({ ok: false, error: "Failed to delete reward" }, { status: 500 })
  }
}