"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/auth-provider"

const defaultNavItems = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Browse Cooks",
    href: "/browse",
  },
  {
    title: "My Orders",
    href: "/orders",
  },
  {
    title: "Become a Cook",
    href: "/cook/register",
  },
]

const cookNavItems = [
  { title: "Dashboard", href: "/cook/dashboard" },
  { title: "MyDabba", href: "/cook/menu" },
  { title: "Orders", href: "/cook/orders" },
  { title: "Payments", href: "/cook/payments" },
  { title: "Settings", href: "/cook/settings" },
]

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const { isCook, refreshCounter } = useAuth()
  
  // Choose navigation items based on user role
  const navItems = isCook ? cookNavItems : defaultNavItems
  
  console.log('[MobileNav] Rendering with:', { isCook, refreshCounter, itemCount: navItems.length });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader>
          <SheetTitle className="text-left">FoodConnect</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 text-sm font-medium mt-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === item.href ? "text-foreground" : "text-foreground/60",
              )}
              onClick={() => setOpen(false)}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

