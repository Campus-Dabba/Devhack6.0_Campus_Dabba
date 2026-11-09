"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { MenuItem, CartItem, DayOfWeek, dayMapping, Cook } from "./types";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

interface Address {
  city: string;
  state: string;
  street: string;
  pincode: string;
}

type ListCook = Cook & { business_name?: string | null; cuisine_type?: string | null };

interface CooksListProps {
  /** When provided, the parent controls the state filter and the built-in chips are hidden. */
  selectedState?: string;
}

const getCurrentDayNumber = (): DayOfWeek => {
  const dayNumber = new Date().getDay() || 7; // Convert Sunday (0) to 7
  return dayNumber.toString() as DayOfWeek;
};

const getDayName = (day: DayOfWeek): string => dayMapping[day] || "Unknown";

// Menu rows store day_of_week as "1"-"7" or as a day name; normalise to "1"-"7".
const normalizeDayOfWeek = (day: string | number | undefined): string => {
  if (!day) return "";
  if (typeof day === "number") return day.toString();
  if (/^[1-7]$/.test(day)) return day;
  const dayNameMap: Record<string, string> = {
    monday: "1", tuesday: "2", wednesday: "3", thursday: "4",
    friday: "5", saturday: "6", sunday: "7",
  };
  return dayNameMap[day.toLowerCase()] || day;
};

const isToday = (item: MenuItem) =>
  normalizeDayOfWeek(item.day_of_week) === normalizeDayOfWeek(getCurrentDayNumber());

const certLabel = (cert: unknown): string | null => {
  if (!cert) return null;
  if (Array.isArray(cert)) return cert.length ? String(cert[0]) : null;
  if (typeof cert === "string") return cert;
  if (typeof cert === "object") return Object.keys(cert as object)[0] ?? null;
  return null;
};

const initials = (cook: Cook) =>
  `${cook.first_name?.[0] ?? ""}${cook.last_name?.[0] ?? ""}`.toUpperCase() || "CD";

const formatAddress = (address: Address | string | null | undefined): string => {
  if (!address) return "";
  if (typeof address === "string") return address;
  return [address.city, address.state].filter(Boolean).join(", ");
};

export function CooksList({ selectedState }: CooksListProps) {
  const { cart, addToCart, removeFromCart } = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cooks, setCooks] = useState<ListCook[]>([]);
  const [localState, setLocalState] = useState("All States");
  const supabase = useMemo(() => createClient(), []);

  const activeState = selectedState ?? localState;

  const fetchCooks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: cooksData, error: cooksError } = await supabase
        .from("cooks")
        .select(
          "id, cook_id, first_name, last_name, business_name, description, address, region, rating, total_orders, totalorders, is_available, isAvailable, cuisine_type, certification, profile_image"
        )
        .order("rating", { ascending: false });

      if (cooksError) throw cooksError;
      if (!cooksData || cooksData.length === 0) {
        setCooks([]);
        return;
      }

      const cookIds = cooksData.map((cook: any) => cook.id || cook.cook_id);
      const { data: menuData, error: menuError } = await supabase
        .from("dabba_menu")
        .select("*")
        .in("cook_id", cookIds);

      if (menuError) throw menuError;

      const processed = cooksData.map((cook: any) => {
        const cookId = cook.id || cook.cook_id;
        const cookMenuItems = (menuData || []).filter(
          (item: any) => item.cook_id === cookId && item.is_available !== false
        );
        return {
          ...cook,
          cook_id: cookId,
          totalorders: cook.total_orders || cook.totalorders || 0,
          isAvailable: cook.is_available ?? cook.isAvailable ?? true,
          region:
            cook.region ||
            (cook.address && typeof cook.address === "object" ? cook.address.state : undefined),
          menuItems: cookMenuItems.map((item: any) => ({
            id: item.id,
            cook_id: item.cook_id,
            item_name: item.item_name,
            description: item.description,
            price: parseFloat(item.price),
            day_of_week: item.day_of_week,
            dietary_type: item.dietary_type,
            meal_type: item.meal_type,
            created_at: item.created_at,
          })),
        } as ListCook;
      });

      setCooks(processed);
    } catch (err: any) {
      console.error("Error in fetchCooks:", err);
      setError(err?.message || "Could not load cooks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const next: Record<string, number> = {};
    cart.forEach((item: CartItem) => {
      next[item.id] = item.quantity;
    });
    setQuantities(next);
  }, [cart]);

  const regions = useMemo(() => {
    const counts = new Map<string, number>();
    cooks.forEach((c) => c.region && counts.set(c.region, (counts.get(c.region) || 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [cooks]);

  const visibleCooks = useMemo(
    () =>
      activeState && activeState !== "All States"
        ? cooks.filter((c) => c.region?.toLowerCase().includes(activeState.toLowerCase()))
        : cooks,
    [cooks, activeState]
  );

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-xl border bg-muted/40" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="font-semibold">We couldn&apos;t load cooks right now</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchCooks}>
          Try again
        </Button>
      </div>
    );
  }

  const getCartItemId = (cookId: string) => `${cookId}-${getCurrentDayNumber()}`;

  const handleAddToCart = (cook: Cook) => {
    const itemId = getCartItemId(cook.id);
    const newQty = (quantities[itemId] || 0) + 1;
    const todayMenu = cook.menuItems.filter(isToday);

    if (todayMenu.length === 0) {
      toast.error(`${cook.first_name} ${cook.last_name} has no items available today`);
      return;
    }

    const bundledMenu: CartItem = {
      id: itemId,
      cook_id: cook.cook_id,
      item_name: `${cook.first_name} ${cook.last_name}'s ${getDayName(getCurrentDayNumber())} Dabba`,
      description: `${getDayName(getCurrentDayNumber())}'s special dabba`,
      price: todayMenu.reduce((total, item) => total + item.price, 0),
      dietary_type: todayMenu.some((i) => i.dietary_type === "non-veg") ? "non-veg" : "veg",
      meal_type: "lunch",
      day_of_week: getCurrentDayNumber(),
      quantity: newQty,
    };

    addToCart(bundledMenu);
    setQuantities((prev) => ({ ...prev, [itemId]: newQty }));
    toast(`${bundledMenu.item_name} added to your cart.`);
  };

  const handleRemoveFromCart = (cook: Cook) => {
    try {
      removeFromCart(getCartItemId(cook.id));
      toast(`${cook.first_name} ${cook.last_name}'s dabba removed from your cart.`);
    } catch (err) {
      console.error("Error removing from cart:", err);
      toast("Failed to remove item from cart");
    }
  };

  const todayTotal = (cook: Cook) =>
    cook.menuItems.filter(isToday).reduce((total, item) => total + item.price, 0);

  return (
    <div className="space-y-6">
      {selectedState === undefined && regions.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {[["All States", cooks.length] as [string, number], ...regions].map(([name, count]) => (
            <button
              key={name}
              onClick={() => setLocalState(name)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors",
                activeState === name
                  ? "border-orange-600 bg-orange-600 text-white"
                  : "bg-background hover:bg-muted"
              )}
            >
              {name} <span className="opacity-70">({count})</span>
            </button>
          ))}
        </div>
      )}

      {visibleCooks.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="font-medium">No cooks here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeState !== "All States"
              ? `We don't have cooks in ${activeState} yet. Know a great home cook there?`
              : "Check back soon, new cooks are joining every week."}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/cook/register">Invite a cook</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleCooks.map((cook) => {
            const todayItems = cook.menuItems.filter(isToday);
            const qty = quantities[getCartItemId(cook.id)] || 0;
            const cert = certLabel(cook.certification);
            const isVeg = todayItems.length > 0 && todayItems.every((i) => i.dietary_type !== "non-veg");

            return (
              <Card key={cook.cook_id} className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
                <div className="flex items-start gap-4 border-b bg-gradient-to-br from-orange-50 to-amber-50 p-5 dark:from-orange-950/30 dark:to-background">
                  {cook.profile_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cook.profile_image}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-lg font-semibold text-white ring-2 ring-white">
                      {initials(cook)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link href={`/cooks/${cook.id}`} className="font-semibold leading-tight hover:underline">
                      {cook.first_name} {cook.last_name}
                    </Link>
                    {cook.business_name && (
                      <p className="truncate text-sm text-muted-foreground">{cook.business_name}</p>
                    )}
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {formatAddress(cook.address as any)}
                    </p>
                  </div>
                  {Number(cook.rating) > 0 && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-0.5 text-sm font-medium shadow-sm dark:bg-background">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {Number(cook.rating).toFixed(1)}
                    </span>
                  )}
                </div>

                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap gap-2">
                    {cook.cuisine_type && (
                      <Badge variant="secondary" className="capitalize">{cook.cuisine_type}</Badge>
                    )}
                    {cook.totalorders > 0 && <Badge variant="secondary">{cook.totalorders}+ orders</Badge>}
                    {cert && <Badge variant="outline">{cert}</Badge>}
                  </div>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400">
                      {getDayName(getCurrentDayNumber())}&apos;s dabba
                    </h4>
                    {todayItems.length > 0 && (
                      <span
                        className={cn(
                          "rounded border px-1.5 text-[10px] font-semibold uppercase",
                          isVeg ? "border-green-600 text-green-700" : "border-red-600 text-red-700"
                        )}
                      >
                        {isVeg ? "Veg" : "Non-veg"}
                      </span>
                    )}
                  </div>
                  {todayItems.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">Not cooking today</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {todayItems.map((item) => (
                        <li key={item.id} className="flex justify-between gap-3">
                          <span>{item.item_name}</span>
                          <span className="shrink-0 text-muted-foreground">₹{item.price}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>

                <CardFooter className="flex items-center justify-between gap-3 border-t p-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Dabba price</p>
                    <p className="text-lg font-semibold">₹{todayTotal(cook)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/cooks/${cook.id}`}>Details</Link>
                    </Button>
                    {qty > 0 ? (
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleRemoveFromCart(cook)}>
                          −
                        </Button>
                        <span className="w-6 text-center text-sm">{qty}</span>
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleAddToCart(cook)}>
                          +
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={() => handleAddToCart(cook)}
                        disabled={todayItems.length === 0}
                      >
                        Add dabba
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
