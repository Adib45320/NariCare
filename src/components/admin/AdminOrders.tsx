import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  user_id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  status: string;
  delivery_status: string;
  order_date: string;
  delivered_at: string | null;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("order_date", { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email");

      if (profilesError) throw profilesError;

      // Merge data
      const ordersWithProfiles = ordersData?.map((order) => ({
        ...order,
        profiles: profilesData?.find((p) => p.id === order.user_id),
      }));

      setOrders(ordersWithProfiles || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeliveryStatus = async (
    orderId: string,
    status: "delivered" | "not_delivered"
  ) => {
    setUpdatingOrderId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          delivery_status: status,
          delivered_at: status === "delivered" ? new Date().toISOString() : null,
        })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Order marked as ${status.replace("_", " ")}`,
      });

      fetchOrders();
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Order Management</h2>

      {orders.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No orders found
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.profiles?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.profiles?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{order.product_name}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>৳{order.total_price}</TableCell>
                  <TableCell>
                    {format(new Date(order.order_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.delivery_status === "delivered"
                          ? "default"
                          : "outline"
                      }
                    >
                      {order.delivery_status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() =>
                          updateDeliveryStatus(order.id, "delivered")
                        }
                        disabled={
                          updatingOrderId === order.id ||
                          order.delivery_status === "delivered"
                        }
                      >
                        {updatingOrderId === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          updateDeliveryStatus(order.id, "not_delivered")
                        }
                        disabled={
                          updatingOrderId === order.id ||
                          order.delivery_status === "not_delivered"
                        }
                      >
                        {updatingOrderId === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};

export default AdminOrders;
