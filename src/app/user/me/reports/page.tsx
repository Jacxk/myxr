"use client";
import type { Sound, SoundReport } from "@prisma/client";
import { DialogDescription } from "@radix-ui/react-dialog";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
import { useTRPC } from "~/trpc/react";

import { useQuery } from "@tanstack/react-query";

type Report = SoundReport & { sound: Sound };

export default function MeReportsPage() {
  const api = useTRPC();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { data: reports, isPending } = useQuery(
    api.user.reports.queryOptions(),
  );
  const [selectedReport, setSelectedReport] = useState<Report | undefined>();

  const clearSelected = (open: boolean) => {
    if (!open) {
      setSelectedReport(undefined);
      router.replace(pathname);
    }
  };

  const selectReport = (report: Report) => {
    router.replace(`${pathname}?id=${encodeURIComponent(report.id)}`);
  };

  useEffect(() => {
    const id = searchParams.get("id");
    const report = reports?.filter((r) => r.id === id) ?? [];

    if (id && report?.length > 0) setSelectedReport(report[0]);
  }, [searchParams, reports]);

  return (
    <>
      <Dialog open={!!selectedReport} onOpenChange={clearSelected}>
        <DialogContent>
          <DialogHeader className="gap-4">
            <DialogTitle>Report for {selectedReport?.sound.name}</DialogTitle>
            <DialogDescription asChild>
              <div className="text-muted-foreground">
                <div className="flex justify-between">
                  <span>Status</span>
                  <span>{selectedReport?.actionTaken}</span>
                </div>
                {selectedReport?.actionTaken !== "IN_PROGRESS" && (
                  <pre>{selectedReport?.actionText}</pre>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="reason" className="text-muted-foreground">
              Reason Provided:
            </Label>
            <Textarea
              rows={4}
              value={selectedReport?.reason}
              id="reason"
              className="resize-none"
              disabled
            />
          </div>
          <div className="flex justify-between text-muted-foreground">
            <div>{selectedReport?.id}</div>
            <div>{selectedReport?.createdAt.toDateString()}</div>
          </div>
        </DialogContent>
      </Dialog>
      <Table>
        <TableCaption>
          {isPending && "Loading reports..."}
          {reports?.length === 0 ? "No reports have been made" : ""}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-80">Sound</TableHead>
            <TableHead>Action Taken</TableHead>
            <TableHead className="text-right">Date Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports?.map((report) => (
            <TableRow key={report.id} onClick={() => selectReport(report)}>
              <TableCell>{report.sound.name}</TableCell>
              <TableCell>{report.actionTaken}</TableCell>
              <TableCell className="text-right">
                {report.createdAt.toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
