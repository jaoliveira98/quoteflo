"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Send, 
  Download, 
  ExternalLink, 
  Loader2,
  Check,
  Copy,
  Edit,
  Bell
} from "lucide-react";

interface QuoteDetailActionsProps {
  quoteId: string;
  status: string;
  accessToken: string;
  hasEmail: boolean;
  followUpCount?: number;
  lastFollowUpAt?: string | null;
}

export function QuoteDetailActions({ 
  quoteId, 
  status, 
  accessToken,
  hasEmail,
  followUpCount = 0,
  lastFollowUpAt
}: QuoteDetailActionsProps) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFollowingUp, setIsFollowingUp] = useState(false);
  const [followUpSuccess, setFollowUpSuccess] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);

  const getPublicUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/q/${accessToken}`;
    }
    return `/q/${accessToken}`;
  };

  const handleSend = async () => {
    if (!hasEmail) {
      setSendError("Customer email is required to send the quote");
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      const response = await fetch(`/api/quotes/${quoteId}/send`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send quote");
      }

      setSendSuccess(true);
      router.refresh();
      
      // Reset success state after 3 seconds
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send quote");
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadPDF = () => {
    // Open PDF in new tab for printing
    window.open(`/api/quotes/${quoteId}/pdf`, "_blank");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getPublicUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleViewPublic = () => {
    window.open(getPublicUrl(), "_blank");
  };

  const handleFollowUp = async () => {
    if (!hasEmail) {
      setFollowUpError("Customer email is required to send follow-up");
      return;
    }

    setIsFollowingUp(true);
    setFollowUpError(null);

    try {
      const response = await fetch(`/api/quotes/${quoteId}/follow-up`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send follow-up");
      }

      setFollowUpSuccess(true);
      router.refresh();
      
      // Reset success state after 3 seconds
      setTimeout(() => setFollowUpSuccess(false), 3000);
    } catch (err) {
      setFollowUpError(err instanceof Error ? err.message : "Failed to send follow-up");
    } finally {
      setIsFollowingUp(false);
    }
  };

  const canEdit = status === "draft" || status === "sent" || status === "viewed";
  const canFollowUp = (status === "sent" || status === "viewed") && hasEmail && followUpCount < 3;

  return (
    <div className="flex flex-col gap-2 ml-14 sm:ml-0">
      <div className="flex flex-wrap gap-2">
        {canEdit && (
          <Button variant="outline" asChild>
            <Link href={`/quotes/${quoteId}/edit`}>
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        )}
        
        {(status === "draft" || status === "sent" || status === "viewed") && (
          <Button 
            onClick={handleSend}
            disabled={isSending}
            variant={status === "draft" ? "default" : "outline"}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : sendSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {status === "draft" ? "Send Quote" : "Resend"}
          </Button>
        )}
        
        <Button variant="outline" onClick={handleDownloadPDF}>
          <Download className="h-4 w-4" />
          PDF
        </Button>

        <Button variant="outline" onClick={handleCopyLink}>
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </Button>

        <Button variant="outline" onClick={handleViewPublic}>
          <ExternalLink className="h-4 w-4" />
          Preview
        </Button>

        {canFollowUp && (
          <Button 
            variant="outline" 
            onClick={handleFollowUp}
            disabled={isFollowingUp}
          >
            {isFollowingUp ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : followUpSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            {followUpSuccess ? "Sent!" : `Follow-up${followUpCount > 0 ? ` (${followUpCount}/3)` : ""}`}
          </Button>
        )}
      </div>

      {sendError && (
        <p className="text-sm text-red-600">{sendError}</p>
      )}
      
      {sendSuccess && (
        <p className="text-sm text-green-600">Quote sent successfully!</p>
      )}

      {followUpError && (
        <p className="text-sm text-red-600">{followUpError}</p>
      )}
      
      {followUpSuccess && (
        <p className="text-sm text-green-600">Follow-up sent successfully!</p>
      )}
    </div>
  );
}
