"use client";

import React from "react";
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
  const maxQuotes = Math.max(...monthlyData.map(d => d.quotes), 1);
  const totalStatusValue = statusData.reduce((sum, d) => sum + d.value, 0);

  // Generate Y-axis ticks (0, 25%, 50%, 75%, max)
  const yTicks = [0, 1, 2, 3, 4].map(i => Math.round((maxQuotes / 4) * i));
  // Deduplicate and ensure max is always included
  const uniqueTicks = [...new Set([...yTicks, maxQuotes])].sort((a, b) => a - b);

  return (
    <>
      {/* Monthly Quote Activity */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-surface-100 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-surface-600" />
              </div>
              Monthly Activity
            </CardTitle>
            <p className="text-xs text-surface-400 mt-1">Last 6 months</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {monthlyData.some(d => d.quotes > 0) ? (
              <div className="h-full flex flex-col">
                {/* Chart area with Y-axis */}
                <div className="flex-1 flex gap-2">
                  {/* Y-axis labels */}
                  <div className="flex flex-col justify-between py-1 w-6 flex-shrink-0">
                    {[...uniqueTicks].reverse().map((tick, i) => (
                      <span key={i} className="text-[10px] text-surface-400 text-right leading-none tabular-nums">
                        {tick}
                      </span>
                    ))}
                  </div>

                  {/* Bars */}
                  <div className="flex-1 flex items-end gap-2 relative border-l border-b border-surface-200 pl-2 pb-0.5">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pl-2">
                      {uniqueTicks.map((_, i) => (
                        <div key={i} className="border-b border-dashed border-surface-100 last:border-0" />
                      ))}
                    </div>

                    {monthlyData.map((data, index) => {
                      const totalHeight = maxQuotes > 0 ? (data.quotes / maxQuotes) * 100 : 0;
                      const acceptedHeight = data.quotes > 0 ? (data.accepted / data.quotes) * 100 : 0;

                      return (
                        <div key={index} className="flex-1 flex flex-col items-center relative z-10 h-full justify-end group">
                          {/* The bar */}
                          <div
                            className="w-full max-w-12 rounded-t-md relative overflow-hidden transition-all duration-700 ease-out"
                            style={{
                              height: `${totalHeight}%`,
                              minHeight: data.quotes > 0 ? "6px" : "0",
                            }}
                          >
                            {/* Base: total quotes (light) */}
                            <div className="absolute inset-0 bg-brand-200 group-hover:bg-brand-300 transition-colors" />
                            {/* Overlay: accepted portion (solid green, grows from bottom) */}
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-brand-500 group-hover:bg-brand-600 transition-colors rounded-t-sm"
                              style={{ height: `${acceptedHeight}%` }}
                            />
                          </div>

                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-surface-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-strong">
                            <p className="font-semibold mb-1">{data.month}</p>
                            <div className="space-y-0.5 text-[11px]">
                              <p className="flex items-center gap-2 justify-between">
                                <span className="text-surface-300">Quotes</span>
                                <span className="font-medium">{data.quotes}</span>
                              </p>
                              <p className="flex items-center gap-2 justify-between">
                                <span className="text-surface-300">Accepted</span>
                                <span className="font-medium text-green-400">{data.accepted}</span>
                              </p>
                              <p className="flex items-center gap-2 justify-between border-t border-surface-700 pt-1 mt-1">
                                <span className="text-surface-300">Value</span>
                                <span className="font-medium">{formatCurrency(data.value)}</span>
                              </p>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-surface-900" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* X-axis labels */}
                <div className="flex gap-2 ml-8 mt-2">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="flex-1 text-center">
                      <p className="text-[11px] font-medium text-surface-500">{data.month}</p>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-5 mt-3 pt-3 border-t border-surface-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-brand-200 border border-brand-300" />
                    <span className="text-xs text-surface-500">Total quotes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-brand-500" />
                    <span className="text-xs text-surface-500">Accepted</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="h-14 w-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-7 w-7 text-surface-300" />
                  </div>
                  <p className="font-medium text-surface-700 mb-1">No data yet</p>
                  <p className="text-sm text-surface-500">Create quotes to see trends</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-surface-100 flex items-center justify-center">
              <PieChart className="h-4 w-4 text-surface-600" />
            </div>
            Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {statusData.length > 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-6">
                {/* Donut chart */}
                <div className="relative w-44 h-44 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {statusData.reduce((acc, data, index) => {
                      const percentage = (data.value / totalStatusValue) * 100;
                      const offset = acc.offset;
                      const circumference = 2 * Math.PI * 35;
                      const strokeLength = (percentage / 100) * circumference;
                      const gap = statusData.length > 1 ? 2 : 0;
                      
                      acc.elements.push(
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke={data.color}
                          strokeWidth="18"
                          strokeDasharray={`${Math.max(strokeLength - gap, 0)} ${circumference - Math.max(strokeLength - gap, 0)}`}
                          strokeDashoffset={-offset}
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-out"
                        />
                      );
                      
                      acc.offset += strokeLength;
                      return acc;
                    }, { elements: [] as React.ReactElement[], offset: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-surface-900 leading-none">{totalStatusValue}</p>
                    <p className="text-xs text-surface-400 mt-1">Total Quotes</p>
                  </div>
                </div>

                {/* Legend */}
                <div className="w-full grid grid-cols-2 gap-x-6 gap-y-2 px-2">
                  {statusData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: data.color }}
                        />
                        <span className="text-xs text-surface-600 truncate">{data.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs font-semibold text-surface-900">{data.value}</span>
                        <span className="text-[10px] text-surface-400">
                          ({Math.round((data.value / totalStatusValue) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="h-14 w-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                    <PieChart className="h-7 w-7 text-surface-300" />
                  </div>
                  <p className="font-medium text-surface-700 mb-1">No data yet</p>
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
