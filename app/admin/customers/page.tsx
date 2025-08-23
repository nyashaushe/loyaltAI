"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { AdminNavigation } from "@/components/admin-navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserRow { id: string; email: string; name: string; role: string; tenantId: string }

export default function AdminCustomersPage() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [txnFor, setTxnFor] = useState<{ userId: string; amount: string; location: string; method: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("loyalty-token")
        const res = await fetch(`/api/users?tenantId=${user?.tenantId || ""}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (data.ok) setCustomers(data.users)
      } catch {
        setError("Failed to load customers")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.tenantId])

  const submitTxn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txnFor || !user) return
    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: txnFor.userId,
          tenantId: user.tenantId,
          amount: Number(txnFor.amount),
          location: txnFor.location || "Online",
          paymentMethod: txnFor.method || "Other",
        }),
      })
      const data = await res.json()
      if (!data.ok) setError(data.error || "Failed to add transaction")
      else setTxnFor(null)
    } catch {
      setError("Server error")
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return (
    <div className="p-6">
      <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
    </div>
  )

  return (
    <div>
      <AdminNavigation />
      <div className="p-6 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>Tenant customers and quick actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {customers.map((c) => (
            <div key={c.id} className="flex items-center justify-between border rounded p-3">
              <div className="text-sm">
                <div className="font-medium">{c.name || c.email}</div>
                <div className="text-muted-foreground">{c.email}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setTxnFor({ userId: c.id, amount: "", location: "", method: "" })}>Add Transaction</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {txnFor && (
        <Card>
          <CardHeader>
            <CardTitle>New Transaction</CardTitle>
            <CardDescription>Award points automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitTxn} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" step="0.01" value={txnFor.amount} onChange={(e) => setTxnFor({ ...txnFor, amount: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={txnFor.location} onChange={(e) => setTxnFor({ ...txnFor, location: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="method">Payment Method</Label>
                <Input id="method" value={txnFor.method} onChange={(e) => setTxnFor({ ...txnFor, method: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => setTxnFor(null)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
    </div>
  )
}


