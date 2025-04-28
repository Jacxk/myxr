"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import { Flag, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { isTRPCError } from "~/lib/utils";
import { api } from "~/trpc/react";

function ReportModal({
  reason,
  setReason,
}: Readonly<{
  reason: string;
  setReason: (reason: string) => void;
}>) {
  return (
    <Textarea
      rows={4}
      placeholder="Type your reason here..."
      value={reason}
      onChange={(e) => setReason(e.target.value)}
    />
  );
}

function PendingButton({
  isPending,
  onClick,
}: Readonly<{
  isPending: boolean;
  onClick?: () => void;
}>) {
  return (
    <Button type="button" disabled={isPending} onClick={onClick}>
      {isPending && <Loader2 className="animate-spin" />}
      Report
    </Button>
  );
}

export function ReportButton({ id, isPreview }: Readonly<{ id: string, isPreview: boolean }>) {
  const [open, setOpen] = useState<boolean>(false);
  const [reason, setReason] = useState("");

  const { mutateAsync, isPending } = api.sound.reportSound.useMutation();

  const onOpenChange = (open: boolean) => {
    setOpen(open);
    setReason("");
  };

  const handleSubmit = () => {
    if (isPreview) {
      toast("Preview Mode: Sound Reported");
      return;
    }

    mutateAsync({ id, reason })
      .then(({ success, value, error }) => {
        if (!success) {
          if (error === "REPORT_EXISTS") {
            toast.error("You have already reported this sound.");
          } else toast.error("Failed to report sound");
          return;
        }

        if (!value?.caseId) {
          toast.error("Something went wrong");
          return;
        }

        toast("Thank you for your feedback.", {
          action: (
            <Button variant="outline">
              <Link
                href={`/user/me/reports?id=${encodeURIComponent(value.caseId)}`}
              >
                View
              </Link>
            </Button>
          ),
        });
        setOpen(false);
      })
      .catch((error: Error) => {
        if (!isTRPCError(error)) {
          toast.error("Unexpected error: " + error.name);
          console.error("Unexpected error:", error);
          return;
        }

        if (error.shape?.data.code === "BAD_REQUEST") {
          toast.error("Please provide a valid reason.");
        } else {
          toast.error(error.message);
        }
      });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Sound</DialogTitle>
            <DialogDescription>
              Please provide a reason for reporting this sound. Your feedback is
              important to us.
            </DialogDescription>
          </DialogHeader>
          <ReportModal reason={reason} setReason={setReason} />
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <PendingButton isPending={isPending} onClick={handleSubmit} />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => setOpen(true)}
          >
            <Flag />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Report</TooltipContent>
      </Tooltip>
    </>
  );
}
