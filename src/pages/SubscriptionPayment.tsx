import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CalendarIcon, CreditCard, Loader2, Info } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
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
  const [flatNumber, setFlatNumber] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [roadNumber, setRoadNumber] = useState("");
  const [areaCity, setAreaCity] = useState("");

  // Combine address fields into a single string for DB
  const address = [
    flatNumber && `Flat: ${flatNumber}`,
    buildingName && `Building: ${buildingName}`,
    roadNumber && `Road: ${roadNumber}`,
    areaCity && `Area/City: ${areaCity}`,
  ].filter(Boolean).join(", ");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [bkashNumber, setBkashNumber] = useState("");
  const [nagadNumber, setNagadNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [notificationDate, setNotificationDate] = useState<Date | null>(null);
  const [hasPeriodData, setHasPeriodData] = useState<boolean | null>(null); // null = loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPeriodData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setHasPeriodData(false); return; }
      const { data } = await supabase
        .from("period_data")
        .select("next_period_date")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data?.next_period_date) {
        setNotificationDate(subDays(parseISO(data.next_period_date), 3));
        setHasPeriodData(true);
      } else {
        setHasPeriodData(false);
      }
    };
    fetchPeriodData();
  }, []);

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

      // Validate required address fields individually
      if (!flatNumber.trim()) {
        toast({ title: "Error", description: "Please enter your flat / apartment number", variant: "destructive" });
        return;
      }
      if (!buildingName.trim()) {
        toast({ title: "Error", description: "Please enter your building name and number", variant: "destructive" });
        return;
      }
      if (!areaCity.trim()) {
        toast({ title: "Error", description: "Please enter your area or city", variant: "destructive" });
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

      if (paymentMethod === "bkash" && !transactionId.trim()) {
        toast({
          title: "Error",
          description: "Please enter your bKash Transaction ID",
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

      if (paymentMethod === "nagad" && !transactionId.trim()) {
        toast({
          title: "Error",
          description: "Please enter your Nagad Transaction ID",
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
            plan_name: subscriptionPlan || "Basic",
            pad_type: product.value,
            quantity: product.quantity,
            total_price: (total || 0) + (subscriptionPrice || 100),
            delivery_date: deliveryDate,
            delivery_address: address,
            subscription_start_date: new Date().toISOString().split("T")[0],
            payment_method: paymentMethod,
            payment_notification_date: notificationDate ? format(notificationDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            card_last_four: paymentMethod === "card" ? cardNumber.slice(-4) : null,
            bkash_number: paymentMethod === "bkash" ? bkashNumber : null,
            nagad_number: paymentMethod === "nagad" ? nagadNumber : null,
            transaction_id: ["bkash", "nagad"].includes(paymentMethod) ? transactionId : null,
            status: "not_verified",
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
          plan_name: subscriptionPlan || "Basic",
          pad_type: padType,
          quantity: parseInt(quantity),
          total_price: (price || 0) + (subscriptionPrice || 100),
          delivery_date: deliveryDate,
          delivery_address: address,
          subscription_start_date: new Date().toISOString().split("T")[0],
          payment_method: paymentMethod,
          payment_notification_date: notificationDate ? format(notificationDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
          card_last_four: paymentMethod === "card" ? cardNumber.slice(-4) : null,
          bkash_number: paymentMethod === "bkash" ? bkashNumber : null,
          nagad_number: paymentMethod === "nagad" ? nagadNumber : null,
          transaction_id: ["bkash", "nagad"].includes(paymentMethod) ? transactionId : null,
          status: "not_verified",
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

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Delivery Address</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="flat-number">Flat / Apartment No. <span className="text-destructive">*</span></Label>
                    <Input
                      id="flat-number"
                      value={flatNumber}
                      onChange={(e) => setFlatNumber(e.target.value)}
                      placeholder="e.g. Flat 4B"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="building-name">Building Name & No. <span className="text-destructive">*</span></Label>
                    <Input
                      id="building-name"
                      value={buildingName}
                      onChange={(e) => setBuildingName(e.target.value)}
                      placeholder="e.g. Rose Villa, 12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="road-number">
                    Road Number{" "}
                    <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="road-number"
                    value={roadNumber}
                    onChange={(e) => setRoadNumber(e.target.value)}
                    placeholder="e.g. Road 5"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="area-city">Area / City <span className="text-destructive">*</span></Label>
                  <Input
                    id="area-city"
                    value={areaCity}
                    onChange={(e) => setAreaCity(e.target.value)}
                    placeholder="e.g. Shantinagar, Dhaka"
                    required
                  />
                </div>
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
                <div className="space-y-4 rounded-xl border border-pink-100 bg-pink-50/50 p-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="bkash-txn">bKash Transaction ID</Label>
                    <Input
                      id="bkash-txn"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.trim())}
                      placeholder="e.g. 8N6Y9AB1CX"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the Transaction ID from your bKash confirmation SMS
                    </p>
                  </div>
                </div>
              )}

              {/* Nagad Details */}
              {paymentMethod === "nagad" && (
                <div className="space-y-4 rounded-xl border border-orange-100 bg-orange-50/50 p-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="nagad-txn">Nagad Transaction ID</Label>
                    <Input
                      id="nagad-txn"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.trim())}
                      placeholder="e.g. NA8Y9AB1CX"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the Transaction ID from your Nagad confirmation SMS
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Notification Date */}
              <div className="space-y-2">
                <Label>Monthly Payment Notification Date</Label>

                {hasPeriodData ? (
                  // Auto date from period tracker
                  <>
                    <div className="flex items-center gap-2 h-10 rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{format(notificationDate!, "MMMM do, yyyy")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Auto-set 3 days before your predicted period start — so your pads arrive right on time.
                    </p>
                  </>
                ) : (
                  // No period data — recommend tracker, fall back to manual picker
                  <>
                    <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                      <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          Use the Period Tracker for a smarter reminder!
                        </p>
                        <p className="text-muted-foreground text-xs">
                          If you log your cycle in the{" "}
                          <Link
                            to="/period-tracker"
                            className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80"
                          >
                            Period Tracker
                          </Link>
                          , we'll automatically set your notification 3 days before your predicted period. Otherwise, pick a date below.
                        </p>
                      </div>
                    </div>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !notificationDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {notificationDate
                            ? format(notificationDate, "MMMM do, yyyy")
                            : "Pick your preferred reminder date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={notificationDate ?? undefined}
                          onSelect={(d) => setNotificationDate(d ?? null)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      We'll send you a monthly reminder on this date.
                    </p>
                  </>
                )}
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
              disabled={
                isSubmitting ||
                !fullName.trim() ||
                !flatNumber.trim() ||
                !buildingName.trim() ||
                !areaCity.trim() ||
                !paymentMethod ||
                (paymentMethod === "card" && cardNumber.length < 16) ||
                (paymentMethod === "bkash" && (bkashNumber.length < 11 || !transactionId.trim())) ||
                (paymentMethod === "nagad" && (nagadNumber.length < 11 || !transactionId.trim())) ||
                !notificationDate
              }
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
