"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, FileDown, Filter } from "lucide-react";
import { DateRange } from "react-day-picker";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { autoTable } from 'jspdf-autotable'

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner"

interface AutoTableOptions {
  head: Array<string[]>;
  body: Array<(string | number)[]>;
  startY: number;
  theme: string;
  styles: {
    fontSize: number;
    cellPadding: number;
  };
  headStyles: {
    fillColor: number[];
    textColor: number;
    fontStyle: string;
  };
}

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
  }
}

interface DataItem {
  id: number;
  date: string;
  efficiency: string;
  accuracy: string;
  coverage: string;
}

const mockData: DataItem[] = [
  { id: 1, date: "02-01-2025", efficiency: "85%", accuracy: "95%", coverage: "1.5ha/hr" },
  { id: 2, date: "02-02-2025", efficiency: "80%", accuracy: "90%", coverage: "1.4ha/hr" },
  { id: 3, date: "02-03-2025", efficiency: "82%", accuracy: "92%", coverage: "1.6ha/hr" },
  { id: 4, date: "02-04-2025", efficiency: "88%", accuracy: "93%", coverage: "1.7ha/hr" },
  { id: 5, date: "02-05-2025", efficiency: "87%", accuracy: "94%", coverage: "1.5ha/hr" },
  { id: 6, date: "02-06-2025", efficiency: "86%", accuracy: "91%", coverage: "1.8ha/hr" },
  { id: 7, date: "02-07-2025", efficiency: "84%", accuracy: "89%", coverage: "1.4ha/hr" },
  { id: 8, date: "02-08-2025", efficiency: "90%", accuracy: "96%", coverage: "1.9ha/hr" },
  { id: 9, date: "02-09-2025", efficiency: "89%", accuracy: "95%", coverage: "1.6ha/hr" },
  { id: 10, date: "02-10-2025", efficiency: "91%", accuracy: "97%", coverage: "2.0ha/hr" },
  { id: 11, date: "02-11-2025", efficiency: "92%", accuracy: "98%", coverage: "1.8ha/hr" },
  { id: 12, date: "02-12-2025", efficiency: "93%", accuracy: "99%", coverage: "1.7ha/hr" },
  { id: 13, date: "02-13-2025", efficiency: "94%", accuracy: "97%", coverage: "1.6ha/hr" },
  { id: 14, date: "02-14-2025", efficiency: "95%", accuracy: "96%", coverage: "1.5ha/hr" },
  { id: 15, date: "02-15-2025", efficiency: "96%", accuracy: "95%", coverage: "1.4ha/hr" },
  { id: 16, date: "02-16-2025", efficiency: "97%", accuracy: "94%", coverage: "1.3ha/hr" },
  { id: 17, date: "02-17-2025", efficiency: "98%", accuracy: "93%", coverage: "1.2ha/hr" },
  { id: 18, date: "02-18-2025", efficiency: "99%", accuracy: "92%", coverage: "1.1ha/hr" },
  { id: 19, date: "02-19-2025", efficiency: "100%", accuracy: "91%", coverage: "1.0ha/hr" },
  { id: 20, date: "02-20-2025", efficiency: "85%", accuracy: "90%", coverage: "1.5ha/hr" },
];

export default function PerformanceDataExport() {
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [isExporting, setIsExporting] = React.useState(false);
  const [filteredData, setFilteredData] = React.useState<DataItem[]>([]);
  const [isFiltered, setIsFiltered] = React.useState(false);

  const renderDateRange = () => {
    if (!date?.from) return <span>Pick a date</span>;
    return date.to ? (
      <>
        {format(date.from, "MM-dd-yyyy")} - {format(date.to, "MM-dd-yyyy")}
      </>
    ) : (
      format(date.from, "MM-dd-yyyy")
    );
  };

  const filterDataByDateRange = () => {
    if (!date || !date.from) return mockData;
    
    const fromDate = date.from;
    
    return mockData.filter(item => {
      const itemDate = new Date(item.date);
      if (date.to) {
        return itemDate >= fromDate && itemDate <= date.to;
      }
      return itemDate.toDateString() === fromDate.toDateString();
    });
  };

  const handleFilterClick = () => {
    const filtered = filterDataByDateRange();
    setFilteredData(filtered);
    setIsFiltered(true);
    
    if (filtered.length === 0) {
      toast("No data available", {
        description: "No records found for the selected date range"
      });
    } else {
      toast("Data filtered", {
        description: `Showing ${filtered.length} records for the selected date range`
      });
    }
  };

  const exportToCSV = () => {
    try {
      setIsExporting(true);
      const data = isFiltered ? filteredData : filterDataByDateRange();
      const headers = Object.keys(data[0]).join(',');
      const csvRows = data.map(row => Object.values(row).join(','));
      const csvContent = [headers, ...csvRows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `performance-data-${new Date().toISOString().slice(0, 10)}.csv`);
      
      toast("Export successful", {
        description: "Data has been exported to CSV format"
      });
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast("Export failed", {
        description: "Failed to export data to CSV format"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = () => {
    try {
      setIsExporting(true);
      const data = isFiltered ? filteredData : filterDataByDateRange();
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Performance Data");
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `performance-data-${new Date().toISOString().slice(0, 10)}.xlsx`);
      
      toast("Export successful", {
        description: "Data has been exported to Excel format"
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast("Export failed", {
        description: "Failed to export data to Excel format"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = () => {
    try {
      setIsExporting(true);
      const data = isFiltered ? filteredData : filterDataByDateRange();
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text("Performance Data Report", 14, 15);
      
      if (date?.from) {
        doc.setFontSize(10);
        const dateText = date.to 
          ? `Date Range: ${format(date.from, "MM-dd-yyyy")} - ${format(date.to, "MM-dd-yyyy")}`
          : `Date: ${format(date.from, "MM-dd-yyyy")}`;
        doc.text(dateText, 14, 22);
      }
      
      const tableColumn: string[] = Object.keys(data[0] || {});
      const tableRows: (string | number)[][] = data.map(item => Object.values(item));
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [51, 51, 51],
          textColor: 255,
          fontStyle: 'bold',
        },
      });
      
      doc.save(`performance-data-${new Date().toISOString().slice(0, 10)}.pdf`);
      
      toast("Export successful", {
        description: "Data has been exported to PDF format"
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast("Export failed", {
        description: "Failed to export data to PDF format"
      });
    } finally {
      setIsExporting(false);
    }
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
                  {renderDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            
            <div className="flex gap-2">
              <Button 
                className="w-full" 
                onClick={handleFilterClick} 
                disabled={!date?.from}
                variant="default"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-secondary/80 rounded-lg p-6">
          <h1 className="text-lg font-bold mb-5">Export Format</h1>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="w-full" 
              onClick={exportToCSV} 
              disabled={isExporting || (isFiltered && filteredData.length === 0)}
            >
              <FileDown className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button 
              className="w-full" 
              onClick={exportToExcel} 
              disabled={isExporting || (isFiltered && filteredData.length === 0)}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button 
              className="w-full" 
              onClick={exportToPDF} 
              disabled={isExporting || (isFiltered && filteredData.length === 0)}
            >
              <FileDown className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        <div className="bg-secondary/80 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">
            {isFiltered ? `Filtered Data (${filteredData.length} records)` : "Preview Data"}
          </h2>
          {filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b">ID</th>
                    <th className="text-left p-2 border-b">Date</th>
                    <th className="text-left p-2 border-b">Efficiency</th>
                    <th className="text-left p-2 border-b">Accuracy</th>
                    <th className="text-left p-2 border-b">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {(isFiltered ? filteredData : filteredData.slice(0, 5)).map((row) => (
                    <tr key={row.id}>
                      <td className="p-2 border-b">{row.id}</td>
                      <td className="p-2 border-b">{row.date}</td>
                      <td className="p-2 border-b">{row.efficiency}</td>
                      <td className="p-2 border-b">{row.accuracy}</td>
                      <td className="p-2 border-b">{row.coverage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!isFiltered && filteredData.length > 5 && (
                <p className="text-xs text-gray-500 mt-2">Showing 5 of {filteredData.length} records. Use Filter button to see all matching records.</p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-secondary/50 rounded-lg">
              <p className="text-gray-500">No data available for the selected date range.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}