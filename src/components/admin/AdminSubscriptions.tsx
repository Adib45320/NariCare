import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface Subscription {
  id: string;
  user_id: string;
  full_name: string;
  pad_type: string;
  quantity: number;
  delivery_date: string;
  subscription_start_date: string;
  payment_method: string;
  delivery_address: string;
  transaction_id: string;
  bkash_number: string;
  nagad_number: string;
  total_price: number;
  plan_name: string;
  status: string;
  profiles?: {
    email: string;
  };
}

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data: subsData, error: subsError } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (subsError) throw subsError;

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email");

      if (profilesError) throw profilesError;

      const subscriptionsWithProfiles = subsData?.map((sub) => ({
        ...sub,
        profiles: profilesData?.find((p) => p.id === sub.user_id),
      }));

      setSubscriptions(subscriptionsWithProfiles || []);
    } catch (error: any) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: "Error",
        description: "Failed to load subscriptions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async (subId: string) => {
    setVerifying(subId);
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "active" })
      .eq("id", subId);

    if (error) {
      toast({ title: "Error", description: "Failed to verify payment", variant: "destructive" });
    } else {
      toast({ title: "Payment Verified ✅", description: "Subscription is now active" });
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, status: "active" } : s))
      );
    }
    setVerifying(null);
  };

  const getPaymentDisplay = (sub: Subscription) => {
    const method = sub.payment_method?.toLowerCase();
    const number = method === "bkash" ? sub.bkash_number : method === "nagad" ? sub.nagad_number : null;
    return (
      <div className="space-y-1">
        <p className="capitalize font-medium">{sub.payment_method || "—"}</p>
        {number && <p className="text-xs text-muted-foreground">{number}</p>}
        {sub.transaction_id && (
          <p className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
            TXN: {sub.transaction_id}
          </p>
        )}
        {sub.total_price != null && (
          <p className="text-xs font-semibold text-primary">৳{Number(sub.total_price).toFixed(0)}</p>
        )}
      </div>
    );
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
      <h2 className="text-2xl font-bold mb-6">Subscription Management</h2>

      {subscriptions.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No subscriptions found</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Plan / Pad</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Payment & TXN</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id} className={sub.status === "not_verified" ? "bg-orange-50/50" : ""}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sub.full_name || sub.profiles?.email?.split("@")[0] || "—"}</p>
                      <p className="text-sm text-muted-foreground">{sub.profiles?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sub.plan_name || "Basic"}</p>
                      <p className="text-xs text-muted-foreground capitalize">{sub.pad_type?.replace(/-/g, " ") || "—"}</p>
                    </div>
                  </TableCell>
                  <TableCell>{sub.quantity || "—"}</TableCell>
                  <TableCell>
                    {sub.delivery_date ? format(new Date(sub.delivery_date), "do 'of each month'") : "—"}
                  </TableCell>
                  <TableCell>{getPaymentDisplay(sub)}</TableCell>
                  <TableCell>
                    <p className="max-w-xs truncate text-sm">{sub.delivery_address || "—"}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={sub.status === "active" ? "default" : sub.status === "not_verified" ? "secondary" : "outline"}
                      className={sub.status === "not_verified" ? "bg-orange-100 text-orange-700 border-orange-300" : ""}
                    >
                      {sub.status === "not_verified" ? "Payment Not Verified" : sub.status === "active" ? "Active" : sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sub.status === "not_verified" ? (
                      <Button
                        size="sm"
                        className="gap-1.5 bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                        onClick={() => handleVerifyPayment(sub.id)}
                        disabled={verifying === sub.id}
                      >
                        {verifying === sub.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                        Payment Verified
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">{sub.status === "active" ? "✅ Verified" : "—"}</span>
                    )}
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

export default AdminSubscriptions;
