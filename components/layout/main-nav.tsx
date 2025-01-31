<<<<<<< HEAD
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, LogIn, LogOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/providers/cart-provider"
import { useToast } from "@/components/ui/use-toast"
=======
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/ui/use-toast";
import InputSearch from "@/components/ui/search-bar";
import { UserNav } from "@/components/layout/user-nav";
import { createClient } from "@/utils/supabase/client";
import { Session } from "@supabase/supabase-js";
>>>>>>> a6396a4 (Version lOLZ)

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
<<<<<<< HEAD
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
=======
];

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { cart, getCartTotal } = useCart();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = getCartTotal();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Add state for login status
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClient();
  // This is a mock function. In a real app, you'd check the authentication state.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    router.push("/login");
  };
>>>>>>> a6396a4 (Version lOLZ)

  return (
    <div className="mr-4 flex items-center justify-between w-full">
      <div className="flex items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
<<<<<<< HEAD
          <span className="hidden font-bold sm:inline-block">FoodConnect</span>
=======
          <span className="hidden font-bold sm:inline-block">Campus Dabba</span>
>>>>>>> a6396a4 (Version lOLZ)
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
<<<<<<< HEAD
                pathname === item.href ? "text-foreground" : "text-foreground/60",
=======
                pathname === item.href
                  ? "text-foreground"
                  : "text-foreground/60"
>>>>>>> a6396a4 (Version lOLZ)
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center space-x-4">
<<<<<<< HEAD
=======
        {!["/search", "/auth/login", "/auth/register"].includes(pathname) && (
          <Link href="/search">
            <InputSearch />
          </Link>
        )}
      </div>
      <div className="flex items-center space-x-4">
>>>>>>> a6396a4 (Version lOLZ)
        <Button variant="outline" size="sm" asChild>
          <Link href="/cart" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>{cartItemCount} items</span>
            <span>₹{cartTotal}</span>
          </Link>
        </Button>
<<<<<<< HEAD
        {isLoggedIn ? (
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        ) : (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">
=======
        {session ? (
          <UserNav
            onLogout={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) {
                toast({
                  title: "Error logging out",
                  description: error.message,
                  variant: "destructive",
                });
                return;
              }
              toast({
                title: "Logged out successfully",
                description: "You have been logged out of your account.",
              });
              setSession(null);
              router.push("/auth/login");
            }}
          />
        ) : (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">
>>>>>>> a6396a4 (Version lOLZ)
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
          </Button>
        )}
      </div>
    </div>
<<<<<<< HEAD
  )
}

=======
  );
}
>>>>>>> a6396a4 (Version lOLZ)
