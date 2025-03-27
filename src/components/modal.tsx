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
          <DialogFooter>
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{content?.title}</DialogTitle>
          <DialogDescription>{content?.description}</DialogDescription>
        </DialogHeader>
        {content?.body}
        <DialogFooter>
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
