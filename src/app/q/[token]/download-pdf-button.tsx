"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadPDFButtonProps {
  token: string;
}

export function DownloadPDFButton({ token }: DownloadPDFButtonProps) {
  const handleDownload = () => {
    window.open(`/api/quotes/pdf/public?token=${encodeURIComponent(token)}`, "_blank");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} aria-label="Download PDF">
      <Download className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline" aria-hidden="true">Download PDF</span>
    </Button>
  );
}
