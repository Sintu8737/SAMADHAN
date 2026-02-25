import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ReactiveMaintenance } from "../types";
import { getOrgName } from "../data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AlertTriangle,
  Clock,
  IndianRupee,
  Wrench,
  TrendingUp,
  ShieldAlert,
  Gauge,
  Activity,
} from "lucide-react";

interface RMStatsChartProps {
  maintenanceData: ReactiveMaintenance[];
}

interface CostExceedEntry {
  label: string;
  name: string;
  equipmentCost: number;
  repairCost: number;
  pct: number;
  unit: string;
}

const COST_THRESHOLD_OPTIONS = [50, 60, 70, 80, 90, 100];

const barConfig = {
  equipmentCost: {
    label: "Equipment Cost",
    color: "hsl(215, 70%, 55%)",
  },
  repairCost: {
    label: "Repair Cost",
    color: "hsl(0, 72%, 51%)",
  },
} satisfies ChartConfig;

const RMStatsChart: React.FC<RMStatsChartProps> = ({ maintenanceData }) => {
  const [costThreshold, setCostThreshold] = useState(70);

  const stats = useMemo(() => {
    let totalRepairCost = 0;
    let totalBreakdowns = 0;
    let totalDowntimeDays = 0;
    let totalRepairs = 0;

    // For MTBF: calculate average days between consecutive failures per equipment
    const mtbfValues: number[] = [];
    // For MTTR: average downtime per repair
    const mttrValues: number[] = [];

    // Cost exceedance tracking
    const costExceedEntries: CostExceedEntry[] = [];

    maintenanceData.forEach((record) => {
      totalRepairCost += record.totalCost;
      totalBreakdowns += record.totalBreakdowns;
      totalDowntimeDays += record.totalDowntime;
      totalRepairs += record.repairs.length;

      // MTTR: each repair's downtime
      record.repairs.forEach((r) => {
        mttrValues.push(r.downtime);
      });

      // MTBF: sort repairs by date and calculate gaps
      if (record.repairs.length >= 2) {
        const sorted = [...record.repairs].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        for (let i = 1; i < sorted.length; i++) {
          const prev = new Date(sorted[i - 1].date);
          const curr = new Date(sorted[i].date);
          const daysBetween = Math.round(
            (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
          );
          if (daysBetween > 0) {
            mtbfValues.push(daysBetween);
          }
        }
      }

      // Cost exceedance check
      const equipCost = record.equipment.cost;
      const repairPct =
        equipCost > 0 ? (record.totalCost / equipCost) * 100 : 0;
      if (repairPct >= costThreshold) {
        const unitName = getOrgName(record.organizationId);
        costExceedEntries.push({
          label: `${record.equipment.name} (${unitName})`,
          name: record.equipment.name,
          equipmentCost: equipCost,
          repairCost: record.totalCost,
          pct: Math.round(repairPct),
          unit: unitName,
        });
      }
    });

    const mtbf =
      mtbfValues.length > 0
        ? Math.round(mtbfValues.reduce((a, b) => a + b, 0) / mtbfValues.length)
        : 0;

    const mttr =
      mttrValues.length > 0
        ? parseFloat(
            (mttrValues.reduce((a, b) => a + b, 0) / mttrValues.length).toFixed(
              1,
            ),
          )
        : 0;

    // Sort cost exceed entries by percentage descending
    costExceedEntries.sort((a, b) => b.pct - a.pct);

    return {
      totalRepairCost,
      totalBreakdowns,
      totalDowntimeDays,
      totalRepairs,
      mtbf,
      mttr,
      costExceedEntries,
    };
  }, [maintenanceData, costThreshold]);

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  if (maintenanceData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Reactive Maintenance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">
              No reactive maintenance data available for the selected hierarchy.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Reactive Maintenance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* MTBF */}
          <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 border-blue-200 px-4 py-4">
            <div className="absolute -right-3 -top-3 opacity-[0.07]">
              <Gauge className="h-20 w-20 text-blue-900" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg bg-blue-600/10 p-1.5">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
                  MTBF
                </p>
              </div>
              <p className="text-3xl font-extrabold text-blue-700 leading-none">
                {stats.mtbf}
              </p>
              <p className="text-[11px] text-blue-600/80 mt-1">
                days between failures
              </p>
            </div>
          </div>

          {/* MTTR */}
          <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-amber-50 via-amber-50 to-amber-100 border-amber-200 px-4 py-4">
            <div className="absolute -right-3 -top-3 opacity-[0.07]">
              <Wrench className="h-20 w-20 text-amber-900" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg bg-amber-600/10 p-1.5">
                  <Wrench className="h-4 w-4 text-amber-600" />
                </div>
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                  MTTR
                </p>
              </div>
              <p className="text-3xl font-extrabold text-amber-700 leading-none">
                {stats.mttr}
              </p>
              <p className="text-[11px] text-amber-600/80 mt-1">
                days avg repair time
              </p>
            </div>
          </div>

          {/* Total Repair Cost */}
          <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-red-50 via-red-50 to-red-100 border-red-200 px-4 py-4">
            <div className="absolute -right-3 -top-3 opacity-[0.07]">
              <IndianRupee className="h-20 w-20 text-red-900" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg bg-red-600/10 p-1.5">
                  <IndianRupee className="h-4 w-4 text-red-600" />
                </div>
                <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">
                  Total Cost
                </p>
              </div>
              <p className="text-3xl font-extrabold text-red-700 leading-none">
                {formatCurrency(stats.totalRepairCost)}
              </p>
              <p className="text-[11px] text-red-600/80 mt-1">
                cumulative repair spend
              </p>
            </div>
          </div>

          {/* Total Breakdowns */}
          <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 border-orange-200 px-4 py-4">
            <div className="absolute -right-3 -top-3 opacity-[0.07]">
              <Activity className="h-20 w-20 text-orange-900" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg bg-orange-600/10 p-1.5">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide">
                  Breakdowns
                </p>
              </div>
              <p className="text-3xl font-extrabold text-orange-700 leading-none">
                {stats.totalBreakdowns}
              </p>
              <p className="text-[11px] text-orange-600/80 mt-1">
                across {maintenanceData.length} assets
              </p>
            </div>
          </div>

          {/* Total Downtime */}
          <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 border-slate-200 px-4 py-4">
            <div className="absolute -right-3 -top-3 opacity-[0.07]">
              <Clock className="h-20 w-20 text-slate-900" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg bg-slate-600/10 p-1.5">
                  <Clock className="h-4 w-4 text-slate-600" />
                </div>
                <p className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
                  Downtime
                </p>
              </div>
              <p className="text-3xl font-extrabold text-slate-700 leading-none">
                {stats.totalDowntimeDays}
              </p>
              <p className="text-[11px] text-slate-600/80 mt-1">
                total days lost
              </p>
            </div>
          </div>

          {/* Assets Exceeding Threshold */}
          <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 border-purple-200 px-4 py-4">
            <div className="absolute -right-3 -top-3 opacity-[0.07]">
              <ShieldAlert className="h-20 w-20 text-purple-900" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg bg-purple-600/10 p-1.5">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-xs font-semibold text-purple-800 uppercase tracking-wide">
                  Cost Alert
                </p>
              </div>
              <p className="text-3xl font-extrabold text-purple-700 leading-none">
                {stats.costExceedEntries.length}
              </p>
              <p className="text-[11px] text-purple-600/80 mt-1">
                assets &gt;{costThreshold}% of value
              </p>
            </div>
          </div>
        </div>

        {/* Cost Exceedance Section */}
        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <p className="text-sm font-medium text-red-700">
                Repair Cost Breach Analysis ({costThreshold}% Threshold)
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Select
                value={String(costThreshold)}
                onValueChange={(val) => setCostThreshold(Number(val))}
              >
                <SelectTrigger className="h-7 w-[80px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COST_THRESHOLD_OPTIONS.map((t) => (
                    <SelectItem key={t} value={String(t)}>
                      {t}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {stats.costExceedEntries.length > 0 ? (
            <ChartContainer
              config={barConfig}
              className="w-full"
              style={{
                height: `${Math.max(160, stats.costExceedEntries.length * 40)}px`,
              }}
            >
              <BarChart
                data={stats.costExceedEntries}
                layout="vertical"
                margin={{ left: 0, right: 12, top: 0, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <YAxis
                  dataKey="label"
                  type="category"
                  width={180}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <ChartTooltip
                  cursor={{ fill: "hsl(0, 0%, 90%, 0.3)" }}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name, item) => {
                        const entry = item.payload as CostExceedEntry;
                        if (name === "equipmentCost") {
                          return (
                            <div className="space-y-1">
                              <p className="font-medium">{entry.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {entry.unit}
                              </p>
                              <p className="text-blue-600 text-sm">
                                Equipment Value:{" "}
                                {formatCurrency(entry.equipmentCost)}
                              </p>
                            </div>
                          );
                        }
                        return (
                          <div className="space-y-1">
                            <p className="font-medium">{entry.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.unit}
                            </p>
                            <p className="text-red-600 text-sm">
                              Repair Cost: {formatCurrency(entry.repairCost)} (
                              {entry.pct}%)
                            </p>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="equipmentCost"
                  fill="hsl(215, 70%, 55%)"
                  radius={[0, 4, 4, 0]}
                  barSize={14}
                  name="Equipment Cost"
                />
                <Bar
                  dataKey="repairCost"
                  fill="hsl(0, 72%, 51%)"
                  radius={[0, 4, 4, 0]}
                  barSize={14}
                  name="Repair Cost"
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <p className="text-sm">
                No assets have crossed {costThreshold}% of their equipment
                value.
              </p>
            </div>
          )}

          {/* Legend */}
          {stats.costExceedEntries.length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-[hsl(215,70%,55%)] inline-block" />
                Equipment Value
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-[hsl(0,72%,51%)] inline-block" />
                Repair Cost
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RMStatsChart;
