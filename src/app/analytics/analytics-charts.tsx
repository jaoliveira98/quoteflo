"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MonthlyData {
  month: string;
  quotes: number;
  value: number;
  accepted: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsChartsProps {
  monthlyData: MonthlyData[];
  statusData: StatusData[];
}

export function AnalyticsCharts({ monthlyData, statusData }: AnalyticsChartsProps) {
  const maxValue = Math.max(...monthlyData.map(d => d.value), 1);
  const maxQuotes = Math.max(...monthlyData.map(d => d.quotes), 1);
  const totalStatusValue = statusData.reduce((sum, d) => sum + d.value, 0);

  return (
    <>
      {/* Quotes Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-surface-500" />
            Quotes Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {monthlyData.some(d => d.quotes > 0) ? (
              <div className="h-full flex flex-col">
                {/* Chart area */}
                <div className="flex-1 flex items-end gap-2">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      {/* Bar container */}
                      <div className="w-full flex flex-col items-center gap-1 h-48 justify-end">
                        {/* Value bar */}
                        <div 
                          className="w-full max-w-12 bg-brand-500 rounded-t-md transition-all duration-500 relative group"
                          style={{ height: `${(data.value / maxValue) * 100}%`, minHeight: data.value > 0 ? "4px" : "0" }}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {formatCurrency(data.value)}
                          </div>
                        </div>
                        {/* Quotes count indicator */}
                        <div 
                          className="w-full max-w-8 bg-blue-400 rounded-t-sm transition-all duration-500"
                          style={{ height: `${(data.quotes / maxQuotes) * 40}%`, minHeight: data.quotes > 0 ? "4px" : "0" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* X-axis labels */}
                <div className="flex gap-2 mt-2 border-t border-surface-200 pt-2">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="flex-1 text-center">
                      <p className="text-xs text-surface-600">{data.month}</p>
                      <p className="text-xs font-medium text-surface-900">{data.quotes}</p>
                    </div>
                  ))}
                </div>
                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-surface-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-brand-500 rounded" />
                    <span className="text-sm text-surface-600">Value</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 rounded" />
                    <span className="text-sm text-surface-600">Quote Count</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-surface-300 mx-auto mb-3" />
                  <p className="text-surface-600">No data yet</p>
                  <p className="text-sm text-surface-500">Create quotes to see trends</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="h-5 w-5 text-surface-500" />
            Quote Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {statusData.length > 0 ? (
              <div className="h-full flex items-center gap-6">
                {/* Donut chart visualization */}
                <div className="relative w-40 h-40 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {statusData.reduce((acc, data, index) => {
                      const percentage = (data.value / totalStatusValue) * 100;
                      const offset = acc.offset;
                      const circumference = 2 * Math.PI * 35; // radius = 35
                      const strokeLength = (percentage / 100) * circumference;
                      
                      acc.elements.push(
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke={data.color}
                          strokeWidth="20"
                          strokeDasharray={`${strokeLength} ${circumference}`}
                          strokeDashoffset={-offset}
                          className="transition-all duration-500"
                        />
                      );
                      
                      acc.offset += strokeLength;
                      return acc;
                    }, { elements: [] as JSX.Element[], offset: 0 }).elements}
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold text-surface-900">{totalStatusValue}</p>
                    <p className="text-xs text-surface-500">Total</p>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-3">
                  {statusData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: data.color }}
                        />
                        <span className="text-sm text-surface-700">{data.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-surface-900">{data.value}</span>
                        <span className="text-xs text-surface-500 w-10 text-right">
                          {Math.round((data.value / totalStatusValue) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-surface-300 mx-auto mb-3" />
                  <p className="text-surface-600">No data yet</p>
                  <p className="text-sm text-surface-500">Create quotes to see distribution</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
