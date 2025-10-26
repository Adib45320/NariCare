import { Button } from "@/components/ui/button";
import { Check, ShoppingCart, Trash2, Plus } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CartItem {
  value: string;
  label: string;
  price: string;
  quantity: number;
}

const Pricing = () => {
  const navigate = useNavigate();
  const [selectedPad, setSelectedPad] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const padOptions = [
    { value: "senora-15", label: "Senora Panty Sanitary Napkin - 15 Pads (15pcs)", price: "৳180" },
    { value: "joya-8", label: "Joya All Night Wings - 8 Pads", price: "৳120" },
    { value: "freedom-belt-8", label: "Freedom Sanitary Napkin Belt - 8 Pads", price: "৳95" },
    { value: "freedom-heavy-16", label: "Freedom Heavy Flow Wings - 16 Pieces", price: "৳185" },
    { value: "freedom-heavy-8", label: "Freedom Heavy Flow Wings - 8 Pads", price: "৳110" },
    { value: "freedom-popular-8", label: "Freedom Sanitary Napkin Popular - 8 Pads", price: "৳85" },
    { value: "freedom-heavy-30", label: "Freedom Heavy Flow - 30 Pads", price: "৳340" },
    { value: "freedom-cotton-8", label: "Freedom Heavy Flow Cotton - 8 Pads", price: "৳125" },
    { value: "freedom-belt-15", label: "Freedom Sanitary Napkin Belt - 15 Pads", price: "৳165" }
  ];

  const quantityOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}`
  }));

  const dateOptions = [
    { value: "weekly", label: "Weekly Delivery" },
    { value: "monthly", label: "Monthly Delivery" },
    { value: "custom", label: "Custom Schedule" }
  ];

  const paymentOptions = [
    { value: "bkash", label: "bKash" },
    { value: "nagad", label: "Nagad" },
    { value: "rocket", label: "Rocket" },
    { value: "bank", label: "Bank Transfer" },
    { value: "cod", label: "Cash on Delivery" }
  ];

  const parsePrice = (priceStr?: string) => {
    if (!priceStr) return 0;
    const cleaned = priceStr.replace(/[^0-9.-]+/g, "");
    const n = parseFloat(cleaned);
    return Number.isNaN(n) ? 0 : n;
  };

  const addToCart = () => {
    if (!selectedPad || !selectedQuantity) {
      toast.error("Please select a product and quantity");
      return;
    }

    const selectedPadOption = padOptions.find(p => p.value === selectedPad);
    if (!selectedPadOption) return;

    // Check if item already in cart
    const existingItemIndex = cart.findIndex(item => item.value === selectedPad);
    
    if (existingItemIndex >= 0) {
      // Update quantity
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += parseInt(selectedQuantity);
      setCart(newCart);
      toast.success("Updated quantity in cart");
    } else {
      // Add new item
      setCart([...cart, {
        value: selectedPadOption.value,
        label: selectedPadOption.label,
        price: selectedPadOption.price,
        quantity: parseInt(selectedQuantity)
      }]);
      toast.success("Added to cart");
    }

    // Reset selection
    setSelectedPad("");
    setSelectedQuantity("1");
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

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Please add items to cart before proceeding to checkout");
      return;
    }

    if (!selectedDate || !selectedPayment) {
      toast.error("Please select delivery schedule and payment method");
      return;
    }

    const total = calculateTotal();

    navigate("/checkout", {
      state: {
        products: cart.map(item => ({
          value: item.value,
          label: item.label,
          unitPrice: parsePrice(item.price),
          quantity: item.quantity,
          lineTotal: parsePrice(item.price) * item.quantity
        })),
        total,
        deliverySchedule: dateOptions.find(d => d.value === selectedDate)?.label || "",
        paymentMethod: paymentOptions.find(p => p.value === selectedPayment)?.label || "",
      }
    });
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Build Your Order
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select products, add to cart, and proceed to checkout
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Product Selection */}
          <div className="bg-card rounded-3xl p-8 shadow-card">
            <h3 className="text-xl font-semibold mb-6">Select Products</h3>
            <div className="space-y-6">
              {/* Pad Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Choose Product
                </label>
                <Select value={selectedPad} onValueChange={setSelectedPad}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {padOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} - {option.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Quantity
                </label>
                <Select value={selectedQuantity} onValueChange={setSelectedQuantity}>
                  <SelectTrigger className="w-full">
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
                className="w-full rounded-xl"
                onClick={addToCart}
                disabled={!selectedPad || !selectedQuantity}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>

          {/* Cart */}
          <div className="bg-card rounded-3xl p-8 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Cart</h3>
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
                        <p className="text-sm text-muted-foreground">{item.price}</p>
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
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>৳{calculateTotal()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delivery & Payment Options */}
        {cart.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-card rounded-3xl p-8 shadow-card">
              <h3 className="text-xl font-semibold mb-6">Delivery & Payment</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Date/Delivery Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Delivery Schedule
                  </label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select delivery schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Payment Method
                  </label>
                  <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <div className="pt-6">
                <Button 
                  variant="cta"
                  className="w-full rounded-xl"
                  onClick={handleCheckout}
                  disabled={!selectedDate || !selectedPayment}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Pricing;
