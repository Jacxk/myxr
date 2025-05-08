"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import { type Metadata } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { deleteUser, useSession } from "~/lib/auth-client";
import { ErrorToast } from "~/lib/messages/toast.global";

export const metadata: Metadata = {
  title: "Delete Account",
};

export default function DeleteAccountPage() {
  const router = useRouter();

  const { data: session } = useSession();

  const [valid, setValid] = useState(false);
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValid(e.target.value === session?.user.email);
  };

  const onDeleteConfirm = async () => {
    setIsPending(true);
    if (!valid) {
      ErrorToast.invalidEmail();
      setIsPending(false);
      return;
    }

    const deleted = await deleteUser();
    if (deleted.data?.success) {
      router.push("/");
    } else {
      ErrorToast.failedToDeleteAccount();
      setIsPending(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl">
          Are you sure you want to delete your account?
        </h1>
        <p className="text-muted-foreground">
          This action is irreversible and will delete your account and all of
          your data.
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Delete Account</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to continue?</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            This action will remove your account and all the sounds you have
            created. Once your account is deleted it cannot be undone. You may
            create a new account using the same Discord account, however, it
            will be as a brand new account.
          </DialogDescription>
          <Label htmlFor="confirmation">
            Enter the email linked to your Discord account.
          </Label>
          <Input
            id="confirmation"
            className={!valid ? "border-red-500" : ""}
            placeholder="my-account@myxr.cc"
            onChange={onChange}
            autoComplete="off"
          />
          <DialogFooter>
            <Button
              disabled={!valid || isPending}
              variant="destructive"
              onClick={onDeleteConfirm}
              loading={isPending}
              loadingText="Deleting..."
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
