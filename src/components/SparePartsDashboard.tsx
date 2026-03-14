import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArmyHeader from "./ArmyHeader";
import { SparePartHierarchySelection } from "../types";
import {
  getSparePartOrgIds,
  mockOrganizations,
  mockSpareParts,
  mockSparePartStock,
  getOrgName,
} from "../data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  PackageCheck,
  PackageX,
  IndianRupee,
  Layers,
  Boxes,
  Search,
} from "lucide-react";

const SparePartsDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [corpsId, setCorpsId] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const [emeBnId, setEmeBnId] = useState("");
  const [workshopId, setWorkshopId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [showDeadstock, setShowDeadstock] = useState(false);
  const [showRange, setShowRange] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Hierarchy options
  const corpsOptions = useMemo(
    () => mockOrganizations.filter((n) => n.level === "corps"),
    [],
  );
  const divisionOptions = useMemo(
    () =>
      mockOrganizations.filter(
        (n) => n.level === "division" && n.parentId === corpsId,
      ),
    [corpsId],
  );
  const emeBnOptions = useMemo(
    () =>
      mockOrganizations.filter(
        (n) => n.level === "eme-battalion" && n.parentId === divisionId,
      ),
    [divisionId],
  );
  const workshopOptions = useMemo(
    () =>
      mockOrganizations.filter(
        (n) => n.level === "workshop" && n.parentId === emeBnId,
      ),
    [emeBnId],
  );
  const unitOptions = useMemo(
    () =>
      mockOrganizations.filter(
        (n) => n.level === "unit" && n.parentId === workshopId,
      ),
    [workshopId],
  );

  // Cascade resets
  const handleCorpsChange = (v: string) => {
    setCorpsId(v);
    setDivisionId("");
    setEmeBnId("");
    setWorkshopId("");
    setUnitId("");
  };
  const handleDivisionChange = (v: string) => {
    setDivisionId(v);
    setEmeBnId("");
    setWorkshopId("");
    setUnitId("");
  };
  const handleEmeBnChange = (v: string) => {
    setEmeBnId(v);
    setWorkshopId("");
    setUnitId("");
  };
  const handleWorkshopChange = (v: string) => {
    setWorkshopId(v);
    setUnitId("");
  };

  const hierarchy: SparePartHierarchySelection | null = divisionId
    ? {
        corpsId,
        divisionId,
        ...(emeBnId && { emeBnId }),
        ...(workshopId && { workshopId }),
        ...(unitId && { unitId }),
      }
    : null;

  // Compute aggregated stock per spare part for the selected hierarchy
  const stockSummary = useMemo(() => {
    if (!hierarchy) return [];
    const relevantUnitIds = getSparePartOrgIds(hierarchy);

    return mockSpareParts.map((part) => {
      const rows = mockSparePartStock.filter(
        (s) =>
          s.sparePartId === part.id &&
          relevantUnitIds.includes(s.organizationId),
      );
      const inStock = rows.reduce((a, r) => a + r.inStockQty, 0);
      const deadstockQty = rows.reduce((a, r) => {
        if (r.inStockQty > 0 && r.lastIssuedDate) {
          const diff =
            new Date("2026-03-14").getTime() -
            new Date(r.lastIssuedDate).getTime();
          if (diff > 365 * 24 * 60 * 60 * 1000) return a + r.inStockQty;
        }
        return a;
      }, 0);
      const purchaseDates = rows
        .map((r) => r.lastPurchaseDate)
        .filter(Boolean) as string[];
      const issuedDates = rows
        .map((r) => r.lastIssuedDate)
        .filter(Boolean) as string[];
      const latestPurchaseDate = purchaseDates.length
        ? purchaseDates.sort().reverse()[0]
        : null;
      const latestIssuedDate = issuedDates.length
        ? issuedDates.sort().reverse()[0]
        : null;
      const isDeadstock = deadstockQty > 0;
      return {
        part,
        inStock,
        deadstockQty,
        latestPurchaseDate,
        latestIssuedDate,
        isDeadstock,
        unitCount: rows.length,
      };
    });
  }, [hierarchy]);

  // Summary cards
  const totals = useMemo(() => {
    if (!stockSummary.length) return null;
    const totalInStock = stockSummary.reduce((a, r) => a + r.inStock, 0);
    const totalDeadstock = stockSummary.reduce((a, r) => a + r.deadstockQty, 0);
    const totalCost = stockSummary.reduce(
      (a, r) => a + r.inStock * r.part.unitCost,
      0,
    );
    const range = stockSummary.filter((r) => r.inStock > 0).length;
    const depth = totalInStock;
    return {
      totalInStock,
      totalDeadstock,
      totalCost,
      range,
      depth,
    };
  }, [stockSummary]);

  // Deadstock detail rows for modal
  const deadstockItems = useMemo(() => {
    if (!hierarchy) return [];
    const relevantUnitIds = getSparePartOrgIds(hierarchy);
    const oneYearAgo = new Date("2025-03-14");

    return mockSparePartStock
      .filter(
        (s) =>
          relevantUnitIds.includes(s.organizationId) &&
          s.inStockQty > 0 &&
          s.lastIssuedDate &&
          new Date(s.lastIssuedDate) < oneYearAgo,
      )
      .map((s) => {
        const part = mockSpareParts.find((p) => p.id === s.sparePartId)!;
        const daysSinceIssue = Math.floor(
          (new Date("2026-03-14").getTime() -
            new Date(s.lastIssuedDate!).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return { ...s, part, daysSinceIssue };
      })
      .sort((a, b) => b.daysSinceIssue - a.daysSinceIssue);
  }, [hierarchy]);

  // Per-unit breakdown when a specific spare part row could be drilled into
  // For now we show aggregated view

  return (
    <div className="min-h-screen bg-muted/30">
      <ArmyHeader title="Spare Parts Dashboard" />
      <main className="mx-auto w-full max-w-7xl p-4 md:p-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Hierarchy selectors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Select Formation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {/* Corps */}
              <div className="space-y-1.5">
                <Label className="text-xs">Corps</Label>
                <Select value={corpsId} onValueChange={handleCorpsChange}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Corps" />
                  </SelectTrigger>
                  <SelectContent>
                    {corpsOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id} className="text-xs">
                        {o.name} Corps
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Division */}
              <div className="space-y-1.5">
                <Label className="text-xs">Division</Label>
                <Select
                  value={divisionId}
                  onValueChange={handleDivisionChange}
                  disabled={!corpsId}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisionOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id} className="text-xs">
                        {o.name} Div
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* EME Battalion */}
              <div className="space-y-1.5">
                <Label className="text-xs">EME Battalion</Label>
                <Select
                  value={emeBnId}
                  onValueChange={handleEmeBnChange}
                  disabled={!divisionId}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="All EME BNs" />
                  </SelectTrigger>
                  <SelectContent>
                    {emeBnOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id} className="text-xs">
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Workshop */}
              <div className="space-y-1.5">
                <Label className="text-xs">Workshop</Label>
                <Select
                  value={workshopId}
                  onValueChange={handleWorkshopChange}
                  disabled={!emeBnId}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="All Workshops" />
                  </SelectTrigger>
                  <SelectContent>
                    {workshopOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id} className="text-xs">
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Unit */}
              <div className="space-y-1.5">
                <Label className="text-xs">Unit</Label>
                <Select
                  value={unitId}
                  onValueChange={setUnitId}
                  disabled={!workshopId}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="All Units" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id} className="text-xs">
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data area — requires at least division */}
        {!hierarchy ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-lg text-muted-foreground">
              Select <span className="font-semibold">Corps</span> and{" "}
              <span className="font-semibold">Division</span> to view spare
              parts data
            </p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            {totals && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                      <IndianRupee className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Total Cost
                      </p>
                      <p className="text-xl font-bold">
                        ₹{totals.totalCost.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className="cursor-pointer transition-all hover:border-blue-400 hover:shadow-md"
                  onClick={() => setShowRange(true)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Range</p>
                      <p className="text-xl font-bold">{totals.range}</p>
                      <p className="text-[10px] text-muted-foreground">
                        types available
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="rounded-lg bg-green-100 p-2 text-green-700">
                      <Boxes className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Depth</p>
                      <p className="text-xl font-bold">{totals.depth}</p>
                      <p className="text-[10px] text-muted-foreground">
                        total qty
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className="cursor-pointer transition-all hover:border-purple-400 hover:shadow-md"
                  onClick={() => setShowDeadstock(true)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
                      <PackageX className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Deadstock Qty
                      </p>
                      <p className="text-xl font-bold">
                        {totals.totalDeadstock}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Stock table */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  Spare Parts Stock Status
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, part no, category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-8 text-xs"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Part No</TableHead>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Category</TableHead>
                        <TableHead className="text-xs">Asset</TableHead>
                        <TableHead className="text-xs text-right">
                          Unit Cost (₹)
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          In Stock
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          Value (₹)
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          Last Purchased
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          Last Issued
                        </TableHead>
                        <TableHead className="text-xs text-center">
                          Deadstock
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockSummary
                        .filter((row) => {
                          if (!searchQuery.trim()) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            row.part.name.toLowerCase().includes(q) ||
                            row.part.partNumber.toLowerCase().includes(q) ||
                            row.part.category.toLowerCase().includes(q)
                          );
                        })
                        .map((row) => {
                          return (
                            <TableRow
                              key={row.part.id}
                              className={
                                row.isDeadstock
                                  ? "bg-red-50 hover:bg-red-100/70"
                                  : ""
                              }
                            >
                              <TableCell className="text-xs font-mono">
                                {row.part.partNumber}
                              </TableCell>
                              <TableCell className="text-xs font-medium">
                                {row.part.name}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {row.part.category}
                              </TableCell>
                              <TableCell className="text-xs">
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {row.part.assetType === "generator"
                                    ? "Gen"
                                    : "Pump"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-right">
                                {row.part.unitCost.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="text-xs text-right font-medium">
                                {row.inStock}
                              </TableCell>
                              <TableCell className="text-xs text-right">
                                {(
                                  row.inStock * row.part.unitCost
                                ).toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="text-xs text-right text-muted-foreground">
                                {row.latestPurchaseDate ?? "—"}
                              </TableCell>
                              <TableCell className="text-xs text-right text-muted-foreground">
                                {row.latestIssuedDate ?? "—"}
                              </TableCell>
                              <TableCell className="text-center">
                                {row.isDeadstock ? (
                                  <Badge
                                    variant="destructive"
                                    className="text-[10px]"
                                  >
                                    Yes
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      {stockSummary.filter((row) => {
                        if (!searchQuery.trim()) return true;
                        const q = searchQuery.toLowerCase();
                        return (
                          row.part.name.toLowerCase().includes(q) ||
                          row.part.partNumber.toLowerCase().includes(q) ||
                          row.part.category.toLowerCase().includes(q)
                        );
                      }).length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={10}
                            className="text-center text-sm text-muted-foreground py-6"
                          >
                            No spare parts match "{searchQuery}"
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Per-unit breakdown when unit selected */}
            {unitId && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Unit Detail — {getOrgName(unitId)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Part No</TableHead>
                          <TableHead className="text-xs">Name</TableHead>
                          <TableHead className="text-xs text-right">
                            In Stock
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockSparePartStock
                          .filter((s) => s.organizationId === unitId)
                          .map((s) => {
                            const part = mockSpareParts.find(
                              (p) => p.id === s.sparePartId,
                            )!;
                            return (
                              <TableRow key={s.id}>
                                <TableCell className="text-xs font-mono">
                                  {part.partNumber}
                                </TableCell>
                                <TableCell className="text-xs font-medium">
                                  {part.name}
                                </TableCell>
                                <TableCell className="text-xs text-right font-medium">
                                  {s.inStockQty}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>

      {/* Range modal */}
      <Dialog open={showRange} onOpenChange={setShowRange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              Available Spare Part Types
              <Badge variant="secondary" className="ml-2 text-[10px]">
                {stockSummary.filter((r) => r.inStock > 0).length} type(s)
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Part No</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Asset</TableHead>
                  <TableHead className="text-xs text-right">
                    Total Qty
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockSummary
                  .filter((r) => r.inStock > 0)
                  .map((row) => (
                    <TableRow key={row.part.id}>
                      <TableCell className="text-xs font-mono">
                        {row.part.partNumber}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {row.part.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {row.part.category}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-[10px]">
                          {row.part.assetType === "generator" ? "Gen" : "Pump"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right font-medium">
                        {row.inStock}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deadstock modal */}
      <Dialog open={showDeadstock} onOpenChange={setShowDeadstock}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageX className="h-5 w-5 text-purple-600" />
              Deadstock — Not Issued for Over 1 Year
              <Badge variant="secondary" className="ml-2 text-[10px]">
                {deadstockItems.length} item(s)
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Part No</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Unit</TableHead>
                  <TableHead className="text-xs text-right">Qty</TableHead>
                  <TableHead className="text-xs text-right">
                    Value (₹)
                  </TableHead>
                  <TableHead className="text-xs text-right">
                    Last Purchased
                  </TableHead>
                  <TableHead className="text-xs text-right">
                    Last Issued
                  </TableHead>
                  <TableHead className="text-xs text-right">
                    Days Since Issue
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deadstockItems.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-xs font-mono">
                      {row.part.partNumber}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {row.part.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {getOrgName(row.organizationId)}
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      {row.inStockQty}
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      {(row.inStockQty * row.part.unitCost).toLocaleString(
                        "en-IN",
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-right text-muted-foreground">
                      {row.lastPurchaseDate}
                    </TableCell>
                    <TableCell className="text-xs text-right text-muted-foreground">
                      {row.lastIssuedDate}
                    </TableCell>
                    <TableCell className="text-xs text-right font-medium text-purple-700">
                      {row.daysSinceIssue}d
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SparePartsDashboard;
