"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { Flag, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
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
import { useSession } from "~/lib/auth-client";
import { ErrorToast } from "~/lib/messages/toast.global";
import { isTRPCError } from "~/lib/utils";
import { useTRPC } from "~/trpc/react";

function handleNotSuccess(error?: string) {
  if (error === "REPORT_EXISTS") {
    ErrorToast.soundAlreadyReported();
  } else toast.error("Failed to report sound");
}

function handleError(error: unknown) {
  if (!isTRPCError(error)) {
    ErrorToast.internal();
    console.error("Unexpected error:", error);
    return;
  }

  if (error.shape?.data.code === "BAD_REQUEST") {
    ErrorToast.invalidReport();
  }
}

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

export function ReportButton({
  id,
  isPreview,
}: {
  id: string;
  isPreview?: boolean;
}) {
  const api = useTRPC();
  const { data: session } = useSession();
  const posthog = usePostHog();
  const router = useRouter();

  const [open, setOpen] = useState<boolean>(false);
  const [reason, setReason] = useState("");

  const { mutate, isPending } = useMutation(
    api.sound.reportSound.mutationOptions({
      onSuccess({ success, value, error }) {
        posthog.capture("Sound reported", {
          soundId: id,
          success,
          error,
          ...value,
        });

        if (!success) {
          handleNotSuccess(error);
          return;
        }

        if (!value?.caseId) {
          ErrorToast.internal();
          return;
        }

        toast("Thank you for your feedback.", {
          action: {
            label: "View",
            onClick: () => {
              router.push(
                `/user/me/reports?id=${encodeURIComponent(value.caseId)}`,
              );
            },
          },
        });
        setOpen(false);
      },
      onError(error) {
        handleError(error);
      },
    }),
  );

  const onOpenChange = (open: boolean) => {
    if (open && !session) {
      ErrorToast.login();
      return;
    }

    setOpen(open);
    setReason("");
  };

  const handleSubmit = () => {
    if (!session) {
      ErrorToast.login();
      return;
    }

    if (isPreview) {
      toast("Preview Mode: Sound Reported");
      return;
    }

    mutate({ id, reason });
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
            onClick={() => onOpenChange(true)}
          >
            <Flag />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Report</TooltipContent>
      </Tooltip>
    </>
  );
}
