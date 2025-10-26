import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, CreditCard, Package, Edit2, Check } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const SubscriptionManage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
        fetchSubscription(session.user.id);
        fetchOrders(session.user.id);
      }
    });
  }, [navigate]);

  const fetchSubscription = async (userId: string) => {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("Error fetching subscription:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription details",
        variant: "destructive",
      });
    } else if (data) {
      setSubscription(data);
      setEditedData(data);
    } else {
      toast({
        title: "No Subscription",
        description: "You don't have an active subscription yet",
      });
      navigate("/subscribe");
    }
    setIsLoading(false);
  };

  const fetchOrders = async (userId: string) => {
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
  };

  const handleSaveChanges = async () => {
    if (!subscription || !user) return;

    const { error } = await supabase
      .from("subscriptions")
      .update({
        pad_type: editedData.pad_type,
        quantity: editedData.quantity,
        delivery_date: editedData.delivery_date,
        delivery_address: editedData.delivery_address,
        payment_method: editedData.payment_method,
        card_last_four: editedData.card_last_four,
        bkash_number: editedData.bkash_number,
        nagad_number: editedData.nagad_number,
      })
      .eq("id", subscription.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Subscription updated successfully!",
      });
      setSubscription(editedData);
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your subscription...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Hero Section with Background */}
      <div className="relative h-64 bg-gradient-accent overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200')] bg-cover bg-center" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 mb-4"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-white mb-2">Manage Your Subscription</h1>
            <p className="text-white/90 text-lg">Update your preferences and track your deliveries</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 pb-12">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Subscription Details Card */}
          <Card className="bg-white shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <CardTitle>Subscription Details</CardTitle>
                </div>
                {!isEditing ? (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <Button variant="default" size="sm" onClick={handleSaveChanges}>
                    <Check className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                )}
              </div>
              <CardDescription>Manage your product preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pad Type</Label>
                {isEditing ? (
                  <Select
                    value={editedData.pad_type}
                    onValueChange={(value) => setEditedData({ ...editedData, pad_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Super">Super</SelectItem>
                      <SelectItem value="Night">Night</SelectItem>
                      <SelectItem value="Panty Liners">Panty Liners</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-lg font-semibold capitalize">{subscription.pad_type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedData.quantity}
                    onChange={(e) => setEditedData({ ...editedData, quantity: parseInt(e.target.value) })}
                    min="1"
                  />
                ) : (
                  <p className="text-lg font-semibold">{subscription.quantity} packs</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Next Delivery Date</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editedData.delivery_date}
                    onChange={(e) => setEditedData({ ...editedData, delivery_date: e.target.value })}
                  />
                ) : (
                  <p className="text-lg font-semibold">
                    {new Date(subscription.next_delivery_date || subscription.delivery_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Delivery Address</Label>
                {isEditing ? (
                  <Input
                    value={editedData.delivery_address}
                    onChange={(e) => setEditedData({ ...editedData, delivery_address: e.target.value })}
                  />
                ) : (
                  <p className="text-sm">{subscription.delivery_address}</p>
                )}
              </div>

              <div className="pt-4 border-t">
                <Badge className={subscription.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                  {subscription.status.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Card */}
          <Card className="bg-white shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <CardTitle>Payment Method</CardTitle>
              </div>
              <CardDescription>Your payment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                {isEditing ? (
                  <Select
                    value={editedData.payment_method}
                    onValueChange={(value) => setEditedData({ ...editedData, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-lg font-semibold capitalize">{subscription.payment_method}</p>
                )}
              </div>

              {editedData.payment_method === 'card' && (
                <div className="space-y-2">
                  <Label>Card Last Four Digits</Label>
                  {isEditing ? (
                    <Input
                      value={editedData.card_last_four || ''}
                      onChange={(e) => setEditedData({ ...editedData, card_last_four: e.target.value })}
                      maxLength={4}
                      placeholder="1234"
                    />
                  ) : (
                    <p className="text-lg">•••• {subscription.card_last_four}</p>
                  )}
                </div>
              )}

              {editedData.payment_method === 'bkash' && (
                <div className="space-y-2">
                  <Label>bKash Number</Label>
                  {isEditing ? (
                    <Input
                      value={editedData.bkash_number || ''}
                      onChange={(e) => setEditedData({ ...editedData, bkash_number: e.target.value })}
                      placeholder="01XXXXXXXXX"
                    />
                  ) : (
                    <p className="text-lg">{subscription.bkash_number}</p>
                  )}
                </div>
              )}

              {editedData.payment_method === 'nagad' && (
                <div className="space-y-2">
                  <Label>Nagad Number</Label>
                  {isEditing ? (
                    <Input
                      value={editedData.nagad_number || ''}
                      onChange={(e) => setEditedData({ ...editedData, nagad_number: e.target.value })}
                      placeholder="01XXXXXXXXX"
                    />
                  ) : (
                    <p className="text-lg">{subscription.nagad_number}</p>
                  )}
                </div>
              )}

              <div className="pt-4 border-t space-y-2">
                <Label>Subscription Started</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(subscription.subscription_start_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order History Card */}
          <Card className="bg-white shadow-soft md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <CardTitle>Payment & Order History</CardTitle>
              </div>
              <CardDescription>Your recent orders and deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{order.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.order_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">৳{order.total_price}</p>
                        <Badge
                          className={
                            order.delivery_status === 'delivered'
                              ? 'bg-green-500'
                              : order.delivery_status === 'pending'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          }
                        >
                          {order.delivery_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManage;