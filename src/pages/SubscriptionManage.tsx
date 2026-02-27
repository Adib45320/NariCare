import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart, Package, MapPin, CreditCard, CalendarDays, Edit3, Check, X, Sparkles, Clock, Receipt, ShieldCheck, AlertCircle } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import heroBg from "@/assets/hero-bg.jpg";

// Same product catalogue as SubscriptionSelection.tsx
const PAD_PRODUCTS = [
  { value: "senora-15",       label: "Senora Panty Sanitary Napkin",  packs: "15 Pads",    price: 180 },
  { value: "joya-8",          label: "Joya All Night Wings",          packs: "8 Pads",     price: 120 },
  { value: "freedom-belt-8",  label: "Freedom Sanitary Napkin Belt", packs: "8 Pads",     price: 95  },
  { value: "freedom-heavy-16",label: "Freedom Heavy Flow Wings",      packs: "16 Pieces",  price: 185 },
  { value: "freedom-heavy-8", label: "Freedom Heavy Flow Wings",      packs: "8 Pads",     price: 110 },
  { value: "freedom-popular-8",label:"Freedom Sanitary Napkin Popular",packs: "8 Pads",   price: 85  },
  { value: "freedom-heavy-30",label: "Freedom Heavy Flow",            packs: "30 Pads",    price: 340 },
  { value: "freedom-cotton-8",label: "Freedom Heavy Flow Cotton",     packs: "8 Pads",     price: 125 },
  { value: "freedom-belt-15", label: "Freedom Sanitary Napkin Belt", packs: "15 Pads",    price: 165 },
];

const getPadProduct = (value: string) =>
  PAD_PRODUCTS.find(p => p.value === value) ?? PAD_PRODUCTS.find(p => p.label === value) ?? PAD_PRODUCTS[0];

// Subscription platform fee (Basic plan)
const SUBSCRIPTION_FEE = 100;

const SubscriptionManage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/login"); return; }
      setUser(session.user);
      fetchSubscription(session.user.id);
      fetchOrders(session.user.id);
    });
  }, [navigate]);

  const fetchSubscription = async (userId: string) => {
    const { data, error } = await supabase
      .from("subscriptions").select("*").eq("user_id", userId)
      .in("status", ["active", "not_verified"]).maybeSingle();
    if (error) {
      toast({ title: "Error", description: "Failed to load subscription details", variant: "destructive" });
    } else if (data) {
      setSubscription(data); setEditedData(data);
    } else {
      toast({ title: "No Subscription", description: "You don't have an active subscription yet" });
      navigate("/subscribe");
    }
    setIsLoading(false);
  };

  const fetchOrders = async (userId: string) => {
    const { data } = await supabase.from("orders").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(10);
    setOrders(data || []);
  };

  // Dynamically compute total when editing
  const computedTotal = (() => {
    const product = getPadProduct(editedData.pad_type);
    const qty = Number(editedData.quantity) || 1;
    return product.price * qty + SUBSCRIPTION_FEE;
  })();

  const handleSaveChanges = async () => {
    if (!subscription || !user) return;
    setIsSaving(true);
    const newTotal = computedTotal;
    const { error } = await supabase.from("subscriptions").update({
      pad_type: editedData.pad_type,
      quantity: editedData.quantity,
      delivery_date: editedData.delivery_date,
      delivery_address: editedData.delivery_address,
      payment_method: editedData.payment_method,
      card_last_four: editedData.card_last_four,
      bkash_number: editedData.bkash_number,
      nagad_number: editedData.nagad_number,
      total_price: newTotal,
    }).eq("id", subscription.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update subscription", variant: "destructive" });
    } else {
      const updatedData = { ...editedData, total_price: newTotal };
      toast({ title: "Saved! 💕", description: "Your subscription has been updated" });
      setSubscription(updatedData); setEditedData(updatedData); setIsEditing(false);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mx-auto animate-pulse">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <p className="text-rose-400 font-medium">Loading your subscription...</p>
        </div>
      </div>
    );
  }

  if (!subscription) return null;

  const isVerified = subscription.status === "active";

  const paymentLabel = (method: string) => {
    if (method === "bkash") return "bKash";
    if (method === "nagad") return "Nagad";
    if (method === "card") return "Card";
    return method || "—";
  };

  const paymentNumber = subscription.payment_method === "bkash" ? subscription.bkash_number
    : subscription.payment_method === "nagad" ? subscription.nagad_number
    : subscription.card_last_four ? `•••• ${subscription.card_last_four}` : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/60 to-purple-50">

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 220 }}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/80 via-pink-500/70 to-purple-500/60" />
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-pink-300/20 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 py-10 flex flex-col gap-3">
          <button onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors w-fit">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white leading-tight">My Subscription</h1>
              <p className="text-white/75 text-sm">Manage your NariCare care package 💕</p>
            </div>
          </div>

          {/* status pill */}
          <div className="mt-1">
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-400/20 border border-green-300/40 text-green-100 text-xs font-semibold backdrop-blur-sm">
                <ShieldCheck className="h-3.5 w-3.5" /> Active & Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-400/20 border border-orange-300/40 text-orange-100 text-xs font-semibold backdrop-blur-sm">
                <AlertCircle className="h-3.5 w-3.5" /> Payment Not Verified Yet
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">

        {/* Unverified notice */}
        {!isVerified && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-sm text-orange-700">
              Your payment is being reviewed by our team. We'll verify your transaction ID and activate your subscription within 24 hours. 🌸
            </p>
          </div>
        )}

        {/* ── Subscription overview card ── */}
        <div className="rounded-3xl bg-white border border-pink-100 shadow-sm overflow-hidden">
          {/* card top bar */}
          <div className="px-6 pt-6 pb-4 border-b border-pink-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-pink-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Subscription Details</h2>
                <p className="text-xs text-muted-foreground">Your care package preferences</p>
              </div>
            </div>
            {!isEditing ? (
              <Button size="sm" variant="ghost"
                className="gap-1.5 text-pink-600 hover:bg-pink-50 hover:text-pink-700 rounded-xl"
                onClick={() => setIsEditing(true)}>
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost"
                  className="gap-1.5 text-gray-500 hover:bg-gray-100 rounded-xl"
                  onClick={() => { setIsEditing(false); setEditedData(subscription); }}>
                  <X className="h-3.5 w-3.5" /> Cancel
                </Button>
                <Button size="sm"
                  className="gap-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
                  onClick={handleSaveChanges} disabled={isSaving}>
                  <Check className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Plan name */}
            <div className="sm:col-span-2 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 px-5 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                <Package className="h-6 w-6 text-pink-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Plan</p>
                <p className="text-xl font-bold text-gray-800">{subscription.plan_name || "Basic"} Plan</p>
                {isEditing ? (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {getPadProduct(editedData.pad_type).label} × {editedData.quantity || 1} pack(s)
                      </span>
                      <span className="font-medium text-gray-700">
                        ৳{(getPadProduct(editedData.pad_type).price * (Number(editedData.quantity) || 1)).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subscription fee</span>
                      <span className="font-medium text-gray-700">৳{SUBSCRIPTION_FEE}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-pink-200 pt-1 mt-1">
                      <span className="font-bold text-gray-800">New Total</span>
                      <span className="font-bold text-pink-600 text-base">৳{computedTotal.toFixed(0)} / month</span>
                    </div>
                  </div>
                ) : (
                  subscription.total_price && (
                    <p className="text-sm text-pink-600 font-semibold">৳{Number(subscription.total_price).toFixed(0)} / month</p>
                  )
                )}
              </div>
            </div>

            {/* Pad type */}
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Pad Type</Label>
              {isEditing ? (
                <Select value={editedData.pad_type} onValueChange={(v) => setEditedData({ ...editedData, pad_type: v })}>
                  <SelectTrigger className="rounded-xl border-pink-200 focus:ring-pink-300"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAD_PRODUCTS.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label} — {p.packs} (৳{p.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div>
                  <p className="text-base font-semibold text-gray-800">{getPadProduct(subscription.pad_type)?.label || subscription.pad_type || "—"}</p>
                  <p className="text-xs text-muted-foreground">{getPadProduct(subscription.pad_type)?.packs}</p>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Quantity</Label>
              {isEditing ? (
                <Input type="number" min="1" value={editedData.quantity}
                  onChange={(e) => setEditedData({ ...editedData, quantity: parseInt(e.target.value) })}
                  className="rounded-xl border-pink-200 focus:ring-pink-300" />
              ) : (
                <p className="text-base font-semibold text-gray-800">{subscription.quantity} pack{subscription.quantity !== 1 ? "s" : ""} / month</p>
              )}
            </div>

            {/* Delivery date */}
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> Delivery Date
              </Label>
              {isEditing ? (
                <Input type="date" value={editedData.delivery_date}
                  onChange={(e) => setEditedData({ ...editedData, delivery_date: e.target.value })}
                  className="rounded-xl border-pink-200 focus:ring-pink-300" />
              ) : (
                <p className="text-base font-semibold text-gray-800">
                  {subscription.delivery_date
                    ? format(new Date(subscription.delivery_date), "do 'of each month'")
                    : "—"}
                </p>
              )}
            </div>

            {/* Started */}
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" /> Subscribed On
              </Label>
              <p className="text-base font-semibold text-gray-800">
                {subscription.subscription_start_date
                  ? format(new Date(subscription.subscription_start_date), "MMM d, yyyy")
                  : subscription.created_at ? format(parseISO(subscription.created_at), "MMM d, yyyy") : "—"}
              </p>
            </div>

            {/* Address */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Delivery Address
              </Label>
              {isEditing ? (
                <Input value={editedData.delivery_address || ""}
                  onChange={(e) => setEditedData({ ...editedData, delivery_address: e.target.value })}
                  className="rounded-xl border-pink-200 focus:ring-pink-300" />
              ) : (
                <p className="text-sm text-gray-700 bg-pink-50/50 rounded-xl px-4 py-3 border border-pink-100">
                  {subscription.delivery_address || "—"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Payment card ── */}
        <div className="rounded-3xl bg-white border border-pink-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-pink-50 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Payment Details</h2>
              <p className="text-xs text-muted-foreground">Your payment information</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {isEditing ? (
              /* ── Edit mode ── */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Method</Label>
                  <Select value={editedData.payment_method} onValueChange={(v) => setEditedData({ ...editedData, payment_method: v })}>
                    <SelectTrigger className="rounded-xl border-pink-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editedData.payment_method === "bkash" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">bKash Number</Label>
                    <Input value={editedData.bkash_number || ""} placeholder="01XXXXXXXXX"
                      onChange={(e) => setEditedData({ ...editedData, bkash_number: e.target.value })}
                      className="rounded-xl border-pink-200" />
                  </div>
                )}
                {editedData.payment_method === "nagad" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Nagad Number</Label>
                    <Input value={editedData.nagad_number || ""} placeholder="01XXXXXXXXX"
                      onChange={(e) => setEditedData({ ...editedData, nagad_number: e.target.value })}
                      className="rounded-xl border-pink-200" />
                  </div>
                )}
                {editedData.payment_method === "card" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Last 4 digits</Label>
                    <Input value={editedData.card_last_four || ""} placeholder="1234" maxLength={4}
                      onChange={(e) => setEditedData({ ...editedData, card_last_four: e.target.value })}
                      className="rounded-xl border-pink-200" />
                  </div>
                )}
              </div>
            ) : (
              /* ── View mode ── */
              <div className="space-y-4">
                {/* Method + number row */}
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Method</p>
                    <p className="text-base font-bold text-gray-800">{paymentLabel(subscription.payment_method)}</p>
                  </div>
                  {paymentNumber && (
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                        {subscription.payment_method === "bkash" ? "bKash Number"
                          : subscription.payment_method === "nagad" ? "Nagad Number"
                          : "Card Number"}
                      </p>
                      <p className="text-base font-bold text-gray-800 font-mono">{paymentNumber}</p>
                    </div>
                  )}
                  {/* Payment date */}
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> Payment Date
                    </p>
                    <p className="text-base font-bold text-gray-800">
                      {subscription.created_at
                        ? format(parseISO(subscription.created_at), "MMM d, yyyy")
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Transaction ID or Cash notice */}
                {subscription.payment_method === "cash" ? (
                  <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-100 px-4 py-3">
                    <span className="text-green-600 text-xl">💵</span>
                    <p className="text-green-800 font-semibold text-sm">Paid in Cash</p>
                  </div>
                ) : subscription.transaction_id ? (
                  <div className="space-y-1.5">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1">
                      <Receipt className="h-3 w-3" /> Transaction ID
                    </p>
                    <p className="font-mono text-sm bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 text-purple-800 break-all">
                      {subscription.transaction_id}
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* ── Recent orders ── */}
        <div className="rounded-3xl bg-white border border-pink-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-pink-50 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-rose-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Recent Orders</h2>
              <p className="text-xs text-muted-foreground">Your latest deliveries</p>
            </div>
          </div>

          <div className="p-6">
            {orders.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id}
                    className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-pink-50/60 border border-pink-100 hover:bg-pink-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white border border-pink-100 flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4 text-pink-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{order.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.created_at ? format(parseISO(order.created_at), "MMM d, yyyy · hh:mm a") : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="font-bold text-pink-600">৳{Number(order.total_price).toFixed(0)}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        order.delivery_status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.delivery_status === "shipped"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.delivery_status || order.status || "pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SubscriptionManage;
