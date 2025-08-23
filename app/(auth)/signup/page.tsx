"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignupPage() {
	const router = useRouter()
	const { login, isLoading } = useAuth()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [name, setName] = useState("")
	const [error, setError] = useState("")
	const [submitting, setSubmitting] = useState(false)
	const [confirmPassword, setConfirmPassword] = useState("")

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")
		setSubmitting(true)
		try {
			// Basic validation
			if (!email || !password || !name || !confirmPassword) {
				setError("All fields are required")
				setSubmitting(false)
				return
			}
			
			if (password.length < 6) {
				setError("Password must be at least 6 characters long")
				setSubmitting(false)
				return
			}
			
			if (password !== confirmPassword) {
				setError("Passwords do not match")
				setSubmitting(false)
				return
			}
			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password, confirmPassword, name }),
			})
			const data = await res.json()
			if (!data.ok) {
				setError(data.error || "Failed to sign up")
			} else {
				// Auto-login
				const ok = await login(email, password)
				if (ok) {
					router.push("/dashboard")
				} else {
					setError("Account created but login failed. Please try logging in manually.")
				}
			}
		} catch (error) {
			console.error("Signup error:", error)
			setError("Server error")
		} finally {
			setSubmitting(false)
		}
	}

	const busy = submitting || isLoading

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Create an account</CardTitle>
					<CardDescription>Join the loyalty program</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={busy} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={busy} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={busy} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={busy} />
						</div>
						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}
						<Button type="submit" className="w-full" disabled={busy}>Sign up</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}


