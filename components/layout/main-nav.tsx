"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/cart-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import InputSearch from "@/components/ui/search-bar";
import AdvancedSearchBar from "@/components/shared/AdvancedSearchBar";
import { UserNav } from "@/components/layout/User-nav";
import Image from "next/image";

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
];

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { cart, getCartTotal } = useCart();
  const { user, isAdmin, signOut, refreshCounter } = useAuth();
  
  // Debug log to track re-renders
  console.log('[MainNav] Rendering with:', { 
    hasUser: !!user, 
    isAdmin, 
    refreshCounter,
    userId: user?.id 
  });
  
  const cartItemCount = cart.reduce((total: number, item: any) => total + item.quantity, 0);
  const cartTotal = getCartTotal();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      router.push("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-between w-full gap-2">
      <div className="flex items-center">
        <Link href="/" className="mr-6 flex items-center gap-2 shrink-0">
          <Image
            src="https://ejtjwejiulepzcglswis.supabase.co/storage/v1/object/public/webpage-images//logo.png"
            alt="CampusDabba Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === item.href
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        {![
          "/search",
          "/auth/login",
          "/auth/register",
          "/auth/registration",
          "/cook/register",
          "/cook/login",
          "/cook/registration",
        ].includes(pathname) && (
          <div className="hidden md:block">
            <AdvancedSearchBar />
          </div>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/cart" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>{cartItemCount}<span className="hidden sm:inline"> items</span></span>
            <span className="hidden sm:inline">₹{cartTotal}</span>
          </Link>
        </Button>
        {user ? (
          <UserNav />
        ) : (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
          </Button>
        )}
        
        {/* Admin link for admin users */}
        {isAdmin && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dashboard">
              Admin
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
