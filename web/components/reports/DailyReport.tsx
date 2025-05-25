import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function DailyReport() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const summary = {
    start: "08:00 AM",
    end: "05:00 PM",
    area: "13.5 ha",
    efficiency: "85%",
  };

  const performance = {
    battery: "75%",
    laser: "542 instances",
    power: "65W",
    uptime: "98.5%",
  };

  const alerts = [
    "Low battery warning at 04:30 PM",
    "Obstacle detected at 02:15 PM",
    "System maintenance recommended",
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-1">Daily Report</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Select a date</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[260px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl bg-muted/40 p-4">
          <h3 className="text-base font-semibold mb-2">Operation Summary</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium">
              Operation Start: <span className="font-normal">{summary.start}</span>
            </div>
            <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium">
              Operation End: <span className="font-normal">{summary.end}</span>
            </div>
            <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium">
              Total Area Covered: <span className="font-normal">{summary.area}</span>
            </div>
            <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium">
              Treatment Efficiency: <span className="font-normal">{summary.efficiency}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-muted/40 p-4">
          <h3 className="text-base font-semibold mb-2">System Performance</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium">
              Battery Usage: <span className="font-normal">{performance.battery}</span>
            </div>
            <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium">
              Laser Operations: <span className="font-normal">{performance.laser}</span>
            </div>
            <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium">
              Average Power: <span className="font-normal">{performance.power}</span>
            </div>
            <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium">
              System Uptime: <span className="font-normal">{performance.uptime}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-muted/40 p-4">
          <h3 className="text-base font-semibold mb-2">Alerts & Notifications</h3>
          <ul className="list-disc pl-6 text-sm text-muted-foreground">
            {alerts.length ? (
              alerts.map((alert, index) => <li key={index}>{alert}</li>)
            ) : (
              <li>No alerts recorded.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
