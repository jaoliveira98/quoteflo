"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Pie, PieChart, Cell, Label } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
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

const barChartConfig = {
  quotes: {
    label: "Total Quotes",
    color: "hsl(142 76% 36% / 0.3)",
  },
  accepted: {
    label: "Accepted",
    color: "hsl(142 76% 36%)",
  },
} satisfies ChartConfig;

export function AnalyticsCharts({ monthlyData, statusData }: AnalyticsChartsProps) {
  const totalStatusValue = statusData.reduce((sum, d) => sum + d.value, 0);
  const hasMonthlyData = monthlyData.some(d => d.quotes > 0);

  const pieChartConfig = statusData.reduce<ChartConfig>((acc, item) => {
    acc[item.name.toLowerCase()] = {
      label: item.name,
      color: item.color,
    };
    return acc;
  }, {});

  return (
    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
      {/* Monthly Quote Activity - Bar Chart */}
      <Card className="flex flex-col min-w-0 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-lg">Monthly Activity</CardTitle>
          <span className="text-xs text-surface-400 flex-shrink-0">Last 6 months</span>
        </CardHeader>
        <CardContent className="flex-1 min-w-0">
          {hasMonthlyData ? (
            <ChartContainer config={barChartConfig} className="h-72 w-full min-w-0 max-w-full">
              <BarChart
                data={monthlyData}
                margin={{ top: 8, right: 4, bottom: 0, left: -20 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => {
                        const dataItem = (item as Record<string, unknown>).payload as MonthlyData;
                        if (name === "quotes") {
                          return (
                            <div className="flex flex-1 justify-between leading-none items-center">
                              <span className="text-muted-foreground">Total Quotes</span>
                              <span className="font-mono font-medium tabular-nums text-foreground ml-4">
                                {String(value)}
                              </span>
                            </div>
                          );
                        }
                        return (
                          <div className="flex flex-col gap-1">
                            <div className="flex flex-1 justify-between leading-none items-center">
                              <span className="text-muted-foreground">Accepted</span>
                              <span className="font-mono font-medium tabular-nums text-foreground ml-4">
                                {String(value)}
                              </span>
                            </div>
                            <div className="flex flex-1 justify-between leading-none items-center border-t border-border/50 pt-1 mt-0.5">
                              <span className="text-muted-foreground">Value</span>
                              <span className="font-mono font-medium tabular-nums text-foreground ml-4">
                                {formatCurrency(dataItem.value)}
                              </span>
                            </div>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="quotes"
                  fill="var(--color-quotes)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
                <Bar
                  dataKey="accepted"
                  fill="var(--color-accepted)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-72 flex items-center justify-center flex-1">
              <div className="text-center">
                <div className="h-14 w-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-7 w-7 text-surface-300" />
                </div>
                <p className="font-medium text-surface-700 mb-1">No data yet</p>
                <p className="text-sm text-surface-500">Create quotes to see trends</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Distribution - Pie Chart */}
      <Card className="flex flex-col min-w-0 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-lg">Status Distribution</CardTitle>
          <span className="text-xs text-surface-400 flex-shrink-0">All quotes</span>
        </CardHeader>
        <CardContent className="flex-1 min-w-0">
          {statusData.length > 0 ? (
            <div className="space-y-4 min-w-0">
              <ChartContainer config={pieChartConfig} className="h-56 w-full min-w-0 max-w-full">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => {
                          const item = statusData.find(
                            d => d.name.toLowerCase() === String(name).toLowerCase()
                          );
                          const numValue = Number(value);
                          const percentage = totalStatusValue > 0
                            ? Math.round((numValue / totalStatusValue) * 100)
                            : 0;
                          return (
                            <div className="flex flex-1 justify-between leading-none items-center">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                  style={{ backgroundColor: item?.color }}
                                />
                                <span className="text-muted-foreground">{item?.name || String(name)}</span>
                              </div>
                              <span className="font-mono font-medium tabular-nums text-foreground ml-4">
                                {numValue} ({percentage}%)
                              </span>
                            </div>
                          );
                        }}
                        hideIndicator
                      />
                    }
                  />
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    strokeWidth={3}
                    stroke="hsl(var(--background))"
                    paddingAngle={2}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {totalStatusValue}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 22}
                                className="fill-muted-foreground text-xs"
                              >
                                Total Quotes
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-1">
                {statusData.map((entry) => {
                  const percentage = totalStatusValue > 0
                    ? Math.round((entry.value / totalStatusValue) * 100)
                    : 0;
                  return (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs text-surface-500">
                        {entry.name} <span className="font-medium text-surface-700">{entry.value}</span> ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center flex-1">
              <div className="text-center">
                <div className="h-14 w-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                  <PieChartIcon className="h-7 w-7 text-surface-300" />
                </div>
                <p className="font-medium text-surface-700 mb-1">No data yet</p>
                <p className="text-sm text-surface-500">Create quotes to see distribution</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
