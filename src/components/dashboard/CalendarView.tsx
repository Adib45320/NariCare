import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { parseISO, isSameDay, isWithinInterval, addDays } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minimize2, Maximize2 } from "lucide-react";

interface CalendarViewProps {
  periodData: any[];
}

const CalendarView = ({ periodData }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isMinimized, setIsMinimized] = useState(false);

  // Get the most recent period data
  const latestPeriod = periodData[0];

  const getPeriodDates = () => {
    if (!latestPeriod) return [];
    
    const start = parseISO(latestPeriod.start_date);
    const end = parseISO(latestPeriod.end_date);
    const dates: Date[] = [];
    
    let current = start;
    while (current <= end) {
      dates.push(new Date(current));
      current = addDays(current, 1);
    }
    
    return dates;
  };

  const getPredictedDates = () => {
    if (!latestPeriod) return [];
    
    const predictedStart = parseISO(latestPeriod.next_period_date);
    const predictedEnd = addDays(predictedStart, 5); // Assume 5-day period
    const dates: Date[] = [];
    
    let current = predictedStart;
    while (current <= predictedEnd) {
      dates.push(new Date(current));
      current = addDays(current, 1);
    }
    
    return dates;
  };

  const periodDates = getPeriodDates();
  const predictedDates = getPredictedDates();

  const modifiers = {
    period: periodDates,
    predicted: predictedDates,
  };

  const modifiersStyles = {
    period: {
      backgroundColor: "hsl(var(--accent))",
      color: "white",
      fontWeight: "bold",
    },
    predicted: {
      backgroundColor: "hsl(var(--primary) / 0.3)",
      color: "hsl(var(--primary))",
      border: "2px dashed hsl(var(--primary))",
      fontWeight: "bold",
    },
  };

  return (
    <Card className="border-primary/20 shadow-soft">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1.5">
          <CardTitle>Cycle Calendar</CardTitle>
          <CardDescription>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-accent"></div>
                <span className="text-sm">Last Period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/30 border-2 border-dashed border-primary"></div>
                <span className="text-sm">Predicted Period</span>
              </div>
            </div>
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMinimized(!isMinimized)}
          className="h-8 w-8"
        >
          {isMinimized ? (
            <Maximize2 className="h-4 w-4" />
          ) : (
            <Minimize2 className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      {!isMinimized && (
        <CardContent className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="pointer-events-auto rounded-lg border shadow-sm"
        />
      </CardContent>
      )}
    </Card>
  );
};

export default CalendarView;
