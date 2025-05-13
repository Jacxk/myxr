"use client";

import { SoundReport } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "~/components/ui/button";

export const columns: ColumnDef<SoundReport>[] = [
  {
    accessorKey: "sound.name",
    header: "Sound",
  },
  {
    accessorKey: "user.name",
    header: "User",
  },
  {
    accessorKey: "actionTaken",
    header: "Action Taken",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      const isAscending = column.getIsSorted() === "asc";
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(isAscending)}
        >
          Date
          {isAscending ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
  },
];
