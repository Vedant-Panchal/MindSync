import { useLoaderData } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Markdown from "react-markdown";
import { Book, FileText, Loader2, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SummaryResponse } from "@/models/Regulations";
import { apiFetch } from "@/utils/pythonAPIFetch";

export default function SEBIRegulationsPage() {
  const data = useLoaderData({ from: "/user/sebi-regulations" });
  const [selectedRegulation, setSelectedRegulation] = useState<string | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to extract title from URL
  const extractTitle = (url: string): string => {
    try {
      // Extract the part between the last / and .html
      const urlPath = url.split("/").pop() || "";
      const fileName = urlPath.split(".html")[0];

      // Extract the regulation name from the file name
      // Example: securities-and-exchange-board-of-india-stock-brokers-regulations-1992-last-amended-on-february-10-2025-_92446
      const parts = fileName.split("-");

      // Find the word "regulations" and extract the main title
      const regulationsIndex = parts.findIndex(
        (part) => part === "regulations",
      );
      if (regulationsIndex > 0) {
        // Get the parts before "regulations" and capitalize them
        const titleParts = parts.slice(0, regulationsIndex + 1);
        const mainTitle = titleParts
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");

        // Extract the year if available
        const yearMatch = parts[regulationsIndex + 1]?.match(/\d{4}/);
        const year = yearMatch ? yearMatch[0] : "";

        // Extract amendment date if available
        const amendmentIndex = parts.findIndex((part) => part === "amended");
        let amendmentDate = "";
        if (amendmentIndex > 0 && amendmentIndex + 3 < parts.length) {
          amendmentDate = `${parts[amendmentIndex + 2]} ${parts[amendmentIndex + 3]}`;
        }

        return `${mainTitle} ${year}${amendmentDate ? ` (Amended: ${amendmentDate})` : ""}`;
      }

      // Fallback to a simpler approach if the above doesn't work
      return fileName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
        .replace(/_\d+$/, ""); // Remove the _number at the end
    } catch (error) {
      // Return the URL as fallback
      return url;
    }
  };

  // React Query hook for fetching the summary
  const {
    data: summaryData,
    isLoading,
    error,
  } = useQuery<SummaryResponse>({
    queryKey: ["regulation-summary", selectedRegulation],
    queryFn: async () => {
      if (!selectedRegulation) throw new Error("No regulation selected");
      const encodedUrl = encodeURIComponent(selectedRegulation);
      const response = await apiFetch<SummaryResponse>(
        `/api/regulations/summarize/${encodedUrl}`,
      );
      return response;
    },
    enabled: !!selectedRegulation && isModalOpen,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const handleSummarize = (url: string) => {
    setSelectedRegulation(url);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          {/* <CardTitle className="text-2xl">SEBI Regulations</CardTitle> */}
          <CardDescription>
            Latest regulations from the Securities and Exchange Board of India
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.regulations.map((url, index) => (
              <div key={index} className="flex flex-col space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <FileText className="text-primary mt-0.5 h-5 w-5" />
                    <div>
                      <h3 className="font-medium">{extractTitle(url)}</h3>
                      <p className="text-muted-foreground text-sm break-all">
                        {url}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSummarize(url)}
                      className="whitespace-nowrap"
                    >
                      <Book className="mr-2 h-4 w-4" />
                      Summarize
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="whitespace-nowrap"
                    >
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View
                      </a>
                    </Button>
                  </div>
                </div>
                {index < data.regulations.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Drawer open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DrawerContent>
          <div className="no-scrollbar mx-auto max-h-[80vh] w-full max-w-4xl overflow-y-auto no-scrollbar scroll-smooth">
            <DrawerHeader>
              <DrawerTitle>Regulation Summary</DrawerTitle>
              <DrawerDescription>
                {selectedRegulation && extractTitle(selectedRegulation)}
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-6">
              {isLoading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
              )}

              {error && (
                <div className="bg-destructive/15 text-destructive rounded-md p-4">
                  Failed to load summary. Please try again.
                </div>
              )}

              {!isLoading && !error && summaryData && (
                <div className="space-y-4">
                  <div className="bg-muted rounded-md p-4">
                    <Markdown>{summaryData.content}</Markdown>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    <p>
                      Source:{" "}
                      <a
                        href={summaryData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary underline"
                      >
                        {summaryData.url}
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
