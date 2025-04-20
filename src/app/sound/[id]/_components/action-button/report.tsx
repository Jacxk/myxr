"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import { Flag, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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

export function ReportButton({ id }: Readonly<{ id: string }>) {
  const [open, setOpen] = useState<boolean>(false);
  const [reason, setReason] = useState("");

  const { mutate, data, isPending, error, isError } =
    api.sound.reportSound.useMutation();

  const handleSubmit = () => {
    mutate({ id, reason });
  };

  useEffect(() => {
    if (!data) return;
    if (!data.success) {
      if (data.error === "REPORT_EXISTS") {
        toast.error("You have already reported this sound.");
      } else toast.error("Failed to report sound");
      return;
    }

    toast("Sound reported successfully!", {
      description: "Thank you for your feedback.",
    });
    setReason("");
    setOpen(false);
  }, [data?.success]);

  useEffect(() => {
    if (!isError) return;
    if (error?.data?.code === "BAD_REQUEST") {
      toast.error("Please provide a valid reason.");
    } else {
      toast.error("Failed to report sound.");
    }
  }, [isError, error]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
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
