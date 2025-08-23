import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { signAuthToken } from "@/lib/auth"

const signupSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    name: z.string().min(1),
    tenantSlug: z.string().min(1).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    const { email, password, name } = parsed.data
    const tenantSlug = parsed.data.tenantSlug || "coffee-shop-1"

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 409 })
    }

    // Find or create tenant
    let tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    })
    
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: { slug: tenantSlug, name: tenantSlug },
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, name, role: "customer", passwordHash, tenantId: tenant.id },
    })

    const token = signAuthToken({ userId: user.id, email: user.email, role: "customer", tenantId: user.tenantId })
    return NextResponse.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role, tenantId: user.tenantId, picture: user.picture } })
  } catch (e) {
    console.error("Signup API error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}


