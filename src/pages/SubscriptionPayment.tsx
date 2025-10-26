import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, CreditCard, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";
import confetti from "canvas-confetti";
import heroBg from "@/assets/hero-bg.jpg";

const paymentSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(10, "Please provide a complete address"),
  paymentMethod: z.enum(["card", "bkash", "nagad"]),
  cardNumber: z.string().optional(),
  bkashNumber: z.string().optional(),
  nagadNumber: z.string().optional(),
});

const SubscriptionPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { products, total, deliveryDate, padType, quantity, padLabel, price, subscriptionPlan, subscriptionPrice } = location.state || {};

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [bkashNumber, setBkashNumber] = useState("");
  const [nagadNumber, setNagadNumber] = useState("");
  const [paymentNotificationDate, setPaymentNotificationDate] =
    useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Support both old single-product and new multi-product cart formats
  const isCartFormat = products && products.length > 0;

  if ((!isCartFormat && (!padType || !quantity || !deliveryDate)) || 
      (isCartFormat && (!products || !deliveryDate))) {
    navigate("/subscribe");
    return null;
  }

  const fireConfetti = () => {
    console.log("🎉 Firing confetti!");
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 10,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.8 },
        colors: ["#ff6b9d", "#c44569", "#ffa502", "#ff6348", "#ff4757"],
        zIndex: 9999,
      });
      confetti({
        particleCount: 10,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.8 },
        colors: ["#ff6b9d", "#c44569", "#ffa502", "#ff6348", "#ff4757"],
        zIndex: 9999,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form
      const validationData = {
        fullName,
        address,
        paymentMethod: paymentMethod as "card" | "bkash" | "nagad",
        cardNumber: paymentMethod === "card" ? cardNumber : undefined,
        bkashNumber: paymentMethod === "bkash" ? bkashNumber : undefined,
        nagadNumber: paymentMethod === "nagad" ? nagadNumber : undefined,
      };

      paymentSchema.parse(validationData);

      if (!paymentNotificationDate) {
        toast({
          title: "Error",
          description: "Please select a payment notification date",
          variant: "destructive",
        });
        return;
      }

      // Validate payment method specific fields
      if (paymentMethod === "card" && cardNumber.length < 16) {
        toast({
          title: "Error",
          description: "Please enter a valid card number",
          variant: "destructive",
        });
        return;
      }

      if (paymentMethod === "bkash" && bkashNumber.length < 11) {
        toast({
          title: "Error",
          description: "Please enter a valid bKash number",
          variant: "destructive",
        });
        return;
      }

      if (paymentMethod === "nagad" && nagadNumber.length < 11) {
        toast({
          title: "Error",
          description: "Please enter a valid Nagad number",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "Please login to continue",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Insert subscription data
      // For now, use the existing subscriptions table until Supabase types are regenerated
      
      if (isCartFormat && products) {
        // Handle multiple products from cart
        const subscriptionPromises = products.map((product: any) =>
          supabase.from("subscriptions").insert({
            user_id: user.id,
            full_name: fullName,
            pad_type: product.value,
            quantity: product.quantity,
            delivery_date: deliveryDate,
            delivery_address: address,
            subscription_start_date: new Date().toISOString().split("T")[0],
            payment_method: paymentMethod,
            payment_notification_date: paymentNotificationDate ? format(paymentNotificationDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            card_last_four: paymentMethod === "card" ? cardNumber.slice(-4) : null,
            bkash_number: paymentMethod === "bkash" ? bkashNumber : null,
            nagad_number: paymentMethod === "nagad" ? nagadNumber : null,
            status: "active",
          })
        );

        const results = await Promise.all(subscriptionPromises);
        const errors = results.filter((r) => r.error);

        if (errors.length > 0) {
          throw errors[0].error;
        }
      } else {
        // Handle single product (old format)
        const { error } = await supabase.from("subscriptions").insert({
          user_id: user.id,
          full_name: fullName,
          pad_type: padType,
          quantity: parseInt(quantity),
          delivery_date: deliveryDate,
          delivery_address: address,
          subscription_start_date: new Date().toISOString().split("T")[0],
          payment_method: paymentMethod,
          payment_notification_date: paymentNotificationDate ? format(paymentNotificationDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
          card_last_four: paymentMethod === "card" ? cardNumber.slice(-4) : null,
          bkash_number: paymentMethod === "bkash" ? bkashNumber : null,
          nagad_number: paymentMethod === "nagad" ? nagadNumber : null,
          status: "active",
        });

        if (error) throw error;
      }

      // Show success toast first
      toast({
        title: "Success! 🎉",
        description: "Your subscription has been activated",
      });

      // Fire confetti immediately after toast
      setTimeout(() => {
        fireConfetti();
      }, 100);

      // Navigate to dashboard after confetti
      setTimeout(() => {
        navigate("/dashboard");
      }, 3500);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.issues[0].message,
          variant: "destructive",
        });
      } else {
        console.error("Subscription error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to create subscription",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
        role="presentation"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-accent/90 via-primary/75 to-secondary/85 backdrop-blur-sm" />
      
      {/* Decorative Elements */}
      <div className="absolute top-32 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-32 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative container mx-auto px-4 max-w-2xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/subscribe")}
          className="mb-6 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
        >
          ← Back to Selection
        </Button>

        <Card className="p-8 shadow-2xl backdrop-blur-sm bg-white/95">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Payment Details 💳</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your complete delivery address"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Method</h3>

              <div className="space-y-2">
                <Label htmlFor="payment-method">Select Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Choose payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Card Details */}
              {paymentMethod === "card" && (
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your card will be charged monthly on your selected date
                  </p>
                </div>
              )}

              {/* bKash Details */}
              {paymentMethod === "bkash" && (
                <div className="space-y-2">
                  <Label htmlFor="bkash-number">bKash Number</Label>
                  <Input
                    id="bkash-number"
                    value={bkashNumber}
                    onChange={(e) =>
                      setBkashNumber(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    You'll receive a payment request on this number
                  </p>
                </div>
              )}

              {/* Nagad Details */}
              {paymentMethod === "nagad" && (
                <div className="space-y-2">
                  <Label htmlFor="nagad-number">Nagad Number</Label>
                  <Input
                    id="nagad-number"
                    value={nagadNumber}
                    onChange={(e) =>
                      setNagadNumber(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    You'll receive a payment request on this number
                  </p>
                </div>
              )}

              {/* Payment Notification Date */}
              <div className="space-y-2">
                <Label>Monthly Payment Notification Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !paymentNotificationDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentNotificationDate ? (
                        format(paymentNotificationDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={paymentNotificationDate}
                      onSelect={setPaymentNotificationDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  We'll send you an email reminder on this date each month
                </p>
              </div>
            </div>

            {/* Subscription Summary */}
            <div className="bg-accent/10 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">Subscription Summary</h3>
              <div className="text-sm space-y-1">
                {isCartFormat && products ? (
                  <>
                    {products.map((product: any, index: number) => (
                      <div key={index} className="pb-2 border-b last:border-b-0">
                        <p>
                          <span className="font-medium">{product.label}</span>
                        </p>
                        <p className="text-muted-foreground">
                          {product.quantity} pack(s) × ৳{product.unitPrice} = ৳{product.lineTotal}
                        </p>
                      </div>
                    ))}
                    <div className="pt-2 pb-2 border-b">
                      <p className="font-medium">
                        Products Subtotal: ৳{total}
                      </p>
                    </div>
                    {subscriptionPlan && (
                      <div className="pt-2 pb-2 border-b">
                        <p className="font-medium">
                          Subscription Fee ({subscriptionPlan}): ৳{subscriptionPrice || 100}
                        </p>
                      </div>
                    )}
                    <p className="pt-3 font-bold text-xl text-primary">
                      Total Amount: ৳{total + (subscriptionPrice || 100)}
                    </p>
                    <p className="pt-2">
                      <span className="font-medium">Delivery Date:</span>{" "}
                      {format(new Date(deliveryDate), "MMMM do")} of each month
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <span className="font-medium">Pad Type:</span>{" "}
                      {padType
                        .split("-")
                        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </p>
                    <p>
                      <span className="font-medium">Quantity:</span> {quantity}{" "}
                      pack(s)
                    </p>
                    <p>
                      <span className="font-medium">Delivery Date:</span>{" "}
                      {format(new Date(deliveryDate), "MMMM do")} of each month
                    </p>
                  </>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !paymentMethod}
              className="w-full"
              variant="cta"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Activate Subscription"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPayment;
