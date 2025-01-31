import type { Metadata } from "next"
import Image from "next/image"
import { Check, MapPin, Clock, Truck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cooksByState } from "@/lib/data/states"

export const metadata: Metadata = {
  title: "Cook Profile",
  description: "View cook's profile and menu",
}

export default function CookProfilePage({ params }: { params: { id: string } }) {
  // Find cook from all states
  const cook = Object.values(cooksByState)
    .flat()
    .find((c) => c.id === params.id)

  if (!cook) {
    return <div>Cook not found</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Image
                src={cook.profilePicture || "https://source.unsplash.com/random/100x100?chef"}
                alt={cook.name}
                width={80}
                height={80}
                className="rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold">{cook.name}</h1>
                <p className="text-muted-foreground">Cooking & Baking</p>
                <p className="text-sm text-muted-foreground">{cook.certification}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-2 p-4">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{cook.address}</span>
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
                I am a home chef who loves to cook and bake. I specialize in South Indian cuisine. I use organic
                ingredients and cook with love.
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
              <TabsTrigger value="menu">Today's Menu</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>
            <TabsContent value="menu" className="space-y-4">
              {cook.menuItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-2">
                          {item.dietaryType}
                        </Badge>
                        <p className="font-semibold">₹{item.price}</p>
                      </div>
                    </div>
                    <Button className="mt-4 w-full">Add to Cart</Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="schedule">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Schedule and availability information will be displayed here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

