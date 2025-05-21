"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const InfoCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="flex flex-row justify-between p-3 rounded-lg bg-primary/20 text-primary">
    <h6 className="font-semibold">{title}</h6>
    <h6>{value}</h6>
  </div>
);

type MockDataType = {
  [key: string]: {
    operationStart: string;
    operationEnd: string;
    totalAreaCovered: string;
    treatmentEfficiency: string;
    batteryUsage: string;
    laserOperation: string;
    averagePower: string;
    systemUptime: string;
    alerts: string[];
  };
};

export default function DailyReport() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);

  const DatePicker: React.FC = () => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {selectedDate ? format(selectedDate, "MM-dd-yyyy") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  };

  // Update the mockData declaration
  const mockData: MockDataType = {
    "02-27-2025": {
      operationStart: "08:00 AM",
      operationEnd: "05:00 PM",
      totalAreaCovered: "13.5 ha",
      treatmentEfficiency: "85%",
      batteryUsage: "75%",
      laserOperation: "542 instances",
      averagePower: "65W",
      systemUptime: "98.5%",
      alerts: [
        "Low battery warning at 04:30 PM",
        "Obstacle detected at 02:15 PM",
        "System maintenance recommended",
      ],
    },
    "02-28-2025": {
      operationStart: "08:15 AM",
      operationEnd: "05:15 PM",
      totalAreaCovered: "15.0 ha",
      treatmentEfficiency: "90%",
      batteryUsage: "70%",
      laserOperation: "600 instances",
      averagePower: "70W",
      systemUptime: "99.0%",
      alerts: [
        "Battery fully charged",
        "No obstacles detected",
        "System functioning optimally",
      ],
    },
  };

  return (
    <div className="text-sm">
      <h1 className="text-lg font-bold mb-5">Daily Report</h1>

      <div className="flex flex-row justify-between items-center bg-secondary/80 text-primary rounded-lg p-4 my-5">
        <p>Select a date</p>
        <DatePicker />
      </div>

      <div className="flex flex-col gap-5">
        {selectedDate && (
          <>
            {mockData[format(selectedDate, "MM-dd-yyyy") as keyof MockDataType] ? (
              <>
                <div className="bg-secondary/80 text-primary rounded-lg p-6">
                  <h1 className="text-lg font-bold mb-5">Operation Summary</h1>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoCard title="Operation Start" value={mockData[format(selectedDate, "MM-dd-yyyy") as keyof MockDataType].operationStart} />
                    <InfoCard title="Operation End" value={mockData[format(selectedDate, "MM-dd-yyyy") as keyof MockDataType].operationEnd} />
                    <InfoCard title="Total Area Covered" value={mockData[format(selectedDate, "MM-dd-yyyy") as keyof MockDataType].totalAreaCovered} />
                    <InfoCard title="Treatment Efficiency" value={mockData[format(selectedDate, "MM-dd-yyyy") as keyof MockDataType].treatmentEfficiency} />
                  </div>
                </div>

                <div className="bg-secondary/80 rounded-lg p-6">
                  <h1 className="text-lg font-bold mb-5">System Performance</h1>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoCard title="Battery Usage" value={mockData[format(selectedDate, "MM-dd-yyyy") as keyof MockDataType].batteryUsage} />
                    <InfoCard title="Laser Operation" value={mockData[format(selectedDate, "MM-dd-yyyy") as keyof MockDataType].laserOperation} />
                    <InfoCard title="Average Power" value={mockData[format(selectedDate, "MM-dd-yyyy") as keyof MockDataType].averagePower} />
                    <InfoCard title="System Uptime" value={mockData[format(selectedDate, "MM-dd-yyyy") as keyof MockDataType].systemUptime} />
                  </div>
                </div>

                <div className="bg-secondary/80 rounded-lg p-6">
                  <h1 className="text-lg font-bold mb-5">Alert & Notifications</h1>
                  <div className="grid grid-cols-1 gap-3">
                    {mockData[format(selectedDate, "MM-dd-yyyy") as keyof MockDataType].alerts.map((alert, index) => (
                      <InfoCard key={index} title={alert} value="" />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center bg-secondary/80 text-primary rounded-lg p-6">
                <h1 className="text-lg font-bold">No Data Available</h1>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
