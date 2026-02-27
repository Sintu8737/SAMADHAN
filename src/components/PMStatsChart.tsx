import React, { useMemo } from "react";
import {
  Pie,
  PieChart,
  Cell,
  Label,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { PreventiveMaintenance } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface PMStatsChartProps {
  maintenanceData: PreventiveMaintenance[];
}

interface OverdueReasonEntry {
  reason: string;
  count: number;
  equipments: string[];
}

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(152, 57%, 36%)",
  },
  scheduled: {
    label: "Scheduled",
    color: "hsl(40, 96%, 50%)",
  },
  overdue: {
    label: "Overdue",
    color: "hsl(0, 72%, 51%)",
  },
} satisfies ChartConfig;

const COLORS = [
  chartConfig.completed.color,
  chartConfig.scheduled.color,
  chartConfig.overdue.color,
];

const overdueBarConfig = {
  count: {
    label: "Overdue Count",
    color: "hsl(0, 72%, 51%)",
  },
} satisfies ChartConfig;

const PMStatsChart: React.FC<PMStatsChartProps> = ({ maintenanceData }) => {
  const stats = useMemo(() => {
    let completed = 0;
    let scheduled = 0;
    let overdue = 0;
    const overdueByReason = new Map<
      string,
      { count: number; equipments: Set<string> }
    >();

    maintenanceData.forEach((record) => {
      record.quarters.forEach((q) => {
        if (q.status === "completed") {
          completed++;
        } else if (q.status === "scheduled") {
          scheduled++;
        } else if (q.status === "overdue") {
          overdue++;
          const reason = q.comment?.trim() || "No reason specified";
          const existing = overdueByReason.get(reason) || {
            count: 0,
            equipments: new Set<string>(),
          };
          existing.count++;
          existing.equipments.add(record.equipment.name);
          overdueByReason.set(reason, existing);
        }
      });
    });

    const total = completed + scheduled + overdue;

    const overdueReasons: OverdueReasonEntry[] = Array.from(
      overdueByReason.entries(),
    )
      .map(([reason, data]) => ({
        reason,
        count: data.count,
        equipments: Array.from(data.equipments),
      }))
      .sort((a, b) => b.count - a.count);

    return { completed, scheduled, overdue, total, overdueReasons };
  }, [maintenanceData]);

  const pieData = useMemo(
    () => [
      { name: "completed", value: stats.completed, fill: COLORS[0] },
      { name: "scheduled", value: stats.scheduled, fill: COLORS[1] },
      { name: "overdue", value: stats.overdue, fill: COLORS[2] },
    ],
    [stats],
  );

  const pct = (val: number) =>
    stats.total > 0 ? ((val / stats.total) * 100).toFixed(1) : "0";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">PM Compliance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.total === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">
              No maintenance data available for the selected hierarchy.
            </p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 ${stats.overdueReasons.length > 0 ? "lg:grid-cols-2" : ""} gap-6`}
          >
            {/* Left: Donut + Stats */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-4">
              {/* Donut Chart */}
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-[220px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index]} />
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
                                y={(viewBox.cy || 0) - 8}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {stats.total}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 12}
                                className="fill-muted-foreground text-xs"
                              >
                                Total PMs
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                  />
                </PieChart>
              </ChartContainer>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 lg:grid-cols-3 gap-2 min-w-[300px]">
                <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 border-emerald-200 px-3 py-3">
                  <div className="absolute -right-2 -top-2 opacity-[0.07]">
                    <CheckCircle2 className="h-14 w-14 text-emerald-900" />
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="rounded-md bg-emerald-600/10 p-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
                        Completed
                      </p>
                    </div>
                    <p className="text-2xl font-extrabold text-emerald-700 leading-none">
                      {stats.completed}
                    </p>
                    <p className="text-[11px] text-emerald-600/80 mt-1">
                      {pct(stats.completed)}% of total
                    </p>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-amber-50 via-amber-50 to-amber-100 border-amber-200 px-3 py-3">
                  <div className="absolute -right-2 -top-2 opacity-[0.07]">
                    <Clock className="h-14 w-14 text-amber-900" />
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="rounded-md bg-amber-600/10 p-1">
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">
                        Scheduled
                      </p>
                    </div>
                    <p className="text-2xl font-extrabold text-amber-700 leading-none">
                      {stats.scheduled}
                    </p>
                    <p className="text-[11px] text-amber-600/80 mt-1">
                      {pct(stats.scheduled)}% of total
                    </p>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-red-50 via-red-50 to-red-100 border-red-200 px-3 py-3">
                  <div className="absolute -right-2 -top-2 opacity-[0.07]">
                    <AlertTriangle className="h-14 w-14 text-red-900" />
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="rounded-md bg-red-600/10 p-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                      </div>
                      <p className="text-[11px] font-semibold text-red-800 uppercase tracking-wide">
                        Overdue
                      </p>
                    </div>
                    <p className="text-2xl font-extrabold text-red-700 leading-none">
                      {stats.overdue}
                    </p>
                    <p className="text-[11px] text-red-600/80 mt-1">
                      {pct(stats.overdue)}% of total
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Overdue Reasons Bar Chart — only when overdues exist */}
            {stats.overdueReasons.length > 0 && (
              <div className="lg:border-l lg:pl-4 border-t lg:border-t-0 pt-4 lg:pt-0 flex flex-col">
                <p className="text-sm font-medium text-red-700 mb-2">
                  Overdue Reasons ({stats.overdueReasons.length})
                </p>
                <ChartContainer
                  config={overdueBarConfig}
                  className="w-full flex-1"
                  style={{
                    minHeight: `${Math.max(160, stats.overdueReasons.length * 28)}px`,
                  }}
                >
                  <BarChart
                    data={stats.overdueReasons}
                    layout="vertical"
                    margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <YAxis
                      dataKey="reason"
                      type="category"
                      width={160}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10 }}
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10 }}
                    />
                    <ChartTooltip
                      cursor={{ fill: "hsl(0, 72%, 51%, 0.08)" }}
                      content={
                        <ChartTooltipContent
                          hideLabel
                          formatter={(value, _name, item) => {
                            const entry = item.payload as OverdueReasonEntry;
                            return (
                              <div className="space-y-1">
                                <p className="font-medium text-red-700">
                                  {entry.reason}
                                </p>
                                <p className="text-sm">
                                  {String(value)} overdue quarter(s)
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  Equipment: {entry.equipments.join(", ")}
                                </p>
                              </div>
                            );
                          }}
                        />
                      }
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(0, 72%, 51%)"
                      radius={[0, 4, 4, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PMStatsChart;
