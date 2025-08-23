import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuthToken } from "@/lib/auth"

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

    // Get all data for analytics
    const [users, transactions, rewards] = await Promise.all([
      prisma.user.findMany({
        where: { tenantId, role: "customer" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      }),
      prisma.transaction.findMany({
        where: { tenantId },
        select: {
          id: true,
          userId: true,
          amount: true,
          pointsEarned: true,
          pointsRedeemed: true,
          timestamp: true
        },
        orderBy: { timestamp: 'desc' }
      }),
      prisma.reward.findMany({
        where: { tenantId },
        select: {
          id: true,
          usageCount: true,
          pointsCost: true
        }
      })
    ])

    // Calculate basic metrics
    const totalCustomers = users.length
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)
    const totalPointsIssued = transactions.reduce((sum, t) => sum + t.pointsEarned, 0)
    const totalTransactions = transactions.length
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    // Calculate growth (simplified - comparing current month vs previous month)
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    
    const currentMonthTransactions = transactions.filter(t => new Date(t.timestamp) >= currentMonth)
    const previousMonthTransactions = transactions.filter(t => {
      const date = new Date(t.timestamp)
      return date >= previousMonth && date < currentMonth
    })
    
    const currentMonthRevenue = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0)
    const previousMonthRevenue = previousMonthTransactions.reduce((sum, t) => sum + t.amount, 0)
    const revenueGrowth = previousMonthRevenue > 0 ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0

    const currentMonthCustomers = users.filter(u => new Date(u.createdAt) >= currentMonth).length
    const previousMonthCustomers = users.filter(u => {
      const date = new Date(u.createdAt)
      return date >= previousMonth && date < currentMonth
    }).length
    const customerGrowth = previousMonthCustomers > 0 ? ((currentMonthCustomers - previousMonthCustomers) / previousMonthCustomers) * 100 : 0

    // Generate monthly revenue data (last 6 months)
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.timestamp)
        return date >= month && date <= monthEnd
      })
      const monthRevenue = monthTransactions.reduce((sum, t) => sum + t.amount, 0)
      monthlyRevenue.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue
      })
    }

    // Calculate customer segments based on spending
    const customerSpending = new Map<string, number>()
    transactions.forEach(t => {
      const current = customerSpending.get(t.userId) || 0
      customerSpending.set(t.userId, current + t.amount)
    })

    const segments = {
      high: 0, // > $1000
      medium: 0, // $100-$1000
      low: 0 // < $100
    }

    customerSpending.forEach(spending => {
      if (spending > 1000) segments.high++
      else if (spending > 100) segments.medium++
      else segments.low++
    })

    const customerSegments = [
      { segment: "High Value", count: segments.high, percentage: Math.round((segments.high / totalCustomers) * 100) },
      { segment: "Medium Value", count: segments.medium, percentage: Math.round((segments.medium / totalCustomers) * 100) },
      { segment: "Low Value", count: segments.low, percentage: Math.round((segments.low / totalCustomers) * 100) }
    ]

    // Get top customers
    const topCustomers = Array.from(customerSpending.entries())
      .map(([userId, totalSpent]) => {
        const user = users.find(u => u.id === userId)
        const userTransactions = transactions.filter(t => t.userId === userId)
        const points = userTransactions.reduce((sum, t) => sum + t.pointsEarned - t.pointsRedeemed, 0)
        const visitCount = userTransactions.length
        
        return {
          id: userId,
          name: user?.name || "Unknown",
          email: user?.email || "",
          totalSpent,
          points,
          visitCount
        }
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)

    // Generate AI insights
    const aiInsights = generateAIInsights({
      totalCustomers,
      totalRevenue,
      totalPointsIssued,
      customerSegments,
      monthlyRevenue,
      topCustomers,
      rewards
    })

    const analytics = {
      totalCustomers,
      totalRevenue,
      totalPointsIssued,
      totalTransactions,
      avgTransactionValue,
      customerGrowth,
      revenueGrowth,
      topCustomers,
      monthlyRevenue,
      customerSegments,
      aiInsights
    }

    return NextResponse.json({ ok: true, analytics })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ ok: false, error: "Failed to load analytics" }, { status: 500 })
  }
}

function generateAIInsights(data: any) {
  const insights = []

  // Revenue trend analysis
  if (data.monthlyRevenue.length >= 2) {
    const recent = data.monthlyRevenue.slice(-2)
    const growth = ((recent[1].revenue - recent[0].revenue) / recent[0].revenue) * 100
    
    if (growth > 10) {
      insights.push({
        type: "success" as const,
        title: "Strong Revenue Growth",
        description: `Revenue increased by ${growth.toFixed(1)}% this month compared to last month.`,
        impact: "Consider expanding successful promotions or marketing campaigns."
      })
    } else if (growth < -5) {
      insights.push({
        type: "warning" as const,
        title: "Revenue Decline Detected",
        description: `Revenue decreased by ${Math.abs(growth).toFixed(1)}% this month.`,
        impact: "Review recent changes and consider promotional activities to boost sales."
      })
    }
  }

  // Customer engagement analysis
  const avgSpending = data.totalRevenue / data.totalCustomers
  if (avgSpending > 500) {
    insights.push({
      type: "success" as const,
      title: "High Customer Value",
      description: `Average customer spending is $${avgSpending.toFixed(0)}, indicating strong customer loyalty.`,
      impact: "Focus on retention strategies and premium rewards for high-value customers."
    })
  }

  // Points utilization analysis
  const pointsUtilization = data.rewards.reduce((sum: number, r: any) => sum + r.usageCount, 0)
  if (pointsUtilization < data.totalPointsIssued * 0.1) {
    insights.push({
      type: "opportunity" as const,
      title: "Low Points Redemption",
      description: "Less than 10% of issued points have been redeemed.",
      impact: "Consider more attractive rewards or point expiration policies to increase engagement."
    })
  }

  // Customer segment analysis
  const highValuePercentage = data.customerSegments.find((s: any) => s.segment === "High Value")?.percentage || 0
  if (highValuePercentage > 20) {
    insights.push({
      type: "success" as const,
      title: "Strong High-Value Customer Base",
      description: `${highValuePercentage}% of customers are high-value spenders.`,
      impact: "Excellent customer quality. Focus on premium experiences and exclusive rewards."
    })
  }

  // Seasonal patterns (simplified)
  const currentMonth = new Date().getMonth()
  if (currentMonth === 11 || currentMonth === 0) { // December/January
    insights.push({
      type: "opportunity" as const,
      title: "Holiday Season Opportunity",
      description: "Holiday season typically sees increased spending and gift-giving.",
      impact: "Launch holiday-themed promotions and gift card incentives to maximize seasonal revenue."
    })
  }

  // Default insight if none generated
  if (insights.length === 0) {
    insights.push({
      type: "opportunity" as const,
      title: "Growth Opportunity",
      description: "Your loyalty program is performing well with room for optimization.",
      impact: "Consider A/B testing different reward structures and promotional strategies."
    })
  }

  return insights.slice(0, 5) // Limit to 5 insights
}