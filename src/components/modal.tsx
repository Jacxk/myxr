"use client";

import { useModal } from "~/context/ModalContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

export const Modal = () => {
  const { isOpen, content, setIsOpen, closeButton, closeModal } = useModal();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{content?.title}</DialogTitle>
          <DialogDescription>{content?.description}</DialogDescription>
        </DialogHeader>
        {content?.body}
        <DialogFooter>
          {closeButton && (
            <Button type="button" variant="secondary" onClick={closeModal}>
              Close
            </Button>
          )}
          {content?.footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
