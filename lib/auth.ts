import jwt from "jsonwebtoken"

export interface AuthTokenPayload {
  userId: string
  email: string
  role: "admin" | "customer" | "management"
  tenantId: string
}

const getSecret = () => {
  const secret = process.env.AUTH_SECRET || (process.env.NODE_ENV !== "production" ? "dev-secret-change-me" : undefined)
  if (!secret) throw new Error("AUTH_SECRET is not set")
  return secret
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" })
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, getSecret()) as AuthTokenPayload
  } catch {
    return null
  }
}

export function getAuthFromRequest(request: Request): AuthTokenPayload | null {
  const header = request.headers.get("authorization") || request.headers.get("Authorization")
  if (!header) return null
  const parts = header.split(" ")
  if (parts.length !== 2 || parts[0] !== "Bearer") return null
  return verifyAuthToken(parts[1])
}


