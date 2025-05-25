import { useState, useEffect } from "react";
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
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";

export default function DailyReport() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [summary, setSummary] = useState<any>({});
  const [performance, setPerformance] = useState<any>({});
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const fetchReport = async () => {
      if (!date) return;
      const dateKey = format(date, "MM-dd-yyyy");
      const reportRef = ref(db, `/report/${dateKey}`);
      const snapshot = await get(reportRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setSummary({
          start: data.start_time || "-",
          end: data.end_time || "-",
          area: data.total_area ? `${data.total_area} ha` : "-",
          efficiency: data.treatment_efficiency ? `${data.treatment_efficiency}%` : "-",
        });
        setPerformance({
          battery: data.battery_usage ? `${data.battery_usage}%` : "-",
          laser: data.laser_operations ? `${data.laser_operations} instances` : "-",
          power: data.average_power ? `${data.average_power}W` : "-",
          uptime: data.system_uptime ? `${data.system_uptime}%` : "-",
        });
        setAlerts(data.alerts || []);
      } else {
        setSummary({});
        setPerformance({});
        setAlerts([]);
      }
    };
    fetchReport();
  }, [date]);

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
              Operation Start: <span className="font-normal">{summary.start || "-"}</span>
            </div>
            <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium">
              Operation End: <span className="font-normal">{summary.end || "-"}</span>
            </div>
            <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium">
              Total Area Covered: <span className="font-normal">{summary.area || "-"}</span>
            </div>
            <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium">
              Treatment Efficiency: <span className="font-normal">{summary.efficiency || "-"}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-muted/40 p-4">
          <h3 className="text-base font-semibold mb-2">System Performance</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium">
              Battery Usage: <span className="font-normal">{performance.battery || "-"}</span>
            </div>
            <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium">
              Laser Operations: <span className="font-normal">{performance.laser || "-"}</span>
            </div>
            <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium">
              Average Power: <span className="font-normal">{performance.power || "-"}</span>
            </div>
            <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium">
              System Uptime: <span className="font-normal">{performance.uptime || "-"}</span>
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
