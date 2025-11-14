"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@rackd/ui/components/dialog";
import { Button } from "@rackd/ui/components/button";
import { Textarea } from "@rackd/ui/components/textarea";
import { Label } from "@rackd/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@rackd/ui/components/select";
import { useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { toast } from "sonner";

interface ReportCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commentId: Id<"comments">;
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment or Bullying" },
  { value: "hate_speech", label: "Hate Speech" },
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "misinformation", label: "Misinformation" },
  { value: "other", label: "Other" },
] as const;

export function ReportCommentDialog({ open, onOpenChange, commentId }: ReportCommentDialogProps) {
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const reportComment = useMutation(api.posts.reportComment);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason for reporting");
      return;
    }

    setIsSubmitting(true);
    try {
      await reportComment({
        commentId,
        reason,
        description: description.trim() || undefined,
      });
      toast.success("Comment reported successfully");
      onOpenChange(false);
      // Reset form
      setReason("");
      setDescription("");
    } catch (error: any) {
      console.error("Error reporting comment:", error);
      toast.error(error.message || "Failed to report comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setReason("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Comment</DialogTitle>
          <DialogDescription>
            Help us understand what's wrong with this comment. Your report will be reviewed by our team.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for reporting</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide any additional context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

