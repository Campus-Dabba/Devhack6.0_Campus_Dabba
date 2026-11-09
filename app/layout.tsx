"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { MainNav } from "@/components/layout/main-nav";
import { CookNav } from "@/components/layout/cook-nav";
import { AdminNav } from "@/components/admin/admin-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider, useAuth } from "@/components/providers/auth-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { Toaster } from "@/components/ui/toaster";
import FloatingChatButton from "@/components/shared/EnhancedFloatingChatButton";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, userRole, isCook, isAdmin, loading, refreshCounter } = useAuth();
  const pathname = usePathname();
  
  // Debug logging
  console.log('[LayoutContent] Auth state:', {
    hasUser: !!user,
    userRole,
    isCook,
    isAdmin,
    loading,
    refreshCounter,
    userId: user?.id
  });

  // Force re-render when userRole changes
  useEffect(() => {
    console.log('[LayoutContent] UserRole changed:', userRole, 'isCook:', isCook);
  }, [userRole, isCook]);
  
  // Check if we're on admin routes (admin pages have their own layout with navigation)
  const isAdminRoute = pathname?.startsWith('/admin');

  // Show loading spinner while auth is being determined
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render header navigation for admin routes (they have their own layout)
  if (isAdminRoute) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
        <FloatingChatButton key={`chat-${refreshCounter}-${user?.id || 'guest'}-${userRole || 'norole'}`} />
      </div>
    );
  }

  // Determine which navigation to show based on user role
  const getNavigation = () => {
    console.log('[LayoutContent] getNavigation called, isCook:', isCook, 'userRole:', userRole);
    if (isCook) {
      return <CookNav key={`cook-nav-${refreshCounter}-${user?.id || 'guest'}-${userRole}`} />;
    } else {
      return <MainNav key={`main-nav-${refreshCounter}-${user?.id || 'guest'}-${userRole}`} />;
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <header 
        key={`header-${refreshCounter}-${user?.id || 'guest'}-${userRole || 'norole'}`}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-14 items-center">
          <MobileNav key={`mobile-nav-${refreshCounter}-${user?.id || 'guest'}-${userRole}-${isCook}`} />
          {getNavigation()}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <FloatingChatButton key={`chat-${refreshCounter}-${user?.id || 'guest'}-${userRole || 'norole'}`} />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <CartProvider>
              <LayoutContent>{children}</LayoutContent>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
