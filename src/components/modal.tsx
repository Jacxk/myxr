"use client";

import { useModal } from "~/context/ModalContext";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "~/lib/utils";

export const Modal = () => {
  const { isOpen, content, closeModal: close } = useModal();
  const { data: session } = useSession();

  // If `authOnly` is true and the user is not authenticated, show a login prompt
  if (content?.authOnly && !session) {
    return (
      <Dialog open={isOpen} onOpenChange={close}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to perform this action.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={close}>
              Close
            </Button>
            <Button>
              <Link href="/api/auth/signin">Login</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent
        className={cn({
          "sm:max-w-[425px]": !content?.fullWidth,
          "sm:min-w-[80%] sm:min-h-[80%]": content?.fullWidth,
        })}
      >
        <DialogHeader>
          <DialogTitle>{content?.title}</DialogTitle>
          <DialogDescription>{content?.description}</DialogDescription>
        </DialogHeader>
        {content?.body}
        <DialogFooter className="gap-2">
          {!content?.closeButton && (
            <Button type="button" variant="secondary" onClick={close}>
              Close
            </Button>
          )}
          {content?.footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
