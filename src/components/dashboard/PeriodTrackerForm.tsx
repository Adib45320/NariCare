import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PeriodTrackerFormProps {
  userId: string;
  onDataUpdate: () => void;
}

const PeriodTrackerForm = ({ userId, onDataUpdate }: PeriodTrackerFormProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [cycleLength, setCycleLength] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    setIsSubmitting(true);

    const cycle = cycleLength ? parseInt(cycleLength) : 28;
    const nextPeriod = addDays(startDate, cycle);

    try {
      const { error } = await supabase.from("period_data").insert({
        user_id: userId,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        cycle_length: cycle,
        next_period_date: format(nextPeriod, "yyyy-MM-dd"),
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
              type: "period_data",
              userId,
              startDate: format(startDate, "yyyy-MM-dd"),
              endDate: format(endDate, "yyyy-MM-dd"),
              cycleLength: cycle,
              nextPeriod: format(nextPeriod, "yyyy-MM-dd"),
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (error) {
          console.error("Error sending to Google Sheets:", error);
        }
      }

      toast({
        title: "Success! 💗",
        description: `Your next period is predicted for ${format(nextPeriod, "MMMM dd, yyyy")}`,
      });

      // Reset form
      setStartDate(undefined);
      setEndDate(undefined);
      setCycleLength("");
      
      // Trigger data update
      onDataUpdate();
    } catch (error: any) {
      console.error("Error saving period data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save period data.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/20 shadow-soft">
      <CardHeader>
        <CardTitle>Track Your Cycle</CardTitle>
        <CardDescription>
          Enter your period dates to get AI-powered predictions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
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
          </div>

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

          <Button
            type="submit"
            variant="cta"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Tracking..." : "Track My Cycle"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PeriodTrackerForm;
