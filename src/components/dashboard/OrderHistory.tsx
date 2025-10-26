import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { Package } from "lucide-react";

interface OrderHistoryProps {
  userId: string;
}

const OrderHistory = ({ userId }: OrderHistoryProps) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20 shadow-soft">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Loading orders...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="border-primary/20 shadow-soft">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Your recent orders will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No orders yet</p>
            <p className="text-sm mt-2">Order products above to see them here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "completed":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    }
  };

  return (
    <Card className="border-primary/20 shadow-soft">
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>Your recent orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 border border-primary/10 rounded-lg hover:bg-accent/5 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-semibold">{order.product_name}</h4>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(order.created_at), "MMM dd, yyyy 'at' hh:mm a")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Quantity: {order.quantity}
                </p>
              </div>
              <div className="text-right space-y-2">
                <p className="text-lg font-bold text-primary">
                  ৳{Number(order.total_price).toFixed(2)}
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
