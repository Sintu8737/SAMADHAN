import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  Label,
  LabelList,
} from "recharts";
import { CurrentRepairState } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Building2,
  Shield,
  Landmark,
  FileCheck,
  Clock,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import { computeCurrentStage } from "../data/mockData";

interface CRSStatsChartProps {
  crsData: CurrentRepairState[];
}

const daysBetween = (d1: string, d2: string): number => {
  return Math.round(
    (new Date(d2).getTime() - new Date(d1).getTime()) / (1000 * 60 * 60 * 24),
  );
};

const avgBarConfig = {
  avgDays: {
    label: "Avg Days",
    color: "hsl(215, 70%, 55%)",
  },
} satisfies ChartConfig;

const pdcChartConfig = {
  beforeTime: {
    label: "Before Time",
    color: "hsl(152, 57%, 36%)",
  },
  onTime: {
    label: "On Time",
    color: "hsl(215, 70%, 55%)",
  },
  missed: {
    label: "PDC Missed",
    color: "hsl(0, 72%, 51%)",
  },
  inProgress: {
    label: "In Progress",
    color: "hsl(40, 96%, 50%)",
  },
} satisfies ChartConfig;

const PDC_COLORS = [
  pdcChartConfig.beforeTime.color,
  pdcChartConfig.onTime.color,
  pdcChartConfig.missed.color,
  pdcChartConfig.inProgress.color,
];

const vendorBarConfig = {
  early: {
    label: "Before Time",
    color: "hsl(152, 57%, 36%)",
  },
  onTime: {
    label: "On Time",
    color: "hsl(215, 70%, 55%)",
  },
  missed: {
    label: "PDC Missed",
    color: "hsl(0, 72%, 51%)",
  },
} satisfies ChartConfig;

const delayBarConfig = {
  avgDelayDays: {
    label: "Avg Delay Days",
    color: "hsl(0, 72%, 51%)",
  },
} satisfies ChartConfig;

const CRSStatsChart: React.FC<CRSStatsChartProps> = ({ crsData }) => {
  const stats = useMemo(() => {
    // Avg time calculations for each stage transition
    const workshopDays: number[] = [];
    const emeBnDays: number[] = [];
    const divHqDays: number[] = [];
    const engrRgtDays: number[] = [];

    // PDC tracking
    let pdcBeforeTime = 0;
    let pdcOnTime = 0;
    let pdcMissed = 0;
    let pdcPending = 0;

    // Vendor delay tracking
    const vendorDelays = new Map<
      string,
      {
        missed: number;
        onTime: number;
        early: number;
        totalDelayDays: number;
        equipments: string[];
      }
    >();

    crsData.forEach((record) => {
      // Workshop: woFwdByUnit → woToEMEBN
      if (record.woFwdByUnit && record.woToEMEBN) {
        const days = daysBetween(record.woFwdByUnit, record.woToEMEBN);
        if (days >= 0) workshopDays.push(days);
      }

      // EME Bn: woToEMEBN → notingOrder
      if (record.woToEMEBN && record.notingOrder) {
        const days = daysBetween(record.woToEMEBN, record.notingOrder);
        if (days >= 0) emeBnDays.push(days);
      }

      // Div HQ: notingOrder → roByDivHQ
      if (record.notingOrder && record.roByDivHQ) {
        const days = daysBetween(record.notingOrder, record.roByDivHQ);
        if (days >= 0) divHqDays.push(days);
      }

      // Engr Rgt: roByDivHQ → soByEngrRgt
      if (record.roByDivHQ && record.soByEngrRgt) {
        const days = daysBetween(record.roByDivHQ, record.soByEngrRgt);
        if (days >= 0) engrRgtDays.push(days);
      }

      // PDC analysis: compare vendorPDC with repairDone
      if (record.vendorPDC) {
        const vendorName = record.vendorName || "Unknown Vendor";
        const existing = vendorDelays.get(vendorName) || {
          missed: 0,
          onTime: 0,
          early: 0,
          totalDelayDays: 0,
          equipments: [],
        };

        if (record.repairDone) {
          const diff = daysBetween(record.vendorPDC, record.repairDone);

          if (diff < 0) {
            // Repair done before PDC
            pdcBeforeTime++;
            existing.early++;
          } else if (diff === 0) {
            pdcOnTime++;
            existing.onTime++;
          } else {
            // Repair done after PDC → missed
            pdcMissed++;
            existing.missed++;
            existing.totalDelayDays += diff;
            existing.equipments.push(record.equipment.name);
          }
        } else {
          // Has PDC but no repair done yet — check if PDC has passed
          const stage = computeCurrentStage(record);
          if (stage !== "repair-complete") {
            const pdcDate = new Date(record.vendorPDC);
            const today = new Date();
            if (pdcDate < today) {
              pdcMissed++;
              existing.missed++;
              const delayDays = daysBetween(
                record.vendorPDC,
                today.toISOString().split("T")[0],
              );
              existing.totalDelayDays += delayDays;
              existing.equipments.push(record.equipment.name);
            } else {
              pdcPending++;
            }
          }
        }

        vendorDelays.set(vendorName, existing);
      }
    });

    const avg = (arr: number[]) =>
      arr.length > 0
        ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1))
        : 0;

    const stageAvgs = [
      {
        stage: "Workshop",
        shortLabel: "Workshop",
        fullLabel: "Avg time by Workshop to forward Work Order",
        avgDays: avg(workshopDays),
        count: workshopDays.length,
        icon: Building2,
        color: "indigo",
      },
      {
        stage: "EME Battalion",
        shortLabel: "EME Battalion",
        fullLabel: "Avg time by EME Battalion to forward Noting Order",
        avgDays: avg(emeBnDays),
        count: emeBnDays.length,
        icon: Shield,
        color: "purple",
      },
      {
        stage: "Division HQ",
        shortLabel: "Division HQ",
        fullLabel: "Avg time by Division HQ to release Repair Order",
        avgDays: avg(divHqDays),
        count: divHqDays.length,
        icon: Landmark,
        color: "orange",
      },
      {
        stage: "Engineer Regiment",
        shortLabel: "Engr Regt",
        fullLabel: "Avg time by Engineer Regiment to release Supply Order",
        avgDays: avg(engrRgtDays),
        count: engrRgtDays.length,
        icon: FileCheck,
        color: "teal",
      },
    ];

    const pdcTotal = pdcBeforeTime + pdcOnTime + pdcMissed + pdcPending;

    // Build vendor delay summary sorted by missed count desc
    const vendorDelaySummary = Array.from(vendorDelays.entries())
      .map(([name, data]) => ({
        name,
        ...data,
        total: data.missed + data.onTime + data.early,
        avgDelayDays:
          data.missed > 0
            ? parseFloat((data.totalDelayDays / data.missed).toFixed(1))
            : 0,
      }))
      .sort(
        (a, b) => b.missed - a.missed || b.totalDelayDays - a.totalDelayDays,
      );

    return {
      stageAvgs,
      pdcBeforeTime,
      pdcOnTime,
      pdcMissed,
      pdcPending,
      pdcTotal,
      vendorDelaySummary,
    };
  }, [crsData]);

  const pdcPieData = useMemo(
    () => [
      { name: "beforeTime", value: stats.pdcBeforeTime, fill: PDC_COLORS[0] },
      { name: "onTime", value: stats.pdcOnTime, fill: PDC_COLORS[1] },
      { name: "missed", value: stats.pdcMissed, fill: PDC_COLORS[2] },
      { name: "inProgress", value: stats.pdcPending, fill: PDC_COLORS[3] },
    ],
    [stats],
  );

  const colorMap: Record<
    string,
    {
      bg: string;
      border: string;
      text: string;
      textLight: string;
      iconBg: string;
    }
  > = {
    indigo: {
      bg: "from-indigo-50 via-indigo-50 to-indigo-100",
      border: "border-indigo-200",
      text: "text-indigo-700",
      textLight: "text-indigo-600/80",
      iconBg: "bg-indigo-600/10",
    },
    purple: {
      bg: "from-purple-50 via-purple-50 to-purple-100",
      border: "border-purple-200",
      text: "text-purple-700",
      textLight: "text-purple-600/80",
      iconBg: "bg-purple-600/10",
    },
    orange: {
      bg: "from-orange-50 via-orange-50 to-orange-100",
      border: "border-orange-200",
      text: "text-orange-700",
      textLight: "text-orange-600/80",
      iconBg: "bg-orange-600/10",
    },
    teal: {
      bg: "from-teal-50 via-teal-50 to-teal-100",
      border: "border-teal-200",
      text: "text-teal-700",
      textLight: "text-teal-600/80",
      iconBg: "bg-teal-600/10",
    },
  };

  if (crsData.length === 0) {
    return null;
  }

  const hasPdcData = stats.pdcTotal > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">CRS Processing Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stage Avg KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.stageAvgs.map((item) => {
            const c = colorMap[item.color];
            const IconComponent = item.icon;
            return (
              <div
                key={item.stage}
                className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${c.bg} ${c.border} px-4 py-4`}
              >
                <div className="absolute -right-3 -top-3 opacity-[0.07]">
                  <IconComponent className="h-20 w-20" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`rounded-lg ${c.iconBg} p-1.5`}>
                      <Clock className={`h-4 w-4 ${c.text}`} />
                    </div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${c.text}`}
                    >
                      {item.shortLabel}
                    </p>
                  </div>
                  <p
                    className={`text-3xl font-extrabold leading-none ${c.text}`}
                  >
                    {item.avgDays}
                  </p>
                  <p className={`text-[11px] mt-1 ${c.textLight}`}>
                    avg days ({item.count} records)
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row: Bar Chart + PDC Donut */}
        <div
          className={`grid grid-cols-1 ${hasPdcData ? "lg:grid-cols-2" : ""} gap-6`}
        >
          {/* Left: Avg Processing Time Bar Chart */}
          <div className="flex flex-col">
            <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Average Processing Time by Stage
            </p>
            <ChartContainer config={avgBarConfig} className="w-full h-[220px]">
              <BarChart
                data={stats.stageAvgs}
                margin={{ left: 0, right: 16, top: 8, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="shortLabel"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "Days",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11, fill: "#64748b" },
                  }}
                />
                <ChartTooltip
                  cursor={{ fill: "hsl(215, 70%, 55%, 0.08)" }}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, _name, item) => {
                        const entry = item.payload;
                        return (
                          <div className="space-y-1">
                            <p className="font-medium text-slate-700">
                              {entry.stage}
                            </p>
                            <p className="text-sm">{entry.fullLabel}</p>
                            <p className="text-muted-foreground text-xs">
                              {String(value)} days avg ({entry.count} records)
                            </p>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Bar dataKey="avgDays" radius={[4, 4, 0, 0]} barSize={40}>
                  {stats.stageAvgs.map((entry, idx) => {
                    const colors = [
                      "hsl(239, 84%, 67%)", // indigo
                      "hsl(271, 91%, 65%)", // purple
                      "hsl(25, 95%, 53%)", // orange
                      "hsl(168, 76%, 42%)", // teal
                    ];
                    return <Cell key={entry.stage} fill={colors[idx]} />;
                  })}
                  <LabelList
                    dataKey="avgDays"
                    position="top"
                    formatter={(val: number) => `${val}d`}
                    style={{ fontSize: 12, fontWeight: 700, fill: "#334155" }}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>

          {/* Right: Vendor PDC Compliance Donut */}
          {hasPdcData && (
            <div className="flex flex-col items-center">
              <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2 self-start">
                <CalendarClock className="h-4 w-4 text-red-600" />
                Vendor PDC Compliance
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <ChartContainer
                  config={pdcChartConfig}
                  className="mx-auto aspect-square h-[200px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={pdcPieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={80}
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                    >
                      {pdcPieData.map((entry, index) => (
                        <Cell key={entry.name} fill={PDC_COLORS[index]} />
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
                                  {stats.pdcTotal}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 12}
                                  className="fill-muted-foreground text-xs"
                                >
                                  Total
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

                {/* PDC Stat Cards */}
                <div className="grid grid-cols-2 gap-2 min-w-[280px]">
                  <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 border-emerald-200 px-3 py-3">
                    <div className="absolute -right-2 -top-2 opacity-[0.07]">
                      <CalendarCheck className="h-14 w-14 text-emerald-900" />
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="rounded-md bg-emerald-600/10 p-1">
                          <CalendarCheck className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
                          Before
                        </p>
                      </div>
                      <p className="text-2xl font-extrabold text-emerald-700 leading-none">
                        {stats.pdcBeforeTime}
                      </p>
                      <p className="text-[11px] text-emerald-600/80 mt-1">
                        early finish
                      </p>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 border-blue-200 px-3 py-3">
                    <div className="absolute -right-2 -top-2 opacity-[0.07]">
                      <CalendarClock className="h-14 w-14 text-blue-900" />
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="rounded-md bg-blue-600/10 p-1">
                          <CalendarClock className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <p className="text-[11px] font-semibold text-blue-800 uppercase tracking-wide">
                          On Time
                        </p>
                      </div>
                      <p className="text-2xl font-extrabold text-blue-700 leading-none">
                        {stats.pdcOnTime}
                      </p>
                      <p className="text-[11px] text-blue-600/80 mt-1">
                        met PDC
                      </p>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-red-50 via-red-50 to-red-100 border-red-200 px-3 py-3">
                    <div className="absolute -right-2 -top-2 opacity-[0.07]">
                      <CalendarX className="h-14 w-14 text-red-900" />
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="rounded-md bg-red-600/10 p-1">
                          <CalendarX className="h-3.5 w-3.5 text-red-600" />
                        </div>
                        <p className="text-[11px] font-semibold text-red-800 uppercase tracking-wide">
                          Missed
                        </p>
                      </div>
                      <p className="text-2xl font-extrabold text-red-700 leading-none">
                        {stats.pdcMissed}
                      </p>
                      <p className="text-[11px] text-red-600/80 mt-1">
                        PDC breached
                      </p>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-amber-50 via-amber-50 to-amber-100 border-amber-200 px-3 py-3">
                    <div className="absolute -right-2 -top-2 opacity-[0.07]">
                      <CalendarClock className="h-14 w-14 text-amber-900" />
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="rounded-md bg-amber-600/10 p-1">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                        <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">
                          In Progress
                        </p>
                      </div>
                      <p className="text-2xl font-extrabold text-amber-700 leading-none">
                        {stats.pdcPending}
                      </p>
                      <p className="text-[11px] text-amber-600/80 mt-1">
                        repair ongoing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vendor PDC Performance */}
        {stats.vendorDelaySummary.length > 0 && (
          <div className="border rounded-lg p-3 space-y-4">
            <p className="text-sm font-medium text-slate-700">
              Vendor PDC Performance
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Stacked Bar — Vendor PDC Breakdown */}
              <div className="flex flex-col">
                <p className="text-xs font-medium text-slate-500 mb-2">
                  PDC Compliance by Vendor
                </p>
                <ChartContainer
                  config={vendorBarConfig}
                  className="w-full"
                  style={{
                    height: `${Math.max(180, stats.vendorDelaySummary.length * 42)}px`,
                  }}
                >
                  <BarChart
                    data={stats.vendorDelaySummary}
                    layout="vertical"
                    margin={{ left: 0, right: 24, top: 0, bottom: 0 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={140}
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
                      cursor={{ fill: "hsl(0, 0%, 0%, 0.04)" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const entry = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-2.5 shadow-md space-y-1">
                            <p className="font-medium text-slate-700">
                              {entry.name}
                            </p>
                            <div className="flex gap-3 text-xs">
                              <span className="text-emerald-700">
                                {entry.early} early
                              </span>
                              <span className="text-blue-700">
                                {entry.onTime} on time
                              </span>
                              <span className="text-red-700">
                                {entry.missed} missed
                              </span>
                            </div>
                            {entry.avgDelayDays > 0 && (
                              <p className="text-xs text-red-600">
                                Avg delay: {entry.avgDelayDays} days
                              </p>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="early"
                      stackId="pdc"
                      fill={vendorBarConfig.early.color}
                      radius={[0, 0, 0, 0]}
                      barSize={22}
                    />
                    <Bar
                      dataKey="onTime"
                      stackId="pdc"
                      fill={vendorBarConfig.onTime.color}
                      barSize={22}
                    />
                    <Bar
                      dataKey="missed"
                      stackId="pdc"
                      fill={vendorBarConfig.missed.color}
                      radius={[0, 4, 4, 0]}
                      barSize={22}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </BarChart>
                </ChartContainer>
              </div>

              {/* Right: Delay Days Bar + Vendor Cards */}
              <div className="flex flex-col gap-4">
                {/* Delay Days Bar Chart */}
                {stats.vendorDelaySummary.some((v) => v.avgDelayDays > 0) && (
                  <div className="flex flex-col">
                    <p className="text-xs font-medium text-slate-500 mb-2">
                      Average Delay Days by Vendor
                    </p>
                    <ChartContainer
                      config={delayBarConfig}
                      className="w-full"
                      style={{
                        height: `${Math.max(160, stats.vendorDelaySummary.filter((v) => v.avgDelayDays > 0).length * 42)}px`,
                      }}
                    >
                      <BarChart
                        data={stats.vendorDelaySummary.filter(
                          (v) => v.avgDelayDays > 0,
                        )}
                        layout="vertical"
                        margin={{ left: 0, right: 24, top: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          horizontal={false}
                          strokeDasharray="3 3"
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={140}
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
                          label={{
                            value: "Days",
                            position: "insideBottomRight",
                            offset: -5,
                            style: { fontSize: 10, fill: "#94a3b8" },
                          }}
                        />
                        <ChartTooltip
                          cursor={{ fill: "hsl(0, 72%, 51%, 0.06)" }}
                          content={
                            <ChartTooltipContent
                              hideLabel
                              formatter={(value, _name, item) => {
                                const entry = item.payload;
                                return (
                                  <div className="space-y-1">
                                    <p className="font-medium text-red-700">
                                      {entry.name}
                                    </p>
                                    <p className="text-sm">
                                      {String(value)} days avg delay
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Affected: {entry.equipments.join(", ")}
                                    </p>
                                  </div>
                                );
                              }}
                            />
                          }
                        />
                        <Bar
                          dataKey="avgDelayDays"
                          fill="hsl(0, 72%, 51%)"
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        >
                          {stats.vendorDelaySummary
                            .filter((v) => v.avgDelayDays > 0)
                            .map((entry) => {
                              const intensity =
                                entry.avgDelayDays > 25
                                  ? "hsl(0, 82%, 45%)"
                                  : entry.avgDelayDays > 15
                                    ? "hsl(0, 72%, 51%)"
                                    : "hsl(0, 62%, 58%)";
                              return <Cell key={entry.name} fill={intensity} />;
                            })}
                          <LabelList
                            dataKey="avgDelayDays"
                            position="right"
                            formatter={(val: number) => `${val}d`}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              fill: "#dc2626",
                            }}
                          />
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Vendor Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {stats.vendorDelaySummary.map((vendor) => {
                const hasDelays = vendor.missed > 0;
                const missedPct =
                  vendor.total > 0
                    ? Math.round((vendor.missed / vendor.total) * 100)
                    : 0;
                return (
                  <div
                    key={vendor.name}
                    className={`rounded-lg border p-3 ${
                      hasDelays
                        ? "bg-red-50/50 border-red-200"
                        : "bg-emerald-50/50 border-emerald-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p
                        className={`text-xs font-bold ${
                          hasDelays ? "text-red-800" : "text-emerald-800"
                        }`}
                      >
                        {vendor.name}
                      </p>
                      {hasDelays && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                          {missedPct}% missed
                        </span>
                      )}
                    </div>

                    {/* Mini progress bar */}
                    <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 mb-2">
                      {vendor.early > 0 && (
                        <div
                          className="bg-emerald-500 transition-all"
                          style={{
                            width: `${(vendor.early / vendor.total) * 100}%`,
                          }}
                        />
                      )}
                      {vendor.onTime > 0 && (
                        <div
                          className="bg-blue-500 transition-all"
                          style={{
                            width: `${(vendor.onTime / vendor.total) * 100}%`,
                          }}
                        />
                      )}
                      {vendor.missed > 0 && (
                        <div
                          className="bg-red-500 transition-all"
                          style={{
                            width: `${(vendor.missed / vendor.total) * 100}%`,
                          }}
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      {vendor.early > 0 && (
                        <span className="text-emerald-700">
                          <span className="font-semibold">{vendor.early}</span>{" "}
                          early
                        </span>
                      )}
                      {vendor.onTime > 0 && (
                        <span className="text-blue-700">
                          <span className="font-semibold">{vendor.onTime}</span>{" "}
                          on time
                        </span>
                      )}
                      {vendor.missed > 0 && (
                        <span className="text-red-700">
                          <span className="font-semibold">{vendor.missed}</span>{" "}
                          missed
                        </span>
                      )}
                    </div>
                    {hasDelays && vendor.avgDelayDays > 0 && (
                      <p className="mt-1.5 text-[10px] text-red-600">
                        Avg delay:{" "}
                        <span className="font-bold">
                          {vendor.avgDelayDays} days
                        </span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CRSStatsChart;
