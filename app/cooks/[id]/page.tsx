"use client";
import { useState, useEffect } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Check, MapPin, Clock, Truck, Plus, Minus } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cooksByState } from "@/lib/data/states";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { User } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/utils/supabase/client";
import { dayMapping } from "@/components/student/dashboard/types";

export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const getCurrentDayNumber = (): DayOfWeek => {
  const today = new Date();
  const dayNumber = today.getDay() || 7; // Convert Sunday (0) to 7
  return dayNumber as DayOfWeek;
};

// Add state for tracking the selected day

// Add a mapping for day names (if needed)
const dayNameToNumber: Record<string, number> = {
  sunday: 7,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

// Add the missing getDayName function
const getDayName = (day: DayOfWeek): string => {
  const dayNames = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
  };
  return dayNames[day] || "Unknown";
};

const getDayNumber = (dayName: string | number | undefined): number => {
  if (typeof dayName === "number") {
    return dayName;
  }

  if (!dayName || typeof dayName !== "string") {
    return 0;
  }

  return dayNameToNumber[dayName.toLowerCase()] || 0;
};

// Add these helper functions before the component
export const formatAddress = (address: {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}) => {
  if (!address) return "Address not available";

  const parts = [
    address.street,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean);

  return parts.join(", ");
};

interface Address {
  city: string;
  state: string;
  street: string;
  pincode: string;
}

export interface Cook {
  id: string;
  first_name: string;
  last_name: string;
  cook_id: string;
  email: string;
  description: string;
  address: Address;
  profile_image?: string;
  certification?: string;
  cuisineType?: string;
  rating: number;
  totalOrders: number;
  totalEarnings: number;
  isAvailable: boolean;
  menuItems?: MenuItem[];
}

export interface MenuItem {
  id: string;
  cook_id: string;
  item_name: string;
  description: string;
  price: number;
  dietary_type: string;
  cuisine_type: string;
  meal_type: string;
  day_of_week: string;
  isAvailable: boolean;
  quantity: number;
}

export interface CartItem extends MenuItem {
  menuItems?: MenuItem[];
}

const { toast } = useToast();

const filterMenuItemsByDay = (
  menuItems: MenuItem[] = [],
  currentDay: number
) => {
  return menuItems.filter((item) => {
    const itemDayNumber = getDayNumber(item.day_of_week);
    // Filter out items with zero or negative price, or empty names/descriptions
    return (
      itemDayNumber === currentDay &&
      item.price > 0 &&
      item.item_name?.trim().length > 0 &&
      item.description?.trim().length > 0
    );
  });
};

export default function CookProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const [currentDay, setCurrentDay] = useState<DayOfWeek>(getCurrentDayNumber());
  const [isLoading, setIsLoading] = useState(true);
  const { cart, addToCart, removeFromCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [cook, setCook] = useState<Cook | null>(null);

  useEffect(() => {
    // Update current day when component mounts
    setCurrentDay(getCurrentDayNumber());
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();

        const { data: cookData, error: cookError } = await supabase
          .from("cooks")
          .select("*")
          .eq("id", params.id)
          .single();

        if (cookError) throw cookError;
        if (!cookData) throw new Error("Cook not found");

        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from("dabba_menu")
          .select("*")
          .eq("cook_id", cookData.cook_id);

        if (menuError) throw menuError;

        // Merge cook and menu data
        const mergedCook = {
          ...cookData,
          menuItems:
            menuData?.map((item) => ({
              ...item,
              day_of_week: item.day_of_week,
            })) || [],
        };
        console.log("merged cook:", mergedCook);

        setCook(mergedCook);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load cook data"
        );
        console.error("Error fetching cook:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  // Effect for cart quantities
  useEffect(() => {
    const newQuantities: Record<string, number> = {};
    cart.forEach((item: any) => {
      newQuantities[item.id] = item.quantity;
    });
    setQuantities(newQuantities);
  }, [cart]);

  // Add getCartItemId helper
  const getCartItemId = (cookId: string, day: number) => `${cookId}-${day}`;

  const handleQuantityChange = async (day: number, change: number) => {
    if (!cook || !cook.menuItems) return;

    const itemId = getCartItemId(cook.cook_id, day);
    const currentQty = quantities[itemId] || 0;
    const newQty = currentQty + change;

    if (newQty <= 0) {
      handleRemoveFromCart(day);
      return;
    }

    const dayMenu = cook.menuItems.filter(
      (item) => getDayNumber(item.day_of_week) === day && item.price > 0
    );

    const bundledMenu: CartItem = {
      id: itemId,
      cook_id: cook.cook_id,
      item_name: `${cook.first_name}'s ${dayMapping[day]} Dabba`,
      description: `${dayMapping[day]}'s special dabba`,
      price: dayMenu.reduce((total, item) => total + (item.price || 0), 0),
      dietary_type: dayMenu[0]?.dietary_type || "veg",
      cuisine_type: cook.cuisineType || "indian",
      meal_type: dayMenu[0]?.meal_type || "lunch",
      day_of_week: day.toString(),
      isAvailable: true,
      quantity: newQty,
      menuItems: dayMenu,
    };

    addToCart(bundledMenu);
    setQuantities((prev) => ({ ...prev, [itemId]: newQty }));

    toast({
      title: change > 0 ? "Added to cart" : "Updated cart",
      description: `${cook.first_name}'s ${dayMapping[day]} Dabba has been ${
        change > 0 ? "added to" : "updated in"
      } your cart.`,
    });
  };

  const handleRemoveFromCart = (day: number) => {
    if (!cook) return;
    const itemId = getCartItemId(cook.cook_id, day);
    removeFromCart(itemId);
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[itemId];
      return newQuantities;
    });

    toast({
      title: "Removed from cart",
      description: `${cook.first_name}'s ${dayMapping[day]} Dabba has been removed from your cart.`,
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!cook) return <div>Cook not found</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Image
                src={cook.profile_image || "/placeholder-user.jpg"}
                alt={cook.first_name}
                width={100}
                height={100}
                className="rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold">
                  {cook.first_name} {cook.last_name}
                </h1>
                <p className="text-muted-foreground">Cooking & Baking</p>
                <p className="text-sm text-muted-foreground">
                  {cook.certification}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-2 p-4">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {cook.address
                      ? formatAddress(cook.address)
                      : "Address not available"}
                  </span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-2 p-4">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Pre-order: 1 hour in advance</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-2 p-4">
                  <Truck className="h-4 w-4" />
                  <span className="text-sm">Delivery available</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-2 p-4">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Delivery radius: 2.5 km</span>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">About</h2>
              <p className="text-muted-foreground">
                I am a home chef who loves to cook and bake. I specialize in
                South Indian cuisine. I use organic ingredients and cook with
                love.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Food Certification</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Food Safety Training</span>
                  <Badge variant="outline">
                    <Check className="mr-1 h-3 w-3" /> Completed
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Aadhaar Verification</span>
                  <Badge variant="outline">
                    <Check className="mr-1 h-3 w-3" /> Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>PAN</span>
                  <Badge variant="outline">
                    <Check className="mr-1 h-3 w-3" /> Verified
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Tabs defaultValue="menu" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="menu">Today's Dabba</TabsTrigger>
              <TabsTrigger value="schedule">This week's Dabba</TabsTrigger>
            </TabsList>
            <TabsContent value="menu">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">Today's Dabba</h3>
                    </div>

                    <ScrollArea className="h-[250px]">
                      <div className="space-y-2">
                        {cook?.menuItems &&
                          filterMenuItemsByDay(
                            cook.menuItems,
                            getCurrentDayNumber()
                          ).map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-start border-b pb-2"
                            >
                              <div>
                                <h4 className="font-medium">
                                  {item.item_name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                              <p className="font-semibold">₹{item.price}</p>
                            </div>
                          ))}
                      </div>
                      <ScrollBar orientation="vertical" />
                    </ScrollArea>

                    <div className="flex justify-between items-center mt-2">
                      <div className="text-lg font-semibold">
                        Total: ₹
                        {(cook.menuItems || [])
                          .filter(
                            (item) =>
                              getDayNumber(item.day_of_week) ===
                              getCurrentDayNumber() && item.price > 0
                          )
                          .reduce((total, item) => total + item.price, 0)}
                      </div>
                      {quantities[`${cook.id}-${getCurrentDayNumber()}`] ? (
                        <div className="flex items-center gap-2">
                          {quantities[
                            getCartItemId(cook.id, getCurrentDayNumber())
                          ] ? (
                            <>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() =>
                                  handleQuantityChange(
                                    getCurrentDayNumber(),
                                    -1
                                  )
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">
                                {
                                  quantities[
                                    getCartItemId(
                                      cook.id,
                                      getCurrentDayNumber()
                                    )
                                  ]
                                }
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() =>
                                  handleQuantityChange(getCurrentDayNumber(), 1)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() =>
                                handleQuantityChange(getCurrentDayNumber(), 1)
                              }
                            >
                              Add Today's Dabba
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button
                          className="w-[200px]"
                          onClick={() => {
                            const dayMenu = (cook.menuItems || []).filter(
                              (item) =>
                                getDayNumber(item.day_of_week) === currentDay && item.price > 0
                            );
                            
                            // Don't allow adding if no valid items or total price is 0
                            const totalPrice = dayMenu.reduce(
                              (total, item) => total + item.price,
                              0
                            );
                            
                            if (dayMenu.length === 0 || totalPrice <= 0) {
                              toast({
                                title: "Cannot add to cart",
                                description: "No valid menu items available for this day.",
                                variant: "destructive",
                              });
                              return;
                            }

                            const bundledMenu: CartItem = {
                              id: `${cook.id}-${currentDay}`,
                              cook_id: cook.id,
                              item_name: `${cook.first_name}'s ${dayMapping[currentDay]} Dabba`,
                              description: `${dayMapping[currentDay]}'s special dabba by ${cook.first_name}`,
                              price: totalPrice,
                              dietary_type: dayMenu[0]?.dietary_type || "veg",
                              cuisine_type: dayMenu[0]?.cuisine_type || "indian",
                              meal_type: "lunch",
                              day_of_week: currentDay.toString(),
                              isAvailable: true,
                              quantity: 1,
                              menuItems: dayMenu,
                            };
                            addToCart(bundledMenu);
                            setQuantities((prev) => ({
                              ...prev,
                              [`${cook.id}-${currentDay}`]: 1,
                            }));
                            toast({
                              title: "Added to cart",
                              description: `${dayMapping[currentDay]}'s Dabba has been added to your cart.`,
                            });
                          }}
                        >
                          Add {dayMapping[currentDay]}'s Dabba
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule">
              <Card>
                <CardContent className="p-4">
                  <Tabs
                    defaultValue={getCurrentDayNumber().toString()}
                    className="flex"
                  >
                    <TabsList className="w-[150px] h-full flex-col">
                      {Object.entries(dayMapping).map(([day, dayName]) => (
                        <TabsTrigger
                          key={day}
                          value={day}
                          className="justify-start w-full"
                        >
                          {dayName}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {Object.entries(dayMapping).map(([day, dayName]) => (
                      <TabsContent
                        key={day}
                        value={day}
                        className="flex-1 ml-4"
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold">
                              {dayName}'s Menu
                            </h3>
                            <Badge variant="secondary">
                              {(cook.menuItems || []).find(
                                (item) =>
                                  getDayNumber(item.day_of_week) === Number(day)
                              )?.dietary_type || "veg"}
                            </Badge>
                          </div>

                          <ScrollArea className="h-[250px]">
                            <div className="space-y-2">
                              {(cook.menuItems || [])
                                .filter(
                                  (item) =>
                                    getDayNumber(item.day_of_week) ===
                                    Number(day) && item.price > 0
                                )
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex justify-between items-start border-b pb-2"
                                  >
                                    <div>
                                      <h4 className="font-medium">
                                        {item.item_name}
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        {item.description}
                                      </p>
                                    </div>
                                    <p className="font-semibold">
                                      ₹{item.price}
                                    </p>
                                  </div>
                                ))}
                            </div>
                            <ScrollBar orientation="vertical" />
                          </ScrollArea>

                          <div className="flex justify-between items-center mt-2">
                            <div className="text-lg font-semibold">
                              Total: ₹
                              {(cook.menuItems || [])
                                .filter(
                                  (item) =>
                                    getDayNumber(item.day_of_week) ===
                                    Number(day) && item.price > 0
                                )
                                .reduce((total, item) => total + item.price, 0)}
                            </div>
                            {quantities[`${cook.id}-${day}`] ? (
                              <div className="flex items-center gap-2">
                                {quantities[
                                  getCartItemId(cook.id, Number(day))
                                ] ? (
                                  <>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      onClick={() =>
                                        handleQuantityChange(Number(day), -1)
                                      }
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-8 text-center">
                                      {
                                        quantities[
                                          getCartItemId(cook.id, Number(day))
                                        ]
                                      }
                                    </span>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      onClick={() =>
                                        handleQuantityChange(Number(day), 1)
                                      }
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    onClick={() =>
                                      handleQuantityChange(Number(day), 1)
                                    }
                                  >
                                    Add {dayName}'s Dabba
                                  </Button>
                                )}
                              </div>
                            ) : (
                              // Keep existing Add button
                              <Button
                                className="w-[200px]"
                                onClick={() => {
                                  const dayMenu = (cook.menuItems || []).filter(
                                    (item) =>
                                      getDayNumber(item.day_of_week) ===
                                      Number(day) && item.price > 0
                                  );
                                  
                                  // Don't allow adding if no valid items or total price is 0
                                  const totalPrice = dayMenu.reduce(
                                    (total, item) => total + item.price,
                                    0
                                  );
                                  
                                  if (dayMenu.length === 0 || totalPrice <= 0) {
                                    toast({
                                      title: "Cannot add to cart",
                                      description: "No valid menu items available for this day.",
                                      variant: "destructive",
                                    });
                                    return;
                                  }

                                  const bundledMenu: CartItem = {
                                    id: `${cook.id}-${day}`,
                                    cook_id: cook.id,
                                    item_name: `${cook.first_name}'s ${dayName} Dabba`,
                                    description: `${dayName}'s special dabba by ${cook.first_name}`,
                                    price: totalPrice,
                                    dietary_type:
                                      dayMenu[0]?.dietary_type || "veg",
                                    cuisine_type:
                                      dayMenu[0]?.cuisine_type || "indian",
                                    meal_type: dayMenu[0]?.meal_type || "lunch",
                                    day_of_week: day.toString(), // Just use the day number as a string
                                    isAvailable: true,
                                    quantity: 1,
                                    menuItems: dayMenu,
                                  };
                                  addToCart(bundledMenu);
                                  setQuantities((prev) => ({
                                    ...prev,
                                    [`${cook.id}-${day}`]: 1,
                                  }));
                                  toast({
                                    title: "Added to cart",
                                    description: `${dayName}'s Dabba has been added to your cart.`,
                                  });
                                }}
                              >
                                Add {dayName}'s Dabba
                              </Button>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
