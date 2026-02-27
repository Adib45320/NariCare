import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { CalendarIcon, Package, CheckCircle2, Sparkles, ShoppingCart, Trash2, Plus, Info } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import heroBg from "@/assets/hero-bg.jpg";
import { toast } from "sonner";

interface CartItem {
  value: string;
  label: string;
  packs: string;
  price: string;
  quantity: number;
}

const SubscriptionSelection = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [nextPeriodDate, setNextPeriodDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchPeriodData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("period_data")
        .select("next_period_date")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data?.next_period_date) {
        setNextPeriodDate(parseISO(data.next_period_date));
      }
    };
    fetchPeriodData();
  }, []);

  const products = [
    { value: "senora-15", label: "Senora Panty Sanitary Napkin", packs: "15 Pads", price: "৳180", popular: false },
    { value: "joya-8", label: "Joya All Night Wings", packs: "8 Pads", price: "৳120", popular: true },
    { value: "freedom-belt-8", label: "Freedom Sanitary Napkin Belt", packs: "8 Pads", price: "৳95", popular: false },
    { value: "freedom-heavy-16", label: "Freedom Heavy Flow Wings", packs: "16 Pieces", price: "৳185", popular: false },
    { value: "freedom-heavy-8", label: "Freedom Heavy Flow Wings", packs: "8 Pads", price: "৳110", popular: false },
    { value: "freedom-popular-8", label: "Freedom Sanitary Napkin Popular", packs: "8 Pads", price: "৳85", popular: true },
    { value: "freedom-heavy-30", label: "Freedom Heavy Flow", packs: "30 Pads", price: "৳340", popular: false },
    { value: "freedom-cotton-8", label: "Freedom Heavy Flow Cotton", packs: "8 Pads", price: "৳125", popular: false },
    { value: "freedom-belt-15", label: "Freedom Sanitary Napkin Belt", packs: "15 Pads", price: "৳165", popular: false }
  ];

  const quantityOptions = [
    { value: "1", label: "1", savings: "" },
    { value: "2", label: "2", savings: "" },
    { value: "3", label: "3", savings: "" },
    { value: "4", label: "4", savings: "" },
    { value: "5", label: "5", savings: "" },
    { value: "6", label: "6", savings: "" },
    { value: "7", label: "7", savings: "" },
    { value: "8", label: "8", savings: "" },
    { value: "9", label: "9", savings: "" },
    { value: "10", label: "10", savings: "" },
  ];

  const parsePrice = (priceStr?: string) => {
    if (!priceStr) return 0;
    const cleaned = priceStr.replace(/[^0-9.-]+/g, "");
    const n = parseFloat(cleaned);
    return Number.isNaN(n) ? 0 : n;
  };

  const addToCart = () => {
    if (!selectedProduct || !quantity) {
      toast.error("Please select a product and quantity");
      return;
    }

    const product = products.find(p => p.value === selectedProduct);
    if (!product) return;

    // Check if item already in cart
    const existingItemIndex = cart.findIndex(item => item.value === selectedProduct);
    
    if (existingItemIndex >= 0) {
      // Update quantity
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += parseInt(quantity);
      setCart(newCart);
      toast.success("Updated quantity in cart");
    } else {
      // Add new item
      setCart([...cart, {
        value: product.value,
        label: product.label,
        packs: product.packs,
        price: product.price,
        quantity: parseInt(quantity)
      }]);
      toast.success("Added to subscription cart");
    }

    // Reset selection
    setSelectedProduct("");
    setQuantity("1");
  };

  const removeFromCart = (value: string) => {
    setCart(cart.filter(item => item.value !== value));
    toast.success("Removed from cart");
  };

  const updateCartQuantity = (value: string, quantity: number) => {
    const newCart = cart.map(item => 
      item.value === value ? { ...item, quantity } : item
    );
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = parsePrice(item.price);
      return total + (price * item.quantity);
    }, 0);
  };

  const handleContinueToPayment = () => {
    if (cart.length === 0) {
      toast.error("Please add items to cart before proceeding");
      return;
    }

    if (!deliveryDate) {
      toast.error("Please select a delivery date");
      return;
    }

    navigate("/subscribe/plan", {
      state: {
        products: cart.map(item => ({
          value: item.value,
          label: item.label,
          packs: item.packs,
          unitPrice: parsePrice(item.price),
          quantity: item.quantity,
          lineTotal: parsePrice(item.price) * item.quantity
        })),
        total: calculateTotal(),
        deliveryDate: format(deliveryDate, "yyyy-MM-dd"),
      },
    });
  };

  const isFormValid = cart.length > 0 && deliveryDate;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
        role="presentation"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-accent/80 backdrop-blur-sm" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative container mx-auto px-4 max-w-6xl py-8 space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
        >
          ← Back to Dashboard
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Selection Panel */}
          <Card className="p-8 shadow-2xl backdrop-blur-sm bg-white/95">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                Add Products
              </h2>
              <p className="text-sm text-muted-foreground">
                Build your monthly subscription
              </p>
            </div>

            <div className="space-y-6">
              {/* Product Selection */}
              <div className="space-y-2">
                <Label>Choose Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="h-14">
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem 
                        key={product.value} 
                        value={product.value}
                        className="cursor-pointer py-3"
                      >
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex-1">
                            <div className="font-semibold">{product.label}</div>
                            <div className="text-sm text-muted-foreground">{product.packs}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {product.popular && (
                              <Badge className="bg-accent text-xs">Popular</Badge>
                            )}
                            <span className="font-bold text-primary">{product.price}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity Selection */}
              <div className="space-y-2">
                <Label>Quantity (packs per month)</Label>
                <Select value={quantity} onValueChange={setQuantity}>
                  <SelectTrigger className="h-14">
                    <SelectValue placeholder="Select quantity" />
                  </SelectTrigger>
                  <SelectContent>
                    {quantityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Add to Cart Button */}
              <Button 
                variant="default"
                className="w-full h-12"
                onClick={addToCart}
                disabled={!selectedProduct || !quantity}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Subscription
              </Button>
            </div>
          </Card>

          {/* Cart Panel */}
          <Card className="p-8 shadow-2xl backdrop-blur-sm bg-white/95">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Subscription Cart</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShoppingCart className="h-5 w-5" />
                <span>{cart.length} items</span>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Your cart is empty</p>
                <p className="text-sm">Add products to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.value} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.label}</h4>
                        <p className="text-xs text-muted-foreground">{item.packs} - {item.price}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.value)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor={`qty-${item.value}`} className="text-sm text-muted-foreground">Qty:</label>
                      <select
                        id={`qty-${item.value}`}
                        className="rounded-md border px-2 py-1 text-sm"
                        value={item.quantity}
                        onChange={(e) => updateCartQuantity(item.value, parseInt(e.target.value))}
                        aria-label="Quantity"
                      >
                        {quantityOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <span className="ml-auto text-sm font-semibold">
                        ৳{parsePrice(item.price) * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Monthly Total:</span>
                    <span className="text-primary">৳{calculateTotal()}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Delivery Date Section */}
        {cart.length > 0 && (
          <Card className="p-8 shadow-2xl backdrop-blur-sm bg-white/95 max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-semibold">Pick Your Monthly Delivery Date</h3>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-14 text-lg border-2",
                      !deliveryDate && "text-muted-foreground",
                      deliveryDate && "border-primary bg-primary/5"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5" />
                    {deliveryDate ? (
                      <span className="font-semibold">
                        {format(deliveryDate, "MMMM do")} of each month
                      </span>
                    ) : (
                      <span>Select your preferred delivery date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    modifiers={nextPeriodDate ? { periodStart: [nextPeriodDate] } : {}}
                    modifiersClassNames={{
                      periodStart: "bg-red-100 text-red-700 font-bold ring-2 ring-red-400 ring-offset-1 rounded-full",
                    }}
                  />
                  {nextPeriodDate && (
                    <div className="px-3 pb-3 text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="mt-0.5 text-red-400">●</span>
                      <span>Highlighted date = predicted period start ({format(nextPeriodDate, "MMM d")})</span>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4" />
                Your subscription will arrive on this date every month
              </p>

              {nextPeriodDate && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    Your period tracker shows your period might start on{" "}
                    <span className="font-semibold">{format(nextPeriodDate, "MMMM d")}</span>.
                    We recommend setting your delivery date to{" "}
                    <button
                      type="button"
                      className="font-semibold underline underline-offset-2 hover:text-red-900"
                      onClick={() => setDeliveryDate(subDays(nextPeriodDate, 2))}
                    >
                      {format(subDays(nextPeriodDate, 2), "MMMM d")}
                    </button>{" "}
                    (2 days before) so your pads arrive just in time.
                  </p>
                </div>
              )}

              <Button
                onClick={handleContinueToPayment}
                disabled={!isFormValid}
                className="w-full h-14 text-lg"
                variant="cta"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Continue to Payment
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSelection;
