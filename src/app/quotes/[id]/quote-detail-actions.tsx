"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Send, 
  Download, 
  ExternalLink, 
  Loader2,
  Check,
  Copy,
  Edit,
  Bell,
  MoreHorizontal,
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
      
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send quote");
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadPDF = () => {
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
      
      setTimeout(() => setFollowUpSuccess(false), 3000);
    } catch (err) {
      setFollowUpError(err instanceof Error ? err.message : "Failed to send follow-up");
    } finally {
      setIsFollowingUp(false);
    }
  };

  const canEdit = status === "draft" || status === "sent" || status === "viewed";
  const canSend = status === "draft" || status === "sent" || status === "viewed";
  const canFollowUp = (status === "sent" || status === "viewed") && hasEmail && followUpCount < 3;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* Primary action: Send/Resend */}
        {canSend && (
          <Button
            onClick={handleSend}
            disabled={isSending}
            size="sm"
            className="gap-1.5"
          >
            {isSending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : sendSuccess ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {status === "draft" ? "Send" : "Resend"}
          </Button>
        )}

        {/* Edit button */}
        {canEdit && (
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <Link href={`/quotes/${quoteId}/edit`}>
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        )}

        {/* More actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleDownloadPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewPublic} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Preview
            </DropdownMenuItem>
            {canFollowUp && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleFollowUp} 
                  disabled={isFollowingUp}
                  className="gap-2"
                >
                  {isFollowingUp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : followUpSuccess ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  {followUpSuccess 
                    ? "Sent!" 
                    : `Follow-up${followUpCount > 0 ? ` (${followUpCount}/3)` : ""}`
                  }
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {sendError && (
        <Alert variant="destructive" className="text-sm">{sendError}</Alert>
      )}
      
      {sendSuccess && (
        <Alert variant="success" className="text-sm">Quote sent successfully!</Alert>
      )}

      {followUpError && (
        <Alert variant="destructive" className="text-sm">{followUpError}</Alert>
      )}
      
      {followUpSuccess && (
        <Alert variant="success" className="text-sm">Follow-up sent!</Alert>
      )}
    </div>
  );
}
