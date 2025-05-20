"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface UseNavigationWarningProps {
  shouldWarn: boolean;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const useNavigationWarning = ({
  shouldWarn,
  message = "You have unsaved changes. Are you sure you want to leave?",
  onConfirm,
  onCancel,
}: UseNavigationWarningProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );

  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (shouldWarn) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    },
    [shouldWarn, message],
  );

  const handlePopState = useCallback(
    (e: PopStateEvent) => {
      if (shouldWarn) {
        e.preventDefault();
        setPendingNavigation(pathname);
        setIsOpen(true);
      }
    },
    [shouldWarn, pathname],
  );

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
    onConfirm?.();
  }, [pendingNavigation, router, onConfirm]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setPendingNavigation(null);
    onCancel?.();
  }, [onCancel]);

  useEffect(() => {
    if (!shouldWarn) return;

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    window.history.pushState(null, "", pathname);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [shouldWarn, handleBeforeUnload, handlePopState, pathname]);

  useEffect(() => {
    if (!shouldWarn) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (
        anchor?.href &&
        !anchor.href.startsWith(window.location.origin + pathname)
      ) {
        e.preventDefault();
        e.stopPropagation();
        const href = anchor.href.replace(window.location.origin, "");
        setPendingNavigation(href);
        setIsOpen(true);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [shouldWarn, pathname]);

  return {
    Dialog: (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
  };
};
