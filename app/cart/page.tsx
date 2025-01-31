"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/providers/cart-provider";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { toast } = useToast();
  const total = getCartTotal();

  const handleUpdateQuantity = (id: string, change: number) => {
    const item = cart.find((item) => item.id === id);
    if (item) {
      const newQuantity = Math.max(0, item.quantity + change);
      if (newQuantity === 0) {
        removeFromCart(id);
        toast({
          description: "Item removed from cart",
        });
      } else {
        updateQuantity(id, newQuantity);
      }
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Your cart is empty</p>
          <Button className="mt-4">Continue Shopping</Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center gap-4">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-md"
                    />
                  ) : (
                    // Fallback UI when no image is available
                    <div className="w-20 h-20 bg-gray-200 rounded-md" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-muted-foreground">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() =>
                        handleUpdateQuantity(item.id, -item.quantity)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-end gap-4">
            <div className="text-lg">
              Total: <span className="font-bold">₹{total}</span>
            </div>
            <Link href="/checkout">
              <Button
                size="lg"
                onClick={() => {
                  toast({
                    title: "Proceeding to checkout",
                    description: "Redirecting to payment page...",
                  });
                }}
              >
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
