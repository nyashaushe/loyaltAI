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
    console.log("Signup request body:", { ...body, password: "[REDACTED]" })
    
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      console.log("Validation failed:", parsed.error)
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    const { email, password, name } = parsed.data
    const tenantSlug = parsed.data.tenantSlug || "coffee-shop-1"
    
    console.log("Processing signup for:", { email, name, tenantSlug })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      console.log("Email already exists:", email)
      return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 409 })
    }
    
    console.log("Email is available, proceeding with signup")

    // Find or create tenant
    let tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    })
    
    if (!tenant) {
      console.log("Creating new tenant:", tenantSlug)
      tenant = await prisma.tenant.create({
        data: { slug: tenantSlug, name: tenantSlug },
      })
    } else {
      console.log("Using existing tenant:", tenant.slug)
    }

    const passwordHash = await bcrypt.hash(password, 10)
    console.log("Password hashed, creating user...")
    
    const user = await prisma.user.create({
      data: { email, name, role: "customer", passwordHash, tenantId: tenant.id },
    })
    
    console.log("User created successfully:", { id: user.id, email: user.email, name: user.name })

    const token = signAuthToken({ userId: user.id, email: user.email, role: "customer", tenantId: user.tenantId })
    console.log("Auth token generated, returning success response")
    
    return NextResponse.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role, tenantId: user.tenantId, picture: user.picture } })
  } catch (e) {
    console.error("Signup API error:", e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}


