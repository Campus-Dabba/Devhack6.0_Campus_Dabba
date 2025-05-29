"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CartItem } from "@/components/student/dashboard/types";
import { loadRazorpay, initiatePayment } from "@/lib/razorpay";
import { toPaise, formatPrice } from "@/lib/utils";

interface CartItem {
  id: string;
  item_name: string;
  quantity: number;
  price: number;
  cook_id: string;
}

export default function CheckoutPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const supabase = createClient();

  // Helper function to calculate the total price of all items in the cart
  const getCartTotal = (): number => {
    return cart.reduce((total: number, item: CartItem) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Load Razorpay SDK
  useEffect(() => {
    const loadRazorpaySDK = async () => {
      const isLoaded = await loadRazorpay();
      setRazorpayLoaded(isLoaded);
    };
    loadRazorpaySDK();
  }, []);

  useEffect(() => {
    // Immediately check authentication state
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw new Error("Authentication error: " + sessionError.message);
        }
        
        if (!session) {
          console.log("No active session found");
          setIsLoggedIn(false);
          return;
        }
        
        setIsLoggedIn(true);
        
        // Fetch user profile data with proper schema
        const { data: userProfile, error: userError } = await supabase
          .from("users")
          .select(`
            id,
            email,
            first_name,
            last_name,
            phone,
            role,
            created_at,
            profile_image,
            address,
            user_preferences
          `)
          .eq("id", session.user.id)
          .single();
        
        if (userError && userError.code !== "PGRST116") { // Not a "no rows" error
          console.error("Error fetching user profile:", userError);
          throw new Error("Failed to load user data: " + userError.message);
        }
        
        // Fetch user auth data for email
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Auth data error:", authError);
          throw new Error("Failed to load auth data: " + authError.message);
        }
        
        // Combine data from both sources
        const combinedUserData = {
          id: session.user.id,
          email: userProfile?.email || authData.user?.email || "",
          first_name: userProfile?.first_name || "",
          last_name: userProfile?.last_name || "",
          phone: userProfile?.phone || "",
          address: userProfile?.address || {
            street: "",
            city: "",
            state: "",
            pincode: ""
          }
        };
        
        setUserData(combinedUserData);
      } catch (error) {
        console.error("Error in checkout auth check:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Redirect if cart is empty
    if (cart.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Please add items to your cart before checking out."
      });
      router.push("/");
    }
  }, [supabase, router, cart]);

  const handlePayment = async () => {
    if (!isLoggedIn || !userData) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to complete your purchase.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setProcessingPayment(true);
      
      // Create order in database first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error("Authentication required");
      }
      
      // Validate that we have proper user data
      if (!userData.first_name || !userData.last_name) {
        throw new Error("Please complete your profile with your name before checkout");
      }
      
      if (!userData.address?.street || !userData.address?.city || 
          !userData.address?.state || !userData.address?.pincode) {
        throw new Error("Please add a complete delivery address to your profile");
      }
      
      // Validate cart items
      if (!cart.length) {
        throw new Error("Cart is empty");
      }

      // Validate menu IDs
      const invalidItems = cart.filter(item => !item.id || typeof item.id !== 'string' || !item.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i));
      if (invalidItems.length > 0) {
        console.error("Invalid menu items:", invalidItems);
        throw new Error("Invalid menu items in cart");
      }
      
      const orderData = {
        user_id: session.user.id,
        cook_id: cart[0].cook_id,
        status: "pending",
        total: getCartTotal() * 1.18,
        payment_method: paymentMethod,
        payment_status: "pending",
        delivery_address: userData.address,
        created_at: new Date().toISOString()
      };
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();
      
      if (orderError) {
        console.error("Order creation error:", orderError);
        throw new Error("Failed to create order: " + orderError.message);
      }
      
      // Create order items with proper UUID validation
      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_id: item.id.trim(), // Ensure clean UUID
        quantity: item.quantity,
        price_at_time: item.price
      }));
      
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      
      if (itemsError) {
        console.error("Order items error:", itemsError);
        // If order items fail, we should delete the order
        await supabase
          .from("orders")
          .delete()
          .eq("id", order.id);
        throw new Error("Failed to add items to order: " + itemsError.message);
      }
      
      // If cash on delivery, just complete the order
      if (paymentMethod === "cash") {
        clearCart();
        toast({
          title: "Order placed successfully!",
          description: "Your order has been placed with cash on delivery.",
        });
        router.push(`/orders/${order.id}`);
        return;
      }
      
      // For online payment
      if (paymentMethod === "online" && razorpayLoaded) {
        try {
          // Get cook details for receipt
          const { data: cookData } = await supabase
            .from("cooks")
            .select("first_name, last_name")
            .eq("cook_id", cart[0].cook_id)
            .single();
            
          const cookName = cookData 
            ? `${cookData.first_name} ${cookData.last_name}`
            : "Dabba Provider";
          
          // Calculate total with tax
          const totalAmount = getCartTotal() * 1.18;
          
          // Start Razorpay payment
          const paymentResponse = await initiatePayment({
            amount: toPaise(totalAmount),
            currency: "INR",
            name: "Campus Dabba",
            description: `Payment for order #${order.id.substring(0, 8)}`,
            image: "/logo.svg",
            prefill: {
              name: `${userData.first_name} ${userData.last_name}`,
              email: userData.email,
              contact: userData.phone
            },
            notes: {
              order_id: order.id,
              address: `${userData.address.street}, ${userData.address.city}, ${userData.address.state} ${userData.address.pincode}`
            },
            theme: {
              color: "#FF5722"
            }
          });
          
          // Update order status to paid
          const { error: updateError } = await supabase
            .from("orders")
            .update({
              status: "paid",
              payment_status: "paid",
              payment_id: paymentResponse.razorpay_payment_id,
              updated_at: new Date().toISOString()
            })
            .eq("id", order.id);
            
          if (updateError) {
            console.error("Order update error:", updateError);
            // Continue anyway as payment was successful
          }
          
          // Add to cook payments
          const { error: paymentError } = await supabase
            .from("cook_payments")
            .insert({
              cook_id: cart[0].cook_id,
              order_id: order.id,
              amount: totalAmount,
              status: "pending",
              created_at: new Date().toISOString()
            });
            
          if (paymentError) {
            console.error("Payment record error:", paymentError);
            // Continue anyway as payment was successful
          }
          
          clearCart();
          toast({
            title: "Payment successful!",
            description: "Your order has been placed and payment received.",
          });
          
          router.push(`/orders/${order.id}`);
        } catch (paymentError) {
          console.error("Razorpay error:", paymentError);
          
          // Update order status to payment_failed
          await supabase
            .from("orders")
            .update({
              status: "payment_failed",
              payment_status: "failed",
              updated_at: new Date().toISOString()
            })
            .eq("id", order.id);
            
          throw new Error("Payment failed: " + (paymentError instanceof Error ? paymentError.message : "Unknown payment error"));
        }
      }
    } catch (error) {
      console.error("Payment process error:", error);
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "There was a problem processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  // Function to check if we have complete profile info
  const hasCompleteProfile = (): boolean => {
    if (!userData) return false;
    
    return !!(
      userData.first_name && 
      userData.last_name && 
      userData.email &&
      userData.phone &&
      userData.address?.street &&
      userData.address?.city &&
      userData.address?.state &&
      userData.address?.pincode
    );
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading user data...</span>
                </div>
              ) : isLoggedIn ? (
                userData ? (
                  <CardDescription>
                    {userData.first_name || "No name"} {userData.last_name || ""} • {userData.email}
                  </CardDescription>
                ) : (
                  <CardDescription>User data loaded</CardDescription>
                )
              ) : (
                <CardDescription>Please login to continue</CardDescription>
              )}
            </CardHeader>
            
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {isLoggedIn ? (
                userData ? (
                  <>
                    {!hasCompleteProfile() && (
                      <Alert className="mb-4 bg-amber-50 border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-600">Incomplete Profile</AlertTitle>
                        <AlertDescription className="text-amber-700">
                          Please complete your profile before checkout.
                          <Button asChild variant="outline" className="ml-2 mt-2">
                            <Link href="/profile">Update Profile</Link>
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                  
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            value={userData.first_name || "Not provided"} 
                            readOnly 
                            className={!userData.first_name ? "border-red-300 bg-red-50" : ""}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            value={userData.last_name || "Not provided"} 
                            readOnly 
                            className={!userData.last_name ? "border-red-300 bg-red-50" : ""}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={userData.email} readOnly />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input 
                          id="phone" 
                          value={userData.phone || "Not provided"} 
                          readOnly 
                          className={!userData.phone ? "border-red-300 bg-red-50" : ""}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="address">Delivery Address</Label>
                        <Input 
                          id="address" 
                          value={userData.address ? 
                            `${userData.address.street || ""}, ${userData.address.city || ""}, ${userData.address.state || ""} ${userData.address.pincode || ""}` : 
                            "No address provided"} 
                          readOnly 
                          className={!userData.address?.street ? "border-red-300 bg-red-50" : ""}
                        />
                        {!userData.address?.street && (
                          <p className="text-red-500 text-sm mt-1">
                            Please add a delivery address in your profile
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                          <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                            <RadioGroupItem value="cash" id="cashOnDelivery" />
                            <Label htmlFor="cashOnDelivery" className="cursor-pointer">Cash on Delivery</Label>
                          </div>
                          <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                            <RadioGroupItem value="online" id="online" />
                            <Label htmlFor="online" className="cursor-pointer">Pay Online (Razorpay)</Label>
                            {!razorpayLoaded && <span className="text-sm text-muted-foreground ml-2">(Loading...)</span>}
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Link href="/profile" className="text-primary hover:underline">
                      Please complete your profile to continue
                    </Link>
                  </div>
                )
              ) : (
                <Tabs defaultValue="login">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login" className="py-4">
                    <div className="text-center">
                      <Button asChild>
                        <Link href="/login?redirect=/checkout">Login</Link>
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="register" className="py-4">
                    <div className="text-center">
                      <Button asChild>
                        <Link href="/register?redirect=/checkout">Register</Link>
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.item_name} x {item.quantity}
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{getCartTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax (18%)</span>
                  <span>₹{(getCartTotal() * 0.18).toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{(getCartTotal() * 1.18).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handlePayment} 
                disabled={
                  !isLoggedIn || 
                  processingPayment || 
                  !userData || 
                  !hasCompleteProfile() || 
                  (paymentMethod === "online" && !razorpayLoaded)
                }
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  paymentMethod === "cash" ? 
                    "Place Order (Cash on Delivery)" : 
                    `Pay ₹${(getCartTotal() * 1.18).toFixed(2)}`
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}