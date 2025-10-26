import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";
import { ArrowLeft, Copy, Check } from "lucide-react";

interface OrderData {
  padType?: string;
  padLabel?: string;
  price?: number;
  quantity?: number;
  deliverySchedule: string;
  paymentMethod: string;
  // New cart format
  products?: Array<{
    value: string;
    label: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  total?: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state as OrderData;

  const [address, setAddress] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const paymentNumber = "01880919596";

  useEffect(() => {
    if (!orderData) {
      toast.error("No order data found. Please select your items first.");
      navigate("/");
    }
  }, [orderData, navigate]);

  if (!orderData) return null;

  // Support both old single-product and new multi-product cart formats
  const isCartFormat = orderData.products && orderData.products.length > 0;
  const totalAmount = isCartFormat ? (orderData.total || 0) : (orderData.price || 0) * (orderData.quantity || 0);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(paymentNumber);
    setCopied(true);
    toast.success("Number copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 1 },
        colors: ["#ff6b9d", "#c44569", "#ffa502", "#ff6348", "#ff4757"],
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 1 },
        colors: ["#ff6b9d", "#c44569", "#ffa502", "#ff6348", "#ff4757"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }

    if (!transactionId.trim()) {
      toast.error("Please enter the transaction ID");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (isCartFormat && orderData.products) {
        // Handle multiple products from cart
        const orderPromises = orderData.products.map(product => 
          supabase.from("orders").insert({
            user_id: user?.id || null,
            product_name: product.label,
            quantity: product.quantity,
            total_price: product.lineTotal,
            status: "pending",
            delivery_status: "pending",
            transaction_id: transactionId,
            delivery_address: address,
          })
        );

        const results = await Promise.all(orderPromises);
        const errors = results.filter(r => r.error);
        
        if (errors.length > 0) {
          throw errors[0].error;
        }
      } else {
        // Handle single product (old format)
        const { error } = await supabase.from("orders").insert({
          user_id: user?.id || null,
          product_name: orderData.padLabel || "",
          quantity: orderData.quantity || 0,
          total_price: totalAmount,
          status: "pending",
          delivery_status: "pending",
          transaction_id: transactionId,
          delivery_address: address,
        });

        if (error) throw error;
      }

      fireConfetti();
      
      toast.success("Thank you for ordering! We will ship out your order in one day and you will receive it in 2-3 business days.", {
        duration: 6000,
      });

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          Complete Your Order
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isCartFormat && orderData.products ? (
                <>
                  {/* Multi-product cart view */}
                  <div className="space-y-3">
                    {orderData.products.map((product, index) => (
                      <div key={index} className="pb-3 border-b last:border-b-0">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-sm">{product.label}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Qty: {product.quantity}</span>
                          <span>৳{product.unitPrice} × {product.quantity}</span>
                        </div>
                        <div className="text-right text-sm font-medium mt-1">
                          ৳{product.lineTotal}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Schedule</span>
                    <span className="font-medium">{orderData.deliverySchedule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium">{orderData.paymentMethod}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">৳{totalAmount}</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Single product view (old format) */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <span className="font-medium">{orderData.padLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">{orderData.quantity} pads</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per unit</span>
                    <span className="font-medium">৳{orderData.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Schedule</span>
                    <span className="font-medium">{orderData.deliverySchedule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium">{orderData.paymentMethod}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">৳{totalAmount}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment & Delivery Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Instructions */}
              {(orderData.paymentMethod === "bKash" || orderData.paymentMethod === "Nagad") && (
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Pay ৳{totalAmount} to this {orderData.paymentMethod} number:
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={paymentNumber}
                      readOnly
                      className="font-mono text-lg font-bold"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCopyNumber}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Transaction ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Transaction ID <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Enter your transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Copy the transaction ID from your payment app and paste it here
                </p>
              </div>

              {/* Delivery Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Delivery Address <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="Enter your full delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Place Order Button */}
              <Button
                variant="cta"
                className="w-full"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
