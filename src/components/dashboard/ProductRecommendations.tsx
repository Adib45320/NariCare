import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { parseISO, differenceInDays, format } from "date-fns";

interface ProductRecommendationsProps {
  nextPeriodDate?: string;
  userId: string;
}

const ProductRecommendations = ({ nextPeriodDate, userId }: ProductRecommendationsProps) => {
  const { toast } = useToast();

  const products = [
    {
      id: 1,
      name: "Premium Sanitary Pads",
      description: "Stock up on pads before your next cycle.",
      icon: "🌸",
      price: 220,
      quantity: 20,
    },
    {
      id: 2,
      name: "Herbal Comfort Tea",
      description: "Stay comfy during cramps with our herbal tea.",
      icon: "🍵",
      price: 150,
      quantity: 1,
    },
    {
      id: 3,
      name: "Heat Patches",
      description: "Instant relief for period pain and discomfort.",
      icon: "🔥",
      price: 180,
      quantity: 5,
    },
    {
      id: 4,
      name: "Wellness Supplements",
      description: "Natural vitamins to support your cycle health.",
      icon: "💊",
      price: 350,
      quantity: 30,
    },
  ];

  const getDaysUntilPeriod = () => {
    if (!nextPeriodDate) return null;
    const nextDate = parseISO(nextPeriodDate);
    const today = new Date();
    return differenceInDays(nextDate, today);
  };

  const daysUntil = getDaysUntilPeriod();

  const handleOrder = async (product: any) => {
    try {
      const { error } = await supabase.from("orders").insert({
        user_id: userId,
        product_name: product.name,
        quantity: product.quantity,
        total_price: product.price,
        status: "pending",
      });

      if (error) throw error;

      // Send to Google Sheets
      const SHEET_WEBHOOK_URL = "YOUR_WEBHOOK_URL_HERE";
      if (SHEET_WEBHOOK_URL !== "YOUR_WEBHOOK_URL_HERE") {
        try {
          await fetch(SHEET_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "order",
              userId,
              productName: product.name,
              quantity: product.quantity,
              totalPrice: product.price,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (error) {
          console.error("Error sending to Google Sheets:", error);
        }
      }

      toast({
        title: "Order placed! 🎉",
        description: `${product.name} has been added to your orders.`,
      });
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {daysUntil !== null && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
          <p className="text-lg font-semibold">
            {daysUntil > 0
              ? `Your next period is in ${daysUntil} days (${format(parseISO(nextPeriodDate!), "MMMM dd")})`
              : daysUntil === 0
              ? "Your period might start today!"
              : "Period tracking updated"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Stock up on essentials now! 💕
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="border-primary/20 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <CardHeader>
              <div className="text-4xl mb-2">{product.icon}</div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.id === 1 ? (
                <>
                  <p className="text-2xl font-bold text-primary">৳{product.price}</p>
                  <Button
                    variant="cta"
                    className="w-full"
                    onClick={() => handleOrder(product)}
                  >
                    Order Now
                  </Button>
                </>
              ) : (
                <div className="text-center py-4 bg-white rounded-lg">
                  <p className="text-lg font-semibold text-pink-500">Coming Soon</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;
