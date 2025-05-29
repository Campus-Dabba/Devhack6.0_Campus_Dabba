"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentStatus } from "@/components/cook/payment-status";

import { Clock, MapPin, Users, UtensilsCrossed, IndianRupee, Star } from "lucide-react";

export default function CookDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Cook Dashboard</h1>
            <p className="text-muted-foreground">Manage your kitchen and orders</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <IndianRupee className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">Total Earnings</p>
                  <h3 className="text-2xl font-bold">₹15,245</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <UtensilsCrossed className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">Active Orders</p>
                  <h3 className="text-2xl font-bold">24</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">Total Customers</p>
                  <h3 className="text-2xl font-bold">156</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Star className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">Average Rating</p>
                  <h3 className="text-2xl font-bold">4.8/5</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="menu">Menu</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="overview">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Kitchen Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>123 Kitchen Street, Campus Area</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Operating Hours: 11 AM - 8 PM</span>
                      </div>
                      <Badge>Verified Kitchen</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Today's Menu Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        {/* Menu items list */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Veg Thali</span>
                            <Badge>Active</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Dal Rice</span>
                            <Badge variant="outline">Sold Out</Badge>
                          </div>
                          {/* Add more menu items */}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="orders">
                <ScrollArea className="h-[400px]">
                  {/* Orders list */}
                  <div className="space-y-4">
                    {/* Add order items here */}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="menu">
                <ScrollArea className="h-[400px]">
                  {/* Weekly menu management */}
                  <div className="space-y-4">
                    {/* Add menu management here */}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="reviews">
                <ScrollArea className="h-[400px]">
                  {/* Customer reviews */}
                  <div className="space-y-4">
                    {/* Add reviews here */}
                  </div>
                </ScrollArea>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Payment Status Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Payment Status</h2>
          <PaymentStatus />
        </section>
      </div>
    </div>
  );
}