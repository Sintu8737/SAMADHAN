import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArmyHeader from "./ArmyHeader";
import { mockSpareParts, mockSparePartDemand } from "../data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Calculator,
  IndianRupee,
  Wallet,
  PackageCheck,
} from "lucide-react";

const ECHELON_LABELS: Record<string, string> = {
  "nodal-workshop": "Nodel Workshop",
  "dependant-workshop": "Dependant Workshop",
  unit: "Unit",
};

const DemandPlanner: React.FC = () => {
  const navigate = useNavigate();
  const [budgetInput, setBudgetInput] = useState("");
  const [submittedBudget, setSubmittedBudget] = useState<number | null>(null);

  const handleSubmit = () => {
    const val = Number(budgetInput.replace(/,/g, ""));
    if (val > 0) setSubmittedBudget(val);
  };

  // Build demand list with part info
  const demandList = useMemo(() => {
    return mockSparePartDemand.map((d) => {
      const part = mockSpareParts.find((p) => p.id === d.sparePartId)!;
      return { ...d, part };
    });
  }, []);

  // Allocate budget: sort by unit cost ascending (maximize qty), greedily fill
  const allocation = useMemo(() => {
    if (submittedBudget === null) return null;

    const sorted = [...demandList].sort(
      (a, b) => a.part.unitCost - b.part.unitCost,
    );

    let remaining = submittedBudget;
    const rows = sorted.map((item) => {
      const maxAffordable = Math.floor(remaining / item.part.unitCost);
      const purchaseQty = Math.min(maxAffordable, item.demandQty);
      const cost = purchaseQty * item.part.unitCost;
      remaining -= cost;
      return {
        part: item.part,
        demandQty: item.demandQty,
        purchaseQty,
        cost,
      };
    });

    const totalSpent = rows.reduce((a, r) => a + r.cost, 0);
    const totalItems = rows.reduce((a, r) => a + r.purchaseQty, 0);
    const totalDemandQty = rows.reduce((a, r) => a + r.demandQty, 0);
    const fulfilledCount = rows.filter(
      (r) => r.purchaseQty === r.demandQty,
    ).length;

    const budgetUtilization =
      submittedBudget > 0 ? (totalSpent / submittedBudget) * 100 : 0;
    const demandFulfillment =
      totalDemandQty > 0 ? (totalItems / totalDemandQty) * 100 : 0;

    return {
      rows: rows.sort((a, b) => b.purchaseQty - a.purchaseQty),
      totalSpent,
      totalItems,
      totalDemandQty,
      remaining: submittedBudget - totalSpent,
      fulfilledCount,
      budgetUtilization,
      demandFulfillment,
    };
  }, [submittedBudget, demandList]);

  return (
    <div className="min-h-screen bg-muted/30">
      <ArmyHeader title="Demand Planner" />
      <main className="mx-auto w-full max-w-7xl p-4 md:p-6 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/spare-parts")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Spare Parts
        </Button>

        {/* Budget input */}
        <Card className="border-blue-100 bg-gradient-to-r from-blue-50/50 to-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="rounded-lg bg-blue-100 p-1.5 text-blue-600">
                    <Calculator className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold">
                    Enter Available Budget
                  </h3>
                </div>
                <div className="relative max-w-sm">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g. 5,00,000"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="pl-9 h-10 text-base font-medium"
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} className="h-10 px-6">
                Plan Purchases
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {allocation && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="text-lg font-bold">
                    ₹{submittedBudget!.toLocaleString("en-IN")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-lg font-bold text-emerald-700">
                    ₹{allocation.totalSpent.toLocaleString("en-IN")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="text-lg font-bold text-amber-600">
                    ₹{allocation.remaining.toLocaleString("en-IN")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">
                    Items Purchasable
                  </p>
                  <p className="text-lg font-bold">{allocation.totalItems}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {allocation.fulfilledCount} / {demandList.length} fully met
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Budget Utilization & Demand Fulfillment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className="border-blue-100">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-blue-100 p-1.5 text-blue-600">
                        <Wallet className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-semibold">
                        Budget Utilization
                      </p>
                    </div>
                    <span className="text-lg font-bold text-blue-700">
                      {allocation.budgetUtilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-blue-100">
                    <div
                      className="h-2.5 rounded-full bg-blue-600 transition-all duration-500"
                      style={{
                        width: `${Math.min(allocation.budgetUtilization, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    ₹{allocation.totalSpent.toLocaleString("en-IN")} of ₹
                    {submittedBudget!.toLocaleString("en-IN")} utilized
                  </p>
                </CardContent>
              </Card>
              <Card className="border-emerald-100">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-emerald-100 p-1.5 text-emerald-600">
                        <PackageCheck className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-semibold">
                        Demand Fulfillment
                      </p>
                    </div>
                    <span className="text-lg font-bold text-emerald-700">
                      {allocation.demandFulfillment.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-emerald-100">
                    <div
                      className="h-2.5 rounded-full bg-emerald-600 transition-all duration-500"
                      style={{
                        width: `${Math.min(allocation.demandFulfillment, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {allocation.totalItems} of {allocation.totalDemandQty} units
                    fulfillable &middot; {allocation.fulfilledCount}/
                    {demandList.length} items fully met
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Allocation table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Purchase Plan</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Part No</TableHead>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Echelon</TableHead>
                        <TableHead className="text-xs text-right">
                          Unit Cost (₹)
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          Demand Qty
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          Purchase Qty
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          Total Cost (₹)
                        </TableHead>
                        <TableHead className="text-xs text-center">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocation.rows.map((row) => {
                        const fulfilled = row.purchaseQty === row.demandQty;
                        const partial = row.purchaseQty > 0 && !fulfilled;
                        return (
                          <TableRow
                            key={row.part.id}
                            className={
                              row.purchaseQty === 0 ? "opacity-40" : ""
                            }
                          >
                            <TableCell className="text-xs font-mono">
                              {row.part.partNumber}
                            </TableCell>
                            <TableCell className="text-xs font-medium">
                              {row.part.name}
                            </TableCell>
                            <TableCell className="text-xs">
                              <Badge variant="outline" className="text-[10px]">
                                {ECHELON_LABELS[row.part.stockingLevel]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-right">
                              {row.part.unitCost.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell className="text-xs text-right">
                              {row.demandQty}
                            </TableCell>
                            <TableCell className="text-xs text-right font-semibold">
                              {row.purchaseQty}
                            </TableCell>
                            <TableCell className="text-xs text-right">
                              {row.cost.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell className="text-center">
                              {fulfilled ? (
                                <Badge className="bg-emerald-600 text-[10px]">
                                  Full
                                </Badge>
                              ) : partial ? (
                                <Badge className="bg-amber-500 text-[10px]">
                                  Partial
                                </Badge>
                              ) : (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px]"
                                >
                                  None
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default DemandPlanner;
