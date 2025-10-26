import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const SubscriptionPlan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cartData = location.state;

  const handleBasicPlan = () => {
    navigate("/subscribe/payment", {
      state: {
        ...cartData,
        subscriptionPlan: "Basic",
        subscriptionPrice: 100,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Subscription</h1>
            <p className="text-muted-foreground text-lg">
              Select the plan that works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Basic Subscription */}
            <Card className="border-primary/20 shadow-soft hover:shadow-lg transition-all duration-300 bg-white">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">Basic Subscription</CardTitle>
                <CardDescription className="text-base">
                  Perfect for getting started with NariCare
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">৳100</div>
                  <p className="text-muted-foreground">per month</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Monthly delivery of your selected products</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Flexible scheduling</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Discreet packaging</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Cancel anytime</p>
                  </div>
                </div>

                <Button
                  variant="cta"
                  className="w-full"
                  onClick={handleBasicPlan}
                >
                  Select Basic Plan
                </Button>
              </CardContent>
            </Card>

            {/* Premium Subscription */}
            <Card className="border-primary/20 shadow-soft bg-white opacity-90">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">Premium Subscription</CardTitle>
                <CardDescription className="text-base">
                  Enhanced care with exclusive benefits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-muted-foreground mb-2">Coming Soon</div>
                  <p className="text-muted-foreground text-sm">Stay tuned for premium features</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">All Basic features</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">Priority delivery</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">Exclusive wellness products</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">24/7 support</p>
                  </div>
                </div>

                <div className="text-center py-4 bg-pink-50 rounded-lg">
                  <p className="text-lg font-semibold text-pink-500">Coming Soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlan;
