import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

// Add typings for the jspdf-autotable plugin
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Exports data to a PDF file
 * @param title - The title of the PDF document
 * @param headers - The column headers for the table
 * @param data - The data rows for the table
 * @param filename - The filename to save as (without extension)
 */
export function exportToPDF(
  title: string,
  headers: string[],
  data: any[],
  filename: string = 'export'
): void {
  const doc = new jsPDF();
  
  // Set title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Format data for autotable - transform objects to arrays
  const tableData = data.map(row => {
    if (Array.isArray(row)) {
      return row;
    }
    // If row is an object, extract values in order of headers
    return headers.map(header => {
      // Safely handle potential undefined/null values
      const value = row[header] ?? '';
      // Format percentages
      if (typeof value === 'number' && header.includes('rate')) {
        return `${value.toFixed(1)}%`;
      }
      return value;
    });
  });
  
  // Generate table
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 35,
    headStyles: {
      fillColor: [41, 128, 185], // Primary blue color
      textColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    margin: { top: 40 }
  });
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Exports data to a CSV file
 * @param headers - The column headers for the CSV
 * @param data - The data objects or arrays
 * @param filename - The filename to save as (without extension)
 */
export function exportToCSV(
  headers: string[],
  data: any[],
  filename: string = 'export'
): void {
  let csvData: any[];
  
  // If data is already array of arrays, use it directly
  if (data.length > 0 && Array.isArray(data[0])) {
    csvData = data;
  } else {
    // Otherwise transform objects to arrays matching header order
    csvData = data.map(item => {
      return headers.map(header => {
        const value = item[header] ?? '';
        // Format percentages
        if (typeof value === 'number' && header.includes('rate')) {
          return `${value.toFixed(1)}%`;
        }
        return value;
      });
    });
  }
  
  // Add headers as first row
  csvData.unshift(headers);
  
  // Convert to CSV using Papa Parse
  const csv = Papa.unparse(csvData);
  
  // Create a blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${filename}.csv`);
}

/**
 * Creates a filename with current date appended
 * @param prefix - The prefix for the filename
 * @returns Formatted filename with date
 */
export function getExportFilename(prefix: string): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${prefix}_${date}`;
}