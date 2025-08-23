"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { AdminNavigation } from "@/components/admin-navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Gift, 
  Settings, 
  Save,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface Reward {
  id: string
  name: string
  description: string
  pointsCost: number
  category: string
  isActive: boolean
  usageLimit?: number
  usageCount: number
  expiryDate?: string
}

interface ProgramRules {
  pointsPerDollar: number
  birthdayBonus: number
  checkInBonusPoints: number
  checkInRadiusMeters: number
}

export default function AdminRewardsPage() {
  const { user } = useAuth()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [programRules, setProgramRules] = useState<ProgramRules>({
    pointsPerDollar: 2,
    birthdayBonus: 250,
    checkInBonusPoints: 50,
    checkInRadiusMeters: 150
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [newReward, setNewReward] = useState<Partial<Reward>>({
    name: "",
    description: "",
    pointsCost: 0,
    category: "",
    isActive: true
  })
  const [showNewRewardForm, setShowNewRewardForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [user?.tenantId])

  const loadData = async () => {
    try {
      const token = localStorage.getItem("loyalty-token")
      const [rewardsRes, rulesRes] = await Promise.all([
        fetch(`/api/admin/rewards?tenantId=${user?.tenantId || ""}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        fetch(`/api/admin/program-rules?tenantId=${user?.tenantId || ""}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ])
      
      const rewardsData = await rewardsRes.json()
      const rulesData = await rulesRes.json()
      
      if (rewardsData.ok) {
        setRewards(rewardsData.rewards)
      }
      
      if (rulesData.ok) {
        setProgramRules(rulesData.rules)
      }
    } catch (err) {
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const saveReward = async (reward: Partial<Reward>) => {
    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch("/api/admin/rewards", {
        method: reward.id ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...reward,
          tenantId: user?.tenantId
        })
      })
      
      const data = await res.json()
      if (data.ok) {
        await loadData()
        setEditingReward(null)
        setNewReward({ name: "", description: "", pointsCost: 0, category: "", isActive: true })
        setShowNewRewardForm(false)
      } else {
        setError(data.error || "Failed to save reward")
      }
    } catch (err) {
      setError("Failed to save reward")
    }
  }

  const deleteReward = async (rewardId: string) => {
    if (!confirm("Are you sure you want to delete this reward?")) return
    
    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch(`/api/admin/rewards/${rewardId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const data = await res.json()
      if (data.ok) {
        await loadData()
      } else {
        setError(data.error || "Failed to delete reward")
      }
    } catch (err) {
      setError("Failed to delete reward")
    }
  }

  const saveProgramRules = async () => {
    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch("/api/admin/program-rules", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...programRules,
          tenantId: user?.tenantId
        })
      })
      
      const data = await res.json()
      if (data.ok) {
        // Show success feedback
      } else {
        setError(data.error || "Failed to save rules")
      }
    } catch (err) {
      setError("Failed to save rules")
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4 animate-spin" />
          <span>Loading rewards...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AdminNavigation />
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rewards Management</h1>
          <p className="text-muted-foreground">Configure loyalty rewards and program rules</p>
        </div>
        <Button onClick={() => setShowNewRewardForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reward
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Program Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Program Rules
          </CardTitle>
          <CardDescription>Configure how points are earned and redeemed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pointsPerDollar">Points per Dollar</Label>
              <Input
                id="pointsPerDollar"
                type="number"
                value={programRules.pointsPerDollar}
                onChange={(e) => setProgramRules(prev => ({ ...prev, pointsPerDollar: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthdayBonus">Birthday Bonus</Label>
              <Input
                id="birthdayBonus"
                type="number"
                value={programRules.birthdayBonus}
                onChange={(e) => setProgramRules(prev => ({ ...prev, birthdayBonus: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkInBonus">Check-in Bonus</Label>
              <Input
                id="checkInBonus"
                type="number"
                value={programRules.checkInBonusPoints}
                onChange={(e) => setProgramRules(prev => ({ ...prev, checkInBonusPoints: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkInRadius">Check-in Radius (m)</Label>
              <Input
                id="checkInRadius"
                type="number"
                value={programRules.checkInRadiusMeters}
                onChange={(e) => setProgramRules(prev => ({ ...prev, checkInRadiusMeters: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={saveProgramRules}>
              <Save className="h-4 w-4 mr-2" />
              Save Rules
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New Reward Form */}
      {showNewRewardForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Reward</CardTitle>
            <CardDescription>Create a new reward for your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newName">Reward Name</Label>
                <Input
                  id="newName"
                  value={newReward.name}
                  onChange={(e) => setNewReward(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Free Coffee"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newCategory">Category</Label>
                <Input
                  id="newCategory"
                  value={newReward.category}
                  onChange={(e) => setNewReward(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Beverages"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPointsCost">Points Cost</Label>
                <Input
                  id="newPointsCost"
                  type="number"
                  value={newReward.pointsCost}
                  onChange={(e) => setNewReward(prev => ({ ...prev, pointsCost: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newUsageLimit">Usage Limit (optional)</Label>
                <Input
                  id="newUsageLimit"
                  type="number"
                  value={newReward.usageLimit || ""}
                  onChange={(e) => setNewReward(prev => ({ ...prev, usageLimit: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="Unlimited"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="newDescription">Description</Label>
                <Textarea
                  id="newDescription"
                  value={newReward.description}
                  onChange={(e) => setNewReward(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the reward..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => saveReward(newReward)}>
                <Save className="h-4 w-4 mr-2" />
                Save Reward
              </Button>
              <Button variant="outline" onClick={() => setShowNewRewardForm(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            Available Rewards
          </CardTitle>
          <CardDescription>Manage your loyalty rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium">{reward.name}</h3>
                    <Badge variant={reward.isActive ? "default" : "secondary"}>
                      {reward.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{reward.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{reward.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="font-medium">{reward.pointsCost} points</span>
                    <span className="text-muted-foreground">
                      {reward.usageCount} used
                      {reward.usageLimit && ` / ${reward.usageLimit}`}
                    </span>
                    {reward.expiryDate && (
                      <span className="text-muted-foreground">
                        Expires: {new Date(reward.expiryDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingReward(reward)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteReward(reward.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {rewards.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No rewards configured yet.</p>
                <p className="text-sm">Create your first reward to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Reward Modal */}
      {editingReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Edit Reward</CardTitle>
              <CardDescription>Update reward details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Reward Name</Label>
                  <Input
                    id="editName"
                    value={editingReward.name}
                    onChange={(e) => setEditingReward(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCategory">Category</Label>
                  <Input
                    id="editCategory"
                    value={editingReward.category}
                    onChange={(e) => setEditingReward(prev => prev ? { ...prev, category: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPointsCost">Points Cost</Label>
                  <Input
                    id="editPointsCost"
                    type="number"
                    value={editingReward.pointsCost}
                    onChange={(e) => setEditingReward(prev => prev ? { ...prev, pointsCost: Number(e.target.value) } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editUsageLimit">Usage Limit</Label>
                  <Input
                    id="editUsageLimit"
                    type="number"
                    value={editingReward.usageLimit || ""}
                    onChange={(e) => setEditingReward(prev => prev ? { ...prev, usageLimit: e.target.value ? Number(e.target.value) : undefined } : null)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    value={editingReward.description}
                    onChange={(e) => setEditingReward(prev => prev ? { ...prev, description: e.target.value } : null)}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => editingReward && saveReward(editingReward)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingReward(null)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </div>
  )
}