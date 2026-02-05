"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadPDFButtonProps {
  quoteId: string;
}

export function DownloadPDFButton({ quoteId }: DownloadPDFButtonProps) {
  const handleDownload = () => {
    window.open(`/api/quotes/${quoteId}/pdf/public`, "_blank");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload}>
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">Download PDF</span>
    </Button>
  );
}
