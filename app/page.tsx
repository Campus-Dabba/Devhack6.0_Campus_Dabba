"use client";
import Link from "next/link";
import { ChefHat, MapPin, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { CooksList } from "@/components/student/dashboard/cooks-list";
import { MapPreview } from "@/components/map/map-preview";
import { RoleBasedRedirect } from "@/components/auth/role-based-redirect";
import { GlobalChefs } from "@/components/landing/global-chefs";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: MapPin,
    title: "Find a cook near campus",
    body: "Browse home cooks by state and city, with today's menu and price up front.",
  },
  {
    icon: ShoppingBag,
    title: "Order today's dabba",
    body: "Each cook makes one fresh menu a day. Add it to your cart and pay with UPI or card.",
  },
  {
    icon: UtensilsCrossed,
    title: "Eat like you're home",
    body: "Pick up or get it delivered, then rate your cook so others know who to try.",
  },
];

export default function HomePage() {
  return (
    <RoleBasedRedirect>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-orange-50 via-amber-50 to-background dark:from-orange-950/30 dark:via-background dark:to-background">
        <div className="container grid items-center gap-10 py-14 md:py-20 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/70 px-3 py-1 text-xs font-medium text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300">
              <ChefHat className="h-3.5 w-3.5" /> Home-cooked meals for students
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Ghar jaisa khana,{" "}
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                right next to campus.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Campus Dabba connects students with verified home cooks in their city. Fresh
              regional thalis every day, from Andhra meals to Kolhapuri rassa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-orange-600 hover:bg-orange-700">
                <a href="#cooks">See today&apos;s dabbas</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/cook/register">Cook with us</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="rounded-xl border bg-card/80 p-5 backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
                </div>
                <p className="mt-3 font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cooks */}
      <section id="cooks" className="container scroll-mt-20 py-12 md:py-16">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Today&apos;s dabbas</h2>
          <p className="mt-1 text-muted-foreground">
            Home cooks near you and what they&apos;re making today.
          </p>
        </div>
        <CooksList />
      </section>

      {/* Map */}
      <section className="border-y bg-muted/30">
        <div className="container py-12 md:py-16">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dabba providers near you</h2>
            <p className="mt-1 text-muted-foreground">
              Allow location access to see the cooks closest to you.
            </p>
          </div>
          <MapPreview />
        </div>
      </section>

      <GlobalChefs />

      <footer className="bg-zinc-900 text-zinc-100">
        <div className="container grid gap-8 py-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="text-lg font-semibold">Campus Dabba</p>
            <p className="mt-2 text-sm text-zinc-400">
              Home-cooked meals from cooks in your city.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Contact</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-300">
              <li>
                <a href="mailto:campusdabba@gmail.com" className="hover:text-white">
                  campusdabba@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+919022392820" className="hover:text-white">
                  +91 90223 92820
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Help</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-300">
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/support" className="hover:text-white">Support</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Company</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-300">
              <li><Link href="/about" className="hover:text-white">About us</Link></li>
              <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              <li><Link href="/cook/register" className="hover:text-white">Become a cook</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Campus Dabba. All rights reserved.
        </div>
      </footer>
    </RoleBasedRedirect>
  );
}
