import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuthToken } from "@/lib/auth"
import { z } from "zod"

const programRulesSchema = z.object({
  pointsPerDollar: z.number().min(0),
  birthdayBonus: z.number().min(0),
  checkInBonusPoints: z.number().min(0),
  checkInRadiusMeters: z.number().min(0),
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

    const program = await prisma.program.findFirst({
      where: { tenantId }
    })

    if (!program) {
      // Create default program if it doesn't exist
      const defaultProgram = await prisma.program.create({
        data: {
          tenantId,
          name: "Default Loyalty Program",
          pointsPerDollar: 2,
          birthdayBonus: 250,
          checkInBonusPoints: 50,
          checkInRadiusMeters: 150
        }
      })
      return NextResponse.json({ ok: true, rules: defaultProgram })
    }

    return NextResponse.json({ ok: true, rules: program })
  } catch (error) {
    console.error("Program rules GET error:", error)
    return NextResponse.json({ ok: false, error: "Failed to load program rules" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const parsed = programRulesSchema.safeParse(body)
    
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

    const program = await prisma.program.upsert({
      where: { tenantId: parsed.data.tenantId },
      update: {
        pointsPerDollar: parsed.data.pointsPerDollar,
        birthdayBonus: parsed.data.birthdayBonus,
        checkInBonusPoints: parsed.data.checkInBonusPoints,
        checkInRadiusMeters: parsed.data.checkInRadiusMeters
      },
      create: {
        tenantId: parsed.data.tenantId,
        name: "Loyalty Program",
        pointsPerDollar: parsed.data.pointsPerDollar,
        birthdayBonus: parsed.data.birthdayBonus,
        checkInBonusPoints: parsed.data.checkInBonusPoints,
        checkInRadiusMeters: parsed.data.checkInRadiusMeters
      }
    })

    return NextResponse.json({ ok: true, rules: program })
  } catch (error) {
    console.error("Program rules PUT error:", error)
    return NextResponse.json({ ok: false, error: "Failed to update program rules" }, { status: 500 })
  }
}