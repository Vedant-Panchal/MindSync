import { useState } from "react";
import {
  ArrowUpDown,
  Calendar,
  DollarSign,
  IndianRupee,
  Percent,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useKiteHoldings } from "@/hooks/kite";
import { apiFetch } from "@/utils/pythonAPIFetch";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TaxationResponse, TaxBreakdown } from "@/models/Taxation";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

export default function TaxationPage() {
  const [sortColumn, setSortColumn] =
    useState<keyof TaxBreakdown>("tax_amount");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { data: portfolioHoldings } = useKiteHoldings();
  const { data, isLoading } = useQuery({
    queryKey: ["taxation"],
    queryFn: async () => {
      const obj = { data: portfolioHoldings };
      return apiFetch<TaxationResponse>("/api/taxation", {
        method: "POST",
        body: JSON.stringify(obj),
      });
    },
    enabled: !!portfolioHoldings,
  });

  const handleSort = (column: keyof TaxBreakdown) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (isLoading) return <LoadingSpinner />;
  if (!data) return <EmptyState />;

  const sortedBreakdown = [...data.breakdown].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const chartData = [
    { name: "LTCG", value: data.total.ltcg },
    { name: "STCG", value: data.total.stcg },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tax Liability
            </CardTitle>
            <IndianRupee className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.total.liability)}
            </div>
            <p className="text-muted-foreground text-xs">
              Combined STCG and LTCG tax liability
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Short-Term Capital Gains Tax
            </CardTitle>
            <Badge variant="destructive" className="ml-2 font-bold">
              STCG
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.total.stcg)}
            </div>
            <p className="text-muted-foreground text-xs">
              Tax rate: {data.rate.stcg}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Long-Term Capital Gains Tax
            </CardTitle>
            <Badge
              variant="secondary"
              className="ml-2 bg-green-500 font-bold text-white"
            >
              LTCG
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.total.ltcg)}
            </div>
            <p className="text-muted-foreground text-xs">
              Tax rate: {data.rate.ltcg}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Breakdown Visualization</CardTitle>
          <CardDescription>
            Visual representation of your tax liability distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer
              config={{
                STCG: {
                  label: "Short-Term Capital Gains",
                  color: "rgba(200, 0, 0, 0.25)",

                },
                LTCG: {
                  label: "Long-Term Capital Gains",
                  color: "rgba(0, 200, 0, 0.25)",
                },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Bar
                    dataKey="value"
                    name="Amount"
                    fill="var(--color-STCG)"
                    radius={[4, 4, 0, 0]}
                    fillOpacity={0.9}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax Rates Overview</CardTitle>
          <CardDescription>
            Current applicable tax rates for your capital gains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                <Percent className="text-primary h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm leading-none font-medium">
                  Short-Term Capital Gains Rate
                </p>
                <p className="text-muted-foreground text-sm">
                  {data.rate.stcg}
                </p>
                <p className="text-muted-foreground text-xs">
                  Applied to holdings less than 1 year
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                <Calendar className="text-primary h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm leading-none font-medium">
                  Long-Term Capital Gains Rate
                </p>
                <p className="text-muted-foreground text-sm">
                  {data.rate.ltcg}
                </p>
                <p className="text-muted-foreground text-xs">
                  Applied to holdings more than 1 year
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sortedBreakdown.map((holding, index) =>
          holding.advice ? (
            <Alert key={index}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="ml-2 font-medium">
                {holding.stock}
              </AlertTitle>
              <AlertDescription className="mt-1 ml-2">
                {holding.advice}
              </AlertDescription>
            </Alert>
          ) : null,
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Tax Breakdown</CardTitle>
          <CardDescription>
            Breakdown of tax liability by individual stock holdings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stock</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("tax_type")}
                    className="flex items-center gap-1 px-0"
                  >
                    Type
                    {sortColumn === "tax_type" && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("holding_period")}
                    className="flex items-center gap-1 px-0"
                  >
                    Holding Period (days)
                    {sortColumn === "holding_period" && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("total_gain")}
                    className="flex items-center gap-1 px-0"
                  >
                    Total Gain
                    {sortColumn === "total_gain" && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("tax_amount")}
                    className="flex items-center gap-1 px-0"
                  >
                    Tax Amount
                    {sortColumn === "tax_amount" && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBreakdown.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.stock}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant={
                              item.tax_type === "LTCG"
                                ? "secondary"
                                : "destructive"
                            }
                            className="cursor-help"
                          >
                            {item.tax_type}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {item.tax_type === "LTCG"
                              ? "Long-Term Capital Gains"
                              : "Short-Term Capital Gains"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>{item.holding_period}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {formatCurrency(item.total_gain)}
                      {item.total_gain > 0 ? (
                        <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                      ) : item.total_gain < 0 ? (<TrendingDown className="ml-2 size-4 text-red-500" />) : null}
                    </div>
                  </TableCell>
                  <TableCell>{item.tax_rate.replace("%", "")}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(item.tax_amount > 0 ? item.tax_amount : 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
