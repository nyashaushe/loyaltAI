"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  Users, 
  Gift, 
  Settings, 
  Home,
  LogOut
} from "lucide-react"
import { useAuth } from "./auth-provider"

export function AdminNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuth()

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: Home,
      current: pathname === "/admin"
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      current: pathname === "/admin/analytics"
    },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: Users,
      current: pathname === "/admin/customers"
    },
    {
      name: "Rewards",
      href: "/admin/rewards",
      icon: Gift,
      current: pathname === "/admin/rewards"
    }
  ]

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LoyaltyAI Admin
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.name}
                    variant={item.current ? "default" : "ghost"}
                    onClick={() => router.push(item.href)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      item.current
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.name}
                variant={item.current ? "default" : "ghost"}
                onClick={() => router.push(item.href)}
                className={`w-full justify-start ${
                  item.current
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.name}
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}