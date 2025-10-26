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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
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
  status: string;
  profiles?: {
    email: string;
  };
}

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

      // Fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email");

      if (profilesError) throw profilesError;

      // Merge data
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
        <p className="text-center text-muted-foreground py-8">
          No subscriptions found
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Pad Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sub.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sub.profiles?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">
                    {sub.pad_type.replace("-", " ")}
                  </TableCell>
                  <TableCell>{sub.quantity} packs/month</TableCell>
                  <TableCell>
                    {format(new Date(sub.delivery_date), "do 'of each month'")}
                  </TableCell>
                  <TableCell className="capitalize">
                    {sub.payment_method}
                  </TableCell>
                  <TableCell>
                    <p className="max-w-xs truncate">{sub.delivery_address}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={sub.status === "active" ? "default" : "outline"}
                    >
                      {sub.status}
                    </Badge>
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
