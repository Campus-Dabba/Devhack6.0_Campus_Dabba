"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, LogIn, LogOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/providers/cart-provider"
import { useToast } from "@/components/ui/use-toast"

const navItems = [
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

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { cart, getCartTotal } = useCart()
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = getCartTotal()

  // This is a mock function. In a real app, you'd check the authentication state.
  const isLoggedIn = false

  const handleLogout = () => {
    // Here you would typically clear the authentication state
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    })
    router.push("/login")
  }

  return (
    <div className="mr-4 flex items-center justify-between w-full">
      <div className="flex items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="hidden font-bold sm:inline-block">FoodConnect</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === item.href ? "text-foreground" : "text-foreground/60",
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/cart" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>{cartItemCount} items</span>
            <span>₹{cartTotal}</span>
          </Link>
        </Button>
        {isLoggedIn ? (
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        ) : (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

