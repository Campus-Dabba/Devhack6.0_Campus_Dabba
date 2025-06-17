"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { MainNav } from "@/components/layout/main-nav";
import { CookNav } from "@/components/layout/cook-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { createClient } from "@/utils/supabase/client";

const inter = Inter({ subsets: ["latin"] });
const supabase = createClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCook, setIsCook] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkCookStatus = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: cook } = await supabase
            .from("cooks")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setIsCook(!!cook);
        }
      } catch (error) {
        console.error("Error checking cook status:", error);
      } finally {
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkCookStatus();
      } 
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await checkCookStatus();
      } else {
        setIsCook(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);



  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CartProvider>
            <div className="relative flex min-h-screen flex-col">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                  {isCook ? <CookNav /> : <MainNav />}
                  <MobileNav />
                </div>
              </header>
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
