import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { Package, MapPin, Receipt, CreditCard, CalendarDays, RefreshCw } from "lucide-react";

interface OrderHistoryProps {
  userId: string;
}

const OrderHistory = ({ userId }: OrderHistoryProps) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    const [ordersRes, subsRes] = await Promise.all([
      supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("subscriptions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
    ]);
    if (!ordersRes.error) setOrders(ordersRes.data || []);
    if (!subsRes.error) setSubscriptions(subsRes.data || []);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20 shadow-soft">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading orders...</div>
        </CardContent>
      </Card>
    );
  }

  const getOrderStatusStyle = (status: string) => {
    switch (status) {
      case "pending":    return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "completed":  return "bg-green-500/10 text-green-700 border-green-500/20";
      case "cancelled":  return "bg-red-500/10 text-red-700 border-red-500/20";
      default:           return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    }
  };

  const getSubStatusStyle = (status: string) => {
    switch (status) {
      case "active":        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "not_verified":  return "bg-orange-500/10 text-orange-700 border-orange-500/20";
      case "cancelled":     return "bg-red-500/10 text-red-700 border-red-500/20";
      default:              return "bg-orange-500/10 text-orange-700 border-orange-500/20";
    }
  };

  const getSubStatusLabel = (status: string) => {
    switch (status) {
      case "active":       return "Active";
      case "not_verified":  return "Payment Not Verified";
      case "cancelled":    return "Cancelled";
      default:             return "Not Verified";
    }
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case "bkash":  return "bKash";
      case "nagad":  return "Nagad";
      case "card":   return "Card";
      default:       return method || "—";
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Subscriptions ── */}
      <Card className="border-primary/20 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            My Subscriptions
          </CardTitle>
          <CardDescription>
            {subscriptions.length === 0 ? "No subscriptions yet" : `${subscriptions.length} subscription${subscriptions.length !== 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <RefreshCw className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No subscriptions yet. <a href="/subscribe" className="text-primary underline">Subscribe now</a>!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="p-4 border border-primary/10 rounded-xl hover:bg-accent/5 transition-colors space-y-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Package className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm">{sub.plan_name || "Basic"} Plan</h4>
                        {sub.pad_type && <p className="text-xs text-muted-foreground capitalize">{sub.pad_type.replace(/-/g, " ")}</p>}
                      </div>
                    </div>
                    <span className={`inline-block shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border ${getSubStatusStyle(sub.status)}`}>
                      {getSubStatusLabel(sub.status)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {sub.quantity && (
                      <div>
                        <span className="text-xs uppercase tracking-wide font-medium text-muted-foreground">Quantity</span>
                        <p className="text-foreground font-medium">{sub.quantity} pack{sub.quantity !== 1 ? "s" : ""}/month</p>
                      </div>
                    )}
                    {sub.total_price != null && (
                      <div>
                        <span className="text-xs uppercase tracking-wide font-medium text-muted-foreground">Total</span>
                        <p className="text-primary font-bold">৳{Number(sub.total_price).toFixed(0)}</p>
                      </div>
                    )}
                    {sub.delivery_date && (
                      <div>
                        <span className="text-xs uppercase tracking-wide font-medium text-muted-foreground">Delivery</span>
                        <p className="text-foreground">{format(new Date(sub.delivery_date), "do 'of each month'")}</p>
                      </div>
                    )}
                    {sub.payment_method && (
                      <div>
                        <span className="text-xs uppercase tracking-wide font-medium text-muted-foreground">Payment</span>
                        <p className="text-foreground">{formatPaymentMethod(sub.payment_method)}</p>
                      </div>
                    )}
                    {sub.created_at && (
                      <div>
                        <span className="text-xs uppercase tracking-wide font-medium text-muted-foreground">Subscribed on</span>
                        <p className="text-foreground">{format(parseISO(sub.created_at), "MMM dd, yyyy")}</p>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  {sub.delivery_address && (
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary/60" />
                      <span>{sub.delivery_address}</span>
                    </div>
                  )}

                  {/* Transaction ID */}
                  {sub.transaction_id && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Receipt className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                      <span>TXN: <span className="font-mono">{sub.transaction_id}</span></span>
                    </div>
                  )}

                  {/* Not verified notice */}
                  {(sub.status === "not_verified" || !sub.status || sub.status === "active") && getSubStatusLabel(sub.status) === "Not Verified" && (
                    <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                      ⏳ Your subscription is pending admin verification. We'll confirm your payment and activate it shortly.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Orders ── */}
      <Card className="border-primary/20 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Order History
          </CardTitle>
          <CardDescription>
            {orders.length === 0 ? "Your recent orders will appear here" : `Your ${orders.length} most recent order${orders.length !== 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No orders yet</p>
              <p className="text-sm mt-2">Click "Order Now" on the home page to place your first order!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-4 border border-primary/10 rounded-xl hover:bg-accent/5 transition-colors space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Package className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <h4 className="font-semibold text-sm leading-tight">{order.product_name}</h4>
                    </div>
                    <span className={`inline-block shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border ${getOrderStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="text-xs uppercase tracking-wide font-medium">Quantity</span>
                      <p className="text-foreground font-medium">{order.quantity} pack{order.quantity !== 1 ? "s" : ""}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wide font-medium">Total</span>
                      <p className="text-primary font-bold">৳{Number(order.total_price).toFixed(0)}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wide font-medium">Ordered on</span>
                      <p className="text-foreground">{format(parseISO(order.created_at), "MMM dd, yyyy")}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wide font-medium">Time</span>
                      <p className="text-foreground">{format(parseISO(order.created_at), "hh:mm a")}</p>
                    </div>
                  </div>

                  {order.delivery_address && (
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary/60" />
                      <span className="line-clamp-2">{order.delivery_address}</span>
                    </div>
                  )}

                  {order.transaction_id && order.transaction_id !== "COD" && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Receipt className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                      <span>TXN: <span className="font-mono">{order.transaction_id}</span></span>
                    </div>
                  )}
                  {order.transaction_id === "COD" && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CreditCard className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                      <span>Cash on Delivery</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderHistory;
