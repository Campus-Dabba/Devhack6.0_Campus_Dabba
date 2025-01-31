"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Plus, Minus, ShoppingCart } from "lucide-react"

import { cooksByState } from "@/lib/data/states"
import { useCart } from "@/components/providers/cart-provider"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

interface CooksListProps {
  selectedState: string
}

export function CooksList({ selectedState }: CooksListProps) {
  const cooks = cooksByState[selectedState as keyof typeof cooksByState] || []
  const { cart, addToCart, removeFromCart } = useCart()

  const handleAddToCart = (item: any) => {
    addToCart(item)
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    })
  }

  const handleRemoveFromCart = (item: any) => {
    removeFromCart(item.id)
    toast({
      title: "Removed from cart",
      description: `${item.name} has been removed from your cart.`,
    })
  }

  if (cooks.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No cooks available in this state yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cooks.map((cook) => (
        <Card key={cook.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <AspectRatio ratio={1} className="w-12 flex-none">
                <Image
                  src={cook.profilePicture || "https://source.unsplash.com/random/100x100?chef"}
                  alt={cook.name}
                  className="rounded-full object-cover"
                  fill
                  sizes="48px"
                />
              </AspectRatio>
              <div className="flex-1 space-y-1">
                <CardTitle className="text-lg">
                  <Link href={`/cooks/${cook.id}`} className="hover:underline">
                    {cook.name}
                  </Link>
                </CardTitle>
                <CardDescription>{cook.address}</CardDescription>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-sm">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span>{cook.rating}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex gap-2">
              <Badge variant="secondary">{cook.totalOrders}+ orders</Badge>
              {cook.certification && <Badge variant="outline">{cook.certification}</Badge>}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h4 className="font-medium">Today's Menu</h4>
              <ScrollArea className="h-[120px]">
                <div className="space-y-4">
                  {cook.menuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="capitalize">
                          {item.dietaryType}
                        </Badge>
                        <p className="text-sm font-semibold">₹{item.price}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => handleRemoveFromCart(item)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-sm">
                            {cart.find((cartItem) => cartItem.id === item.id)?.quantity || 0}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => handleAddToCart(item)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={`/cooks/${cook.id}`}>View Full Menu</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

