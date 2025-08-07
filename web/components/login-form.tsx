"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { ref, get, set } from "firebase/database";
import { cn } from "@/lib/utils";

interface ReportEntry {
  date: string;
  start_time?: string;
  end_time?: string;
  total_area?: number;
  treatment_efficiency?: number;
  battery_usage?: number;
  laser_operations?: number;
  average_power?: number;
  system_uptime?: number;
  alerts?: string[];
  total_weed_count?: number; // Total weed count (new field)
}

export default function PerformanceDataExport() {
  const [date, setDate] = React.useState<Date | undefined>();
  const [data, setData] = React.useState<ReportEntry | null>(null);
  const [loading, setLoading] = React.useState(false);

  const fetchLatestWeedCount = async () => {
    // Fetch the latest weed count from the nested structure
    const snapshot = await get(ref(db, 'weed_detection/latest'));
    if (snapshot.exists()) {
      const weedData = snapshot.val();
      return weedData.weed_count || 0; // Return the latest weed count
    }
    return 0;
  };

  const fetchReportData = async () => {
    if (!date) return;
    setLoading(true);
    const key = format(date, "MM-dd-yyyy");
    try {
      const snapshot = await get(ref(db, `report/${key}`));
      if (snapshot.exists()) {
        const reportData = { date: key, ...snapshot.val() };
        setData(reportData);

        // Fetch the latest weed count
        const latestWeedCount = await fetchLatestWeedCount();

        // Update total weed count
        const newTotalWeedCount = (reportData.total_weed_count || 0) + latestWeedCount;
        await set(ref(db, `report/${key}/total_weed_count`), newTotalWeedCount); // Save updated total weed count to the database

        toast("Data fetched", { description: `Showing data for ${key}` });
      } else {
        setData(null);
        toast("No data", { description: `No data for ${key}` });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

const formattedData = data
  ? [
      {
        Date: data.date,
        "Start Time": data.start_time ?? "None",
        "End Time": data.end_time ?? "None",
        "Uptime (%)": data.system_uptime ?? "None",
        "Total Weed Count": data.total_weed_count || 0, // Use total_weed_count
      },
    ]
  : [];

// Export to CSV Function
const exportToCSV = () => {
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  saveAs(new Blob([csv], { type: "text/csv" }), "report.csv");
};

// Export to Excel Function
const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
  const xlsxData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([xlsxData], { type: "application/octet-stream" }), "report.xlsx");
};

// Export to PDF Function
const exportToPDF = () => {
  const doc = new jsPDF();
  const headers = Object.keys(formattedData[0] || {});
  const rows = formattedData.map(item => Object.values(item));

  doc.setFontSize(14);
  doc.text("Performance Data Report", 14, 15);
  autoTable(doc, {
    startY: 20,
    head: [headers],
    body: rows,
    theme: "grid",
    headStyles: { fillColor: [40, 40, 40] },
  });
  doc.save("report.pdf");
};

  return (
    <div className="text-sm">
      <h1 className="text-lg font-bold mb-5">Performance Data Export</h1>
      <div className="grid gap-5">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-secondary/80 text-primary rounded-lg p-4 gap-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-full md:w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "MM-dd-yyyy") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              onClick={fetchReportData}
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={!date || loading}
            >
              {loading ? "Loading..." : "Get Report"}
            </Button>
          </div>
        </div>

        <div className="bg-secondary/80 rounded-lg p-6">
          <h1 className="text-lg font-bold mb-5">Export Format</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={exportToCSV}
              disabled={!data}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              CSV
            </Button>
            <Button
              onClick={exportToExcel}
              disabled={!data}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Excel
            </Button>
            <Button
              onClick={exportToPDF}
              disabled={!data}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              PDF
            </Button>
          </div>
        </div>

        <div className="bg-secondary/80 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Preview Data</h2>
          {data ? (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {Object.keys(formattedData[0] || {}).map((key) => (
                    <th key={key} className="text-left p-2 border-b">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Object.values(formattedData[0] || {}).map((val, i) => (
                    <td key={i} className="p-2 border-b">{val}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 bg-secondary/50 rounded-lg">
              <p className="text-gray-500">No data available for the selected date.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}