import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to locale string
export function formatDate(date: Date | string | null): string {
  if (!date) return "N/A";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return `Today, ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (isYesterday(dateObj)) {
    return `Yesterday, ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
}

// Format numeric ID with leading zeros and prefix
export function formatId(id: number | string, prefix: string, digits: number = 4): string {
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  return `${prefix}-${numericId.toString().padStart(digits, '0')}`;
}

// Generate random incremental values within a range for demo
export function generateTrendData(count: number, minRange: number, maxRange: number): number[] {
  const result: number[] = [];
  let lastValue = Math.floor(Math.random() * (maxRange - minRange) + minRange);
  
  for (let i = 0; i < count; i++) {
    result.push(lastValue);
    // Change by -15% to +15%
    const change = lastValue * (Math.random() * 0.3 - 0.15);
    lastValue = Math.max(minRange, Math.min(maxRange, lastValue + change));
  }
  
  return result;
}

// Converts hex color to rgba for transparency
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Get color based on severity (1-10)
export function getSeverityColor(severity: number): string {
  if (severity >= 8) return 'text-destructive';
  if (severity >= 5) return 'text-amber-500';
  return 'text-primary';
}

// Get status colors
export function getStatusColor(status: string): { bg: string, text: string } {
  switch (status.toLowerCase()) {
    case 'done':
      return { bg: 'bg-primary/20', text: 'text-primary' };
    case 'in progress':
      return { bg: 'bg-amber-500/20', text: 'text-amber-500' };
    case 'false positive':
    case 'fp':
      return { bg: 'bg-destructive/20', text: 'text-destructive' };
    case 'waiting':
    case 'waiting for identification':
      return { bg: 'bg-secondary/20', text: 'text-secondary' };
    case 'not related yet':
      return { bg: 'bg-purple-500/20', text: 'text-purple-500' };
    case 'reopened':
      return { bg: 'bg-orange-500/20', text: 'text-orange-500' };
    default:
      return { bg: 'bg-gray-500/20', text: 'text-gray-500' };
  }
}

// Get enforcement colors
export function getEnforcementColor(enforcement: string): { bg: string, text: string } {
  switch (enforcement.toLowerCase()) {
    case 'active':
      return { bg: 'bg-primary/20', text: 'text-primary' };
    case 'silent':
      return { bg: 'bg-amber-500/20', text: 'text-amber-500' };
    case 'disabled':
      return { bg: 'bg-gray-500/20', text: 'text-gray-400' };
    default:
      return { bg: 'bg-gray-500/20', text: 'text-gray-500' };
  }
}
