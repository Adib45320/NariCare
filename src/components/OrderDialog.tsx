import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, ShoppingCart, ArrowRight, ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";

interface CartItem {
  value: string;
  label: string;
  unitPrice: number;
  quantity: number;
}

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const padOptions = [
  { value: "senora-15", label: "Senora Panty Sanitary Napkin - 15 Pads", price: 180 },
  { value: "joya-8", label: "Joya All Night Wings - 8 Pads", price: 120 },
  { value: "freedom-belt-8", label: "Freedom Sanitary Napkin Belt - 8 Pads", price: 95 },
  { value: "freedom-heavy-16", label: "Freedom Heavy Flow Wings - 16 Pieces", price: 185 },
  { value: "freedom-heavy-8", label: "Freedom Heavy Flow Wings - 8 Pads", price: 110 },
  { value: "freedom-popular-8", label: "Freedom Sanitary Napkin Popular - 8 Pads", price: 85 },
  { value: "freedom-heavy-30", label: "Freedom Heavy Flow - 30 Pads", price: 340 },
  { value: "freedom-cotton-8", label: "Freedom Heavy Flow Cotton - 8 Pads", price: 125 },
  { value: "freedom-belt-15", label: "Freedom Sanitary Napkin Belt - 15 Pads", price: 165 },
];

const paymentOptions = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "bank", label: "Bank Transfer" },
  { value: "cod", label: "Cash on Delivery" },
];

const OrderDialog = ({ open, onOpenChange }: OrderDialogProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPad, setSelectedPad] = useState("");
  const [selectedQty, setSelectedQty] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [address, setAddress] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentNumber = "01880919596";

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const addToCart = () => {
    if (!selectedPad) return;
    const pad = padOptions.find((p) => p.value === selectedPad);
    if (!pad) return;
    const qty = parseInt(selectedQty);
    const existing = cart.findIndex((c) => c.value === selectedPad);
    if (existing >= 0) {
      setCart(cart.map((c, i) => i === existing ? { ...c, quantity: c.quantity + qty } : c));
    } else {
      setCart([...cart, { value: pad.value, label: pad.label, unitPrice: pad.price, quantity: qty }]);
    }
    setSelectedPad("");
    setSelectedQty("1");
  };

  const removeFromCart = (value: string) => setCart(cart.filter((c) => c.value !== value));

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setCart([]);
      setSelectedPad("");
      setSelectedQty("1");
      setPaymentMethod("");
      setAddress("");
      setTransactionId("");
    }, 300);
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) { toast.error("Please enter your delivery address"); return; }
    if (paymentMethod !== "cod" && !transactionId.trim()) { toast.error("Please enter the transaction ID"); return; }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const orderPromises = cart.map((item) =>
        supabase.from("orders").insert({
          user_id: user?.id || null,
          product_name: item.label,
          quantity: item.quantity,
          total_price: item.unitPrice * item.quantity,
          status: "pending",
          delivery_status: "pending",
          transaction_id: transactionId || "COD",
          delivery_address: address,
        })
      );

      const results = await Promise.all(orderPromises);
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) throw errors[0].error;

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#ff6b9d", "#c44569", "#ffa502"] });
      toast.success("Order placed successfully! We'll deliver in 2-3 business days. 💕", { duration: 5000 });
      handleClose();
    } catch (error: any) {
      toast.error(`Failed to place order: ${error?.message || "Please try again."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {step === 1 ? "🛒 Select Your Products" : "📦 Delivery & Payment"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-5">
            {/* Product selector */}
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Choose a product</label>
                <Select value={selectedPad} onValueChange={setSelectedPad}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sanitary pads..." />
                  </SelectTrigger>
                  <SelectContent>
                    {padOptions.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label} — ৳{p.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                  <Select value={selectedQty} onValueChange={setSelectedQty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={addToCart} disabled={!selectedPad} className="gap-1">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Cart */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                Cart ({cart.length} items)
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No items yet — select a product above
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.value} className="flex items-center justify-between p-3 border rounded-lg bg-accent/5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          ৳{item.unitPrice} × {item.quantity} = ৳{item.unitPrice * item.quantity}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.value)}
                        className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}

                  <div className="flex justify-between font-semibold pt-1 px-1">
                    <span>Total</span>
                    <span className="text-primary">৳{total}</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              className="w-full gap-2"
              variant="cta"
              disabled={cart.length === 0}
              onClick={() => setStep(2)}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Order summary */}
            <div className="bg-accent/10 rounded-lg p-4 space-y-2">
              {cart.map((item) => (
                <div key={item.value} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-2">{item.label} ×{item.quantity}</span>
                  <span className="font-medium shrink-0">৳{item.unitPrice * item.quantity}</span>
                </div>
              ))}
              <Separator className="my-1" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">৳{total}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method <span className="text-destructive">*</span></label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose payment method..." />
                </SelectTrigger>
                <SelectContent>
                  {paymentOptions.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment number (bKash / Nagad) */}
            {(paymentMethod === "bkash" || paymentMethod === "nagad") && (
              <div className="bg-muted rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium">Send ৳{total} to this number:</p>
                <p className="text-lg font-bold font-mono text-primary">{paymentNumber}</p>
              </div>
            )}

            {/* Transaction ID */}
            {paymentMethod && paymentMethod !== "cod" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Transaction ID <span className="text-destructive">*</span></label>
                <Input
                  placeholder="Paste your transaction ID here"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
            )}

            {/* Delivery address */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery Address <span className="text-destructive">*</span></label>
              <Textarea
                placeholder="Enter your full delivery address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                variant="cta"
                className="flex-1"
                onClick={handlePlaceOrder}
                disabled={
                  isSubmitting ||
                  !paymentMethod ||
                  !address.trim() ||
                  ((paymentMethod === "bkash" || paymentMethod === "nagad") && !transactionId.trim())
                }
              >
                {isSubmitting ? "Placing Order..." : "Place Order 💕"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;
