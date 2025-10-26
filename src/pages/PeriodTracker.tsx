import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Sparkles, Home } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const SHEET_WEBHOOK_URL = "YOUR_WEBHOOK_URL_HERE";

const PeriodTracker = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [cycleLength, setCycleLength] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [predictedDate, setPredictedDate] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please select both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    const cycle = cycleLength ? parseInt(cycleLength) : 28;
    const nextPeriod = addDays(startDate, cycle);
    const predictedDateStr = format(nextPeriod, "MMMM dd, yyyy");
    
    setPredictedDate(predictedDateStr);
    setIsSubmitted(true);

    // Send data to Google Sheet
    try {
      const data = {
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        cycleLength: cycle,
        email: email || "Not provided",
        nextPeriod: format(nextPeriod, "yyyy-MM-dd"),
        timestamp: new Date().toISOString(),
      };

      if (SHEET_WEBHOOK_URL !== "YOUR_WEBHOOK_URL_HERE") {
        await fetch(SHEET_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      toast({
        title: "Success! 💗",
        description: "Got it! We'll remind you before your next cycle 💌",
      });
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const products = [
    {
      title: "Premium Sanitary Pads",
      description: "Stock up on pads before your next cycle.",
      icon: "🌸",
    },
    {
      title: "Herbal Comfort Tea",
      description: "Stay comfy during cramps with our herbal tea.",
      icon: "🍵",
    },
    {
      title: "Heat Patches",
      description: "Instant relief for period pain and discomfort.",
      icon: "🔥",
    },
    {
      title: "Wellness Supplements",
      description: "Natural vitamins to support your cycle health.",
      icon: "💊",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary/20 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Tracking</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Track Your Cycle with AI 💗
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Log your period dates and let our AI help you stay prepared.
            </p>
          </div>

          {/* Form Card */}
          <Card className="border-primary/20 shadow-soft">
            <CardHeader>
              <CardTitle>Period Tracker</CardTitle>
              <CardDescription>
                Enter your cycle information to get personalized predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Cycle Length */}
                <div className="space-y-2">
                  <Label htmlFor="cycle">Cycle Length (optional)</Label>
                  <Input
                    id="cycle"
                    type="number"
                    placeholder="Default is 28 days"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(e.target.value)}
                    min="21"
                    max="45"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    We'll send you a reminder before your next cycle
                  </p>
                </div>

                <Button type="submit" variant="cta" size="lg" className="w-full">
                  Track My Cycle
                </Button>
              </form>

              {/* Prediction Result */}
              {isSubmitted && predictedDate && (
                <div className="mt-8 p-6 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl text-center space-y-2 animate-fade-in">
                  <p className="text-lg font-semibold">
                    Your next period is likely to start around
                  </p>
                  <p className="text-2xl font-bold text-accent">{predictedDate}</p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Got it! We'll remind you before your next cycle 💌
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Recommendations */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Recommended for You 🌸</h2>
              <p className="text-muted-foreground">
                Products to keep you comfortable throughout your cycle
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <Card
                  key={index}
                  className="border-primary/20 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="text-4xl mb-2">{product.icon}</div>
                    <CardTitle className="text-lg">{product.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{product.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PeriodTracker;
