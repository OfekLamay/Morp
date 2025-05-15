import { useState } from "react";
import { 
  DownloadCloud, 
  FileDown,
  FileText,
  ChevronDown 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToPDF, exportToCSV, getExportFilename } from "@/lib/exportUtils";

interface ExportButtonProps {
  title: string;
  headers: string[];
  data: any[];
  filename: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ExportButton({
  title,
  headers,
  data,
  filename,
  variant = "outline",
  size = "default",
  className,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      exportToPDF(
        title,
        headers,
        data,
        getExportFilename(filename)
      );
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      exportToCSV(
        headers,
        data,
        getExportFilename(filename)
      );
    } catch (error) {
      console.error("Error exporting to CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          disabled={isExporting || data.length === 0}
        >
          <DownloadCloud className="mr-2 h-4 w-4" />
          Export
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileDown className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}